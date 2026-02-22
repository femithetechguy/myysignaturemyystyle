require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkProducts() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('=== Products Table Structure ===\n');
    
    // Get table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `;
    const structure = await pool.query(structureQuery);
    console.log('Columns:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n=== Products Data ===\n');
    
    // Get all products
    const productsQuery = 'SELECT * FROM products ORDER BY product_id';
    const products = await pool.query(productsQuery);
    
    console.log(`Total products: ${products.rows.length}\n`);
    
    if (products.rows.length > 0) {
      products.rows.forEach((product, index) => {
        console.log(`${index + 1}. ${product.product_name} (ID: ${product.product_id})`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Status: ${product.availability_status}`);
        console.log(`   Active: ${product.is_active}`);
        console.log('');
      });
    } else {
      console.log('No products found in the table.');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkProducts();
