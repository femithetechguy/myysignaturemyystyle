require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('=== Testing Database Connection ===\n');
    
    // Show database name from connection string
    const url = new URL(process.env.DATABASE_URL);
    const dbName = url.pathname.substring(1); // Remove leading slash
    console.log('Database Name:', dbName);
    console.log('Host:', url.hostname);
    console.log('');
    
    // Test connection
    const client = await pool.connect();
    console.log('✓ Connected to database\n');
    
    // List all tables
    console.log('=== Available Tables ===');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Tables:', tablesResult.rows.map(r => r.table_name).join(', '));
    console.log('');
    
    // Query admins table
    console.log('=== Admins Table ===');
    try {
      const adminsResult = await client.query(`
        SELECT id, username, email, is_active, created_at 
        FROM admins 
        ORDER BY created_at DESC
      `);
      console.log(`Found ${adminsResult.rows.length} records:`);
      adminsResult.rows.forEach(row => {
        console.log(JSON.stringify(row, null, 2));
      });
    } catch (err) {
      console.log('Error querying admins:', err.message);
    }
    console.log('');
    
    // Query users table
    console.log('=== Users Table ===');
    try {
      const usersResult = await client.query(`
        SELECT * 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 100
      `);
      console.log(`Found ${usersResult.rows.length} records:`);
      usersResult.rows.forEach(row => {
        console.log(JSON.stringify(row, null, 2));
      });
    } catch (err) {
      console.log('Error querying users:', err.message);
    }
    console.log('');
    
    // Query products table
    console.log('=== Products Table ===');
    try {
      const productsResult = await client.query(`
        SELECT * 
        FROM products 
        ORDER BY created_at DESC 
        LIMIT 100
      `);
      console.log(`Found ${productsResult.rows.length} records:`);
      productsResult.rows.forEach(row => {
        console.log(JSON.stringify(row, null, 2));
      });
    } catch (err) {
      console.log('Error querying products:', err.message);
    }
    
    client.release();
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Make sure DATABASE_URL environment variable is set');
  } finally {
    await pool.end();
  }
}

testDatabase();
