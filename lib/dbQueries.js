import { Pool } from 'pg';

// Initialize database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Get active services for public display
 * Returns services in frontend-friendly format
 */
export async function getActiveServices() {
  const result = await pool.query(
    `SELECT 
      service_id as id,
      name,
      description,
      duration,
      price_min,
      price_max,
      category,
      images
    FROM services 
    WHERE status = 'active' 
    ORDER BY display_order, category, name`
  );
  return result.rows;
}

/**
 * Get all services (for admin panel)
 */
export async function getAllServices() {
  const result = await pool.query(
    `SELECT * FROM services 
     ORDER BY display_order, category, name`
  );
  return result.rows;
}

/**
 * Generic database pool export for other queries
 */
export { pool };
