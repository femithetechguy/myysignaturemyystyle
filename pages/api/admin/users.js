import { verifyAdminRequest } from '../../../lib/jwtMiddleware';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize database connection
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
  if (!config) return { allowed: ['admins'], mapping: { admins: 'admins' } };
  
  const tablesFromTabs = config.admin?.tabs?.map(tab => tab.table).filter(Boolean) || [];
  const allowed = [...new Set(['admins', 'users', ...tablesFromTabs])];
  
  // Get actual DB table names from database.tables config
  const dbTables = config.database?.tables || {};
  const mapping = {};
  
  allowed.forEach(key => {
    mapping[key] = dbTables[key] || key;
  });
  
  return { allowed, mapping };
}

export default async function handler(req, res) {
  // Verify admin authentication first
  const adminVerification = verifyAdminRequest(req);
  if (!adminVerification.valid) {
    return res.status(401).json({ message: adminVerification.error });
  }

  const { table: tableKey, id } = req.query;

  // Handle different HTTP methods
  if (req.method === 'GET') {
    return handleGet(req, res, tableKey);
  } else if (req.method === 'PUT') {
    return handleUpdate(req, res, tableKey, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, tableKey, id);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req, res, tableKey) {
  try {
    const { table: tableKey } = req.query;

    // Get table mapping from config
    const { allowed, mapping } = await getTableMapping();
    
    if (!tableKey || !allowed.includes(tableKey)) {
      return res.status(400).json({ 
        message: `Invalid table name: "${tableKey}". Allowed tables: ${allowed.join(', ')}` 
      });
    }
    
    // Get actual DB table name from mapping
    const table = mapping[tableKey];

    // Verify the table actually exists in the database
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
        message: `Table "${table}" does not exist in the database. Please check your config/admin.json configuration.`,
        hint: 'Verify the "table" value in admin.tabs matches an actual database table name.'
      });
    }

    // Fetch users from the specified table
    let query;
    if (table === 'admins') {
      query = `
        SELECT id, username, email, is_active, created_at 
        FROM ${table} 
        ORDER BY created_at DESC
      `;
    } else if (table === 'products') {
      query = `
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
    } else {
      // For other tables, adjust the query as needed
      query = `
        SELECT * FROM ${table} 
        ORDER BY created_at DESC LIMIT 100
      `;
    }

    const result = await pool.query(query);
    
    // Prevent caching to ensure fresh data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ 
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleUpdate(req, res, tableKey, id) {
  try {
    if (!id) {
      return res.status(400).json({ error: 'ID is required for update' });
    }

    // Get table mapping
    const { allowed, mapping } = await getTableMapping();
    
    if (!tableKey || !allowed.includes(tableKey)) {
      return res.status(400).json({ 
        error: `Invalid table name: "${tableKey}"` 
      });
    }
    
    const table = mapping[tableKey];
    const data = req.body;
    
    // Remove id fields and timestamps from update data
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;
    Object.keys(updateData).forEach(key => {
      if (key.endsWith('_id') && key !== 'service_id') delete updateData[key];
    });
    
    // Build UPDATE query dynamically
    const fields = Object.keys(updateData);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updateData[field]);
    
    // Find the ID column
    const idColumn = Object.keys(data).find(k => k.endsWith('_id') || k === 'id') || 'id';
    values.push(id);
    
    const query = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${idColumn} = $${values.length} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to update item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleDelete(req, res, tableKey, id) {
  try {
    if (!id) {
      return res.status(400).json({ error: 'ID is required for delete' });
    }

    // Get table mapping
    const { allowed, mapping } = await getTableMapping();
    
    if (!tableKey || !allowed.includes(tableKey)) {
      return res.status(400).json({ 
        error: `Invalid table name: "${tableKey}"` 
      });
    }
    
    const table = mapping[tableKey];
    
    // First, get the item to find its ID column
    const checkQuery = `SELECT * FROM ${table} LIMIT 1`;
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Table is empty' });
    }
    
    // Find the ID column
    const columns = Object.keys(checkResult.rows[0]);
    const idColumn = columns.find(k => k.endsWith('_id') || k === 'id') || 'id';
    
    const query = `DELETE FROM ${table} WHERE ${idColumn} = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    return res.status(200).json({ message: 'Item deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('Delete error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to delete item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
