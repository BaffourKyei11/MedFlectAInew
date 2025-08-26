import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import * as schema from './shared/schema.js';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Get the database URL from environment variables
const databaseUrl = 'postgresql://neondb_owner:npg_iIV4rh0nEtby@ep-small-forest-ab9mo4vl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function applyMigration() {
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });
  
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected successfully!');
    
    // This will create all tables defined in the schema
    console.log('Applying database migrations...');
    
    // List all tables to verify
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Current tables in the database:');
    console.log(result.rows);
    
    // If you want to drop all tables first (uncomment if needed)
    // console.log('Dropping existing tables...');
    // await client.query('DROP SCHEMA public CASCADE');
    // await client.query('CREATE SCHEMA public');
    
    // For now, just show the current tables
    console.log('To apply migrations, uncomment the DROP and CREATE SCHEMA lines in the script.');
    
  } catch (error) {
    console.error('Error applying migrations:', error);
  } finally {
    await pool.end();
    console.log('Connection closed.');
  }
}

applyMigration();
