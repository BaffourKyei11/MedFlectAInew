import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import logger from './utils/logger';

neonConfig.webSocketConstructor = ws;

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  const error = new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
  logger.error('Database configuration error:', { error: error.message });
  throw error;
}

// Database connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  maxUses: parseInt(process.env.DB_MAX_USES || '7500', 10),
};

// Create connection pool with error handling
let pool: Pool;

try {
  pool = new Pool(dbConfig);
  
  // Test the connection
  pool.on('connect', (client) => {
    logger.info('New database client connected', {
      clientId: 'connected',
      timestamp: new Date().toISOString(),
    });
  });

  pool.on('error', (err, client) => {
    logger.error('Database pool error', {
      error: err.message,
      clientId: 'error',
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
  });

  pool.on('remove', (client) => {
    logger.info('Database client removed from pool', {
      clientId: 'removed',
      timestamp: new Date().toISOString(),
    });
  });

} catch (error) {
  logger.error('Failed to create database pool', {
    error: error instanceof Error ? error.message : 'Unknown error',
    config: { ...dbConfig, connectionString: '***REDACTED***' },
    timestamp: new Date().toISOString(),
  });
  throw error;
}

// Enhanced database instance with error handling
export const db = drizzle({ client: pool, schema });

// Database health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number;
  error?: string;
  details: {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  };
}> {
  const startTime = Date.now();
  
  try {
    // Test basic query
    await db.execute('SELECT 1');
    const latency = Date.now() - startTime;
    
    // Get pool statistics
    const poolStats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
    
    // Determine health status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (latency > 1000) {
      status = 'degraded';
    }
    
    if (poolStats.waitingCount > poolStats.totalCount * 0.5) {
      status = 'degraded';
    }
    
    if (poolStats.totalCount === 0) {
      status = 'unhealthy';
    }
    
    return {
      status,
      latency,
      details: poolStats,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    logger.error('Database health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      latency,
      timestamp: new Date().toISOString(),
    });
    
    return {
      status: 'unhealthy',
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      },
    };
  }
}

// Graceful shutdown function
export async function closeDatabase(): Promise<void> {
  try {
    logger.info('Closing database connections...');
    await pool.end();
    logger.info('Database connections closed successfully');
  } catch (error) {
    logger.error('Error closing database connections', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

// Enhanced query wrapper with error handling
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  context: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      logger.warn('Slow database query detected', {
        context,
        duration,
        timestamp: new Date().toISOString(),
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Database query failed', {
      context,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    // Re-throw with additional context
    if (error instanceof Error) {
      error.message = `Database query failed in ${context}: ${error.message}`;
    }
    
    throw error;
  }
}

// Transaction wrapper with error handling
export async function executeTransaction<T>(
  transactionFn: () => Promise<T>,
  context: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await transactionFn();
    const duration = Date.now() - startTime;
    
    logger.info('Database transaction completed successfully', {
      context,
      duration,
      timestamp: new Date().toISOString(),
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Database transaction failed', {
      context,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    // Re-throw with additional context
    if (error instanceof Error) {
      error.message = `Database transaction failed in ${context}: ${error.message}`;
    }
    
    throw error;
  }
}

// Export the pool for direct access if needed
export { pool };

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception, shutting down gracefully...', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  
  try {
    await closeDatabase();
  } catch (dbError) {
    logger.error('Error closing database during shutdown', {
      error: dbError instanceof Error ? dbError.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
  
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  logger.error('Unhandled rejection, shutting down gracefully...', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString(),
  });
  
  try {
    await closeDatabase();
  } catch (dbError) {
    logger.error('Error closing database during shutdown', {
      error: dbError instanceof Error ? dbError.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
  
  process.exit(1);
});
