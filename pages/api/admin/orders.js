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
  if (!config) return { allowed: ['orders'], mapping: { orders: 'orders' } };
  
  const tablesFromTabs = config.admin?.tabs?.map(tab => tab.table).filter(Boolean) || [];
  const allowed = [...new Set(['orders', ...tablesFromTabs])];
  
  // Get actual DB table names from database.tables config
  const dbTables = config.database?.tables || {};
  const mapping = {};
  
  allowed.forEach(key => {
    mapping[key] = dbTables[key] || key;
  });
  
  return { allowed, mapping };
}

export default async function handler(req, res) {
  try {
    // Verify admin authentication
    const adminVerification = verifyAdminRequest(req);
    if (!adminVerification.valid) {
      return res.status(401).json({ message: adminVerification.error });
    }

    const { table: tableKey, id } = req.query;

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
        error: `Table "${table}" does not exist in the database.`,
        hint: 'Create the orders table first using dbquries/orders.sql'
      });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return handleGet(req, res, table);
      case 'PUT':
        return handlePut(req, res, table, id);
      case 'DELETE':
        return handleDelete(req, res, table, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in orders API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function handleGet(req, res, table) {
  try {
    const query = `SELECT * FROM ${table} ORDER BY id DESC`;
    const result = await pool.query(query);

    return res.status(200).json({ 
      orders: result.rows,
      count: result.rows.length,
      table: table
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch orders',
      details: error.message 
    });
  }
}

async function handlePut(req, res, table, id) {
  try {
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required for update' });
    }

    const { customer_name, customer_email, total, status, special_instructions } = req.body;

    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (customer_name !== undefined) { updates.push(`customer_name = $${paramCount++}`); values.push(customer_name); }
    if (customer_email !== undefined) { updates.push(`customer_email = $${paramCount++}`); values.push(customer_email); }
    if (total !== undefined) { updates.push(`total = $${paramCount++}`); values.push(total); }
    if (status !== undefined) { updates.push(`status = $${paramCount++}`); values.push(status); }
    if (special_instructions !== undefined) { updates.push(`special_instructions = $${paramCount++}`); values.push(special_instructions); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE ${table} SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({ 
      order: result.rows[0],
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ 
      error: 'Failed to update order',
      details: error.message 
    });
  }
}

async function handleDelete(req, res, table, id) {
  try {
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required for deletion' });
    }

    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({ 
      message: 'Order deleted successfully',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ 
      error: 'Failed to delete order',
      details: error.message 
    });
  }
}
