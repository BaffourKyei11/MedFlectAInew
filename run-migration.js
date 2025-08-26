import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Get the database URL from environment variables
const databaseUrl = 'postgresql://neondb_owner:npg_iIV4rh0nEtby@ep-small-forest-ab9mo4vl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function runMigration() {
  try {
    console.log('Connecting to the database...');
    const pool = new Pool({ connectionString: databaseUrl });
    
    // Test the connection
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    // List all tables in the database
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Existing tables in the database:');
    console.log(result.rows);
    
    await client.release();
    await pool.end();
    
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
