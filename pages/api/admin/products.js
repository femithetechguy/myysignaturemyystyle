import { Pool } from 'pg';
import { verifyAdminRequest } from '../../../lib/jwtMiddleware';
import { promises as fs } from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get config with table mappings
async function getConfig() {
  try {
    const configPath = path.join(process.cwd(), 'config', 'admin.json');
    const fileContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    return null;
  }
}

// Get allowed table keys and their DB table names from config
async function getTableMapping() {
  const config = await getConfig();
  if (!config) return { allowed: ['products'], mapping: { products: 'products' } };
  
  // Get table keys from tabs
  const tablesFromTabs = config.admin?.tabs?.map(tab => tab.table).filter(Boolean) || [];
  const allowed = [...new Set(['products', ...tablesFromTabs])];
  
  // Get actual DB table names from database.tables config
  const dbTables = config.database?.tables || {};
  const mapping = {};
  
  allowed.forEach(key => {
    // If database.tables has a mapping, use it; otherwise use the key as-is
    mapping[key] = dbTables[key] || key;
  });
  
  return { allowed, mapping };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Verify admin authentication
  const adminVerification = verifyAdminRequest(req);
  if (!adminVerification.valid) {
    return res.status(401).json({ message: adminVerification.message });
  }

  // Get table key from query or body, default to 'products'
  const tableKey = req.query.table || req.body.table || 'products';
  
  // Get table mapping from config
  const { allowed, mapping } = await getTableMapping();
  
  if (!allowed.includes(tableKey)) {
    return res.status(400).json({ message: `Invalid table: ${tableKey}. Allowed: ${allowed.join(', ')}` });
  }
  
  // Get actual DB table name from mapping
  const table = mapping[tableKey];

  // Verify the table actually exists in the database
  try {
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `;
    const tableExistsResult = await pool.query(tableExistsQuery, [table]);
    
    if (!tableExistsResult.rows[0].exists) {
      return res.status(404).json({ 
        message: `Table "${table}" does not exist in the database.`,
        hint: 'Check your config/admin.json - the "table" value must match an actual database table.'
      });
    }
  } catch (dbError) {
    console.error('Database connection error:', dbError.message);
    return res.status(500).json({ 
      message: 'Failed to verify table existence',
      error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
    });
  }

  try {
    // GET operation - fetch all products
    if (req.method === 'GET') {
      const query = `
        SELECT 
          product_id, 
          product_name, 
          category, 
          description, 
          price, 
          duration_minutes, 
          staff_required, 
          difficulty_level, 
          required_materials, 
          availability_status, 
          is_active, 
          date_created, 
          date_updated
        FROM ${table} 
        ORDER BY product_id ASC
      `;
      
      const result = await pool.query(query);
      return res.status(200).json(result.rows);
    }

    // CREATE operation
    if (req.method === 'POST' && req.body.action === 'create') {
      const {
        product_name,
        category,
        description,
        price,
        duration_minutes,
        staff_required,
        difficulty_level,
        required_materials,
        availability_status,
        is_active
      } = req.body;

      if (!product_name || !category) {
        return res.status(400).json({ message: 'product_name and category are required' });
      }

      const insertQuery = `
        INSERT INTO products (
          product_name, category, description, price, duration_minutes, 
          staff_required, difficulty_level, required_materials, 
          availability_status, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;

      const result = await pool.query(insertQuery, [
        product_name,
        category,
        description || '',
        price || '[{"name":"Standard","amount":0}]',
        duration_minutes || 30,
        staff_required || 1,
        difficulty_level || 'Intermediate',
        required_materials || '[]',
        availability_status || 'Available',
        is_active !== undefined ? is_active : true
      ]);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: result.rows[0]
      });
    }

    // UPDATE operation
    if (req.method === 'PUT' || (req.method === 'POST' && req.body.action === 'update')) {
      const {
        product_id,
        product_name,
        category,
        description,
        price,
        duration_minutes,
        staff_required,
        difficulty_level,
        required_materials,
        availability_status,
        is_active
      } = req.body;

      if (!product_id) {
        return res.status(400).json({ message: 'product_id is required' });
      }

      // Update the product
      const updateQuery = `
        UPDATE products 
        SET 
          product_name = $1,
          category = $2,
          description = $3,
          price = $4,
          duration_minutes = $5,
          staff_required = $6,
          difficulty_level = $7,
          required_materials = $8,
          availability_status = $9,
          is_active = $10,
          date_updated = NOW()
        WHERE product_id = $11
        RETURNING *;
      `;

      const result = await pool.query(updateQuery, [
        product_name,
        category,
        description,
        price || '[]',
        duration_minutes,
        staff_required || 1,
        difficulty_level,
        required_materials || '[]',
        availability_status,
        is_active !== undefined ? is_active : true,
        product_id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: result.rows[0]
      });
    }

    // DELETE operation
    if (req.method === 'DELETE' || (req.method === 'POST' && req.body.action === 'delete')) {
      const { product_id } = req.body;

      if (!product_id) {
        return res.status(400).json({ message: 'product_id is required' });
      }

      // Soft delete - set is_active to false instead of hard delete
      const deleteQuery = `
        UPDATE products 
        SET is_active = false, date_updated = NOW()
        WHERE product_id = $1
        RETURNING product_id, product_name;
      `;

      const result = await pool.query(deleteQuery, [product_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        product: result.rows[0]
      });
    }

    // Invalid method
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'POST']);
    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in products API:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
