const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_iIV4rh0nEtby@ep-small-forest-ab9mo4vl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to the database!');
    
    // List all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in the database:');
    console.log(result.rows);
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await client.end();
  }
}

testConnection();
