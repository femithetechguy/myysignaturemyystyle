import { verifyAdminRequest } from '../../../lib/jwtMiddleware';
import { pool } from '../../../lib/dbQueries';

export default async function handler(req, res) {
  const adminVerification = verifyAdminRequest(req);
  if (!adminVerification.valid) {
    return res.status(401).json({ message: adminVerification.error });
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT setting_key, setting_value, description, updated_at
         FROM business_settings
         WHERE setting_key IN ('salon_policies', 'booking_disclaimer')
         ORDER BY setting_key`
      );
      // Return as { salon_policies: {...}, booking_disclaimer: {...} }
      const data = {};
      result.rows.forEach(row => {
        data[row.setting_key] = {
          value: row.setting_value,
          description: row.description,
          updated_at: row.updated_at,
        };
      });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(data);
    } catch (error) {
      console.error('Policies GET error:', error.message);
      return res.status(500).json({ error: 'Failed to load policies', details: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { setting_key, setting_value } = req.body;
      if (!setting_key || !setting_value) {
        return res.status(400).json({ error: 'setting_key and setting_value are required' });
      }
      const allowed = ['salon_policies', 'booking_disclaimer'];
      if (!allowed.includes(setting_key)) {
        return res.status(400).json({ error: `Invalid setting_key. Allowed: ${allowed.join(', ')}` });
      }
      const result = await pool.query(
        `UPDATE business_settings
         SET setting_value = $1::jsonb, updated_at = CURRENT_TIMESTAMP
         WHERE setting_key = $2
         RETURNING setting_key, setting_value, updated_at`,
        [JSON.stringify(setting_value), setting_key]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Setting "${setting_key}" not found. Run the seed SQL first.` });
      }
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Policies PUT error:', error.message);
      return res.status(500).json({ error: 'Failed to save policies', details: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
