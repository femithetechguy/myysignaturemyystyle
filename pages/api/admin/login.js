import { generateJWT } from '../../../lib/jwtMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  // Read from environment variables (supports 2 users)
  const users = [
    { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD },
    { username: process.env.ADMIN2_USERNAME, password: process.env.ADMIN2_PASSWORD }
  ].filter(u => u.username && u.password);

  // Authentication with environment variables (replace with database lookup in production)
  const validUser = users.find(u => u.username === username && u.password === password);
  if (validUser) {
    const token = generateJWT(username);
    return res.status(200).json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}
