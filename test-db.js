import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_iIV4rh0nEtby@ep-small-forest-ab9mo4vl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    const result = await client.query('SELECT $1::text as message', ['Hello, Neon!']);
    console.log('Query result:', result.rows[0].message);
    await client.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
