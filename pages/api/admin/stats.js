import { verifyAdminRequest } from '../../../lib/jwtMiddleware';
import { pool } from '../../../lib/dbQueries';

const STAT_TABLES = [
  { key: 'services', label: 'Services', icon: '✂️' },
  { key: 'appointments', label: 'Appointments', icon: '📅' },
  { key: 'customers', label: 'Customers', icon: '🧑‍💼' },
  { key: 'staff', label: 'Staff', icon: '👨‍💼' },
  { key: 'reviews', label: 'Reviews', icon: '⭐' },
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'career_applications', label: 'Applications', icon: '📝' },
  { key: 'gallery', label: 'Gallery', icon: '🖼️' },
  { key: 'contact_submissions', label: 'Contacts', icon: '📧' },
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const auth = verifyAdminRequest(req);
  if (!auth.valid) {
    return res.status(401).json({ message: auth.error });
  }

  try {
    const stats = await Promise.all(
      STAT_TABLES.map(async ({ key, label, icon }) => {
        try {
          const result = await pool.query(`SELECT COUNT(*) as count FROM ${key}`);
          return { key, label, icon, count: parseInt(result.rows[0].count, 10) };
        } catch {
          return { key, label, icon, count: null };
        }
      })
    );

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
