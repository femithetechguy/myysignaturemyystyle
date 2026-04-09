import { pool } from '../../lib/dbQueries';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await pool.query(
      `SELECT
        review_id,
        customer_name AS name,
        rating,
        review_text   AS text,
        title,
        is_featured
       FROM reviews
       WHERE status = 'approved'
       ORDER BY is_featured DESC, created_at DESC`
    );

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
}
