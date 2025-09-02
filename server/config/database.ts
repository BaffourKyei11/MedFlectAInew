// Use dynamic imports to avoid type issues at compile time
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import { env } from './env';
import logger from '../utils/logger';

// Simple WebSocket implementation that will be used only if needed
class SimpleWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState: number;
  onopen: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: any }) => void) | null = null;

  constructor(url: string) {
    this.readyState = SimpleWebSocket.CONNECTING;
    // In a real implementation, you would create a WebSocket connection here
    // For now, we'll simulate a successful connection
    setTimeout(() => {
      this.readyState = SimpleWebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data: any) {
    // In a real implementation, send data through the WebSocket
    console.log('WebSocket send:', data);
  }

  close() {
    this.readyState = SimpleWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = SimpleWebSocket.CLOSED;
      if (this.onclose) this.onclose();
    }, 0);
  }
}

// Configure WebSocket for Neon
const neonConfig = {
  webSocketConstructor: SimpleWebSocket as any,
};

// Database connection configuration
interface DatabaseConfig {
  connectionString: string;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  maxUses: number;
}

const dbConfig: DatabaseConfig = {
  connectionString: env.DATABASE_URL,
  max: 10, // Maximum number of clients the pool should contain
  min: 2,  // Minimum number of clients to keep in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
  maxUses: 7500, // Maximum number of times a client can be used before being closed
};

// Create connection pool with error handling
let pool: Pool;

try {
  pool = new Pool({
    connectionString: dbConfig.connectionString,
    max: dbConfig.max,
    min: dbConfig.min,
    idleTimeoutMillis: dbConfig.idleTimeoutMillis,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
  });
  
  // Test the connection
  pool.on('connect', (client: PoolClient) => {
    logger.debug('New database client connected', {
      clientId: client?.processID,
      timestamp: new Date().toISOString(),
    });
  });

  pool.on('error', (err: Error, client?: PoolClient) => {
    logger.error('Database pool error', {
      error: err.message,
      clientId: client?.processID,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
  });
} catch (error) {
  logger.error('Failed to create database pool', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
}

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Database health check
export async function checkDatabaseHealth() {
  const start = Date.now();
  
  try {
    // Simple query to check database connection
    const result = await pool.query('SELECT NOW() as now');
    const latency = Date.now() - start;
    
    return {
      status: 'healthy' as const,
      latency,
      timestamp: result.rows[0]?.now || new Date().toISOString(),
      details: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    logger.info('Closing database pool...');
    await pool.end();
    logger.info('Database pool closed successfully');
  } catch (error) {
    logger.error('Error closing database pool', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

// Enhanced query executor with error handling
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  context: string
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    
    logger.debug('Database query executed', {
      context,
      duration,
      success: true,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('Database query failed', {
      context,
      duration,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    throw new Error(`Database operation failed (${context}): ${errorMessage}`);
  }
}

// Transaction wrapper with error handling
export async function executeTransaction<T>(
  transactionFn: (tx: any) => Promise<T>,
  context: string
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await transactionFn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Transaction failed', {
      context,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    throw new Error(`Transaction failed (${context}): ${errorMessage}`);
  } finally {
    client.release();
  }
}

// Handle process termination
const handleShutdown = async (signal: string) => {
  logger.info(`${signal} received. Closing database pool...`);
  await closeDatabase();
  process.exit(0);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default pool;
