import { pool } from '../../lib/dbQueries';
import stylistsJson from '../../data/stylists.json';

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
        availability,
        display_order,
        metadata
       FROM staff
       WHERE status = 'active'
       ORDER BY display_order ASC, id ASC`
    );
    // If DB returns rows use them, otherwise fall back to JSON file
    const data = result.rows.length > 0 ? result.rows : stylistsJson;
    return res.status(200).json(data);
  } catch (err) {
    // DB not yet seeded — serve from local JSON file
    console.warn('GET /api/staff: DB unavailable, serving from stylists.json');
    return res.status(200).json(stylistsJson);
  }
}
