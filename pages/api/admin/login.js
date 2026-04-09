import { pool } from '../../../lib/dbQueries';
import { compare } from 'bcryptjs';
import { generateJWT } from '../../../lib/jwtMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, password_hash, is_active FROM admins WHERE username = $1',
      [username]
    );

    const admin = result.rows[0];

    // Use same message for missing user and wrong password (prevents user enumeration)
    if (!admin || !admin.is_active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateJWT(admin.username);
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
