require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('=== Checking Tables and Schemas ===\n');
    
    // Get all tables with their schemas
    const tablesQuery = `
      SELECT 
        table_schema,
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_catalog = 'starter_app'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `;
    
    const result = await pool.query(tablesQuery);
    
    console.log('All tables in starter_app database:');
    result.rows.forEach(row => {
      console.log(`  ${row.table_schema}.${row.table_name} (${row.table_type})`);
    });
    
    console.log('\n=== Checking products table specifically ===\n');
    
    const productsSchemaQuery = `
      SELECT table_schema 
      FROM information_schema.tables 
      WHERE table_name = 'products';
    `;
    
    const schemaResult = await pool.query(productsSchemaQuery);
    
    if (schemaResult.rows.length > 0) {
      console.log(`products table found in schema: ${schemaResult.rows[0].table_schema}`);
    } else {
      console.log('products table not found in information_schema');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkSchema();
