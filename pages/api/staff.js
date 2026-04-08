import { pool } from '../../lib/dbQueries';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await pool.query(
      `SELECT
        id,
        staff_id,
        name,
        title,
        phone,
        bio,
        photo,
        instagram_handle,
        booking_slug,
        specialties,
        display_order
       FROM staff
       WHERE status = 'active'
       ORDER BY display_order ASC, id ASC`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('GET /api/staff error:', err);
    return res.status(500).json({ message: 'Failed to load stylists' });
  }
}
