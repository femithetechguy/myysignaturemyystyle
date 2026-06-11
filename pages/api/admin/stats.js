import { verifyAdminRequest } from '../../../lib/jwtMiddleware';
import { pool } from '../../../lib/dbQueries';

// key = tab ID used for navigation; table = actual DB table name
const STAT_TABLES = [
  { key: 'services',     table: 'services',           label: 'Services',     icon: '✂️' },
  { key: 'appointments', table: 'appointments',        label: 'Appointments', icon: '📅' },
  { key: 'customers',    table: 'customers',           label: 'Customers',    icon: '🧑‍💼' },
  { key: 'staff',        table: 'staff',               label: 'Staff',        icon: '👨‍💼' },
  { key: 'reviews',      table: 'reviews',             label: 'Reviews',      icon: '⭐' },
  { key: 'applications', table: 'career_applications', label: 'Applications', icon: '📝' },
  { key: 'gallery',      table: 'gallery',             label: 'Gallery',      icon: '🖼️' },
  { key: 'contacts',     table: 'contact_submissions', label: 'Contacts',     icon: '📧' },
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
      STAT_TABLES.map(async ({ key, table, label, icon }) => {
        try {
          const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
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
