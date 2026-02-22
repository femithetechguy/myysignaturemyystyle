import jwt from 'jsonwebtoken';

export function verifyJWT(token) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

export function generateJWT(username) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export function verifyAdminRequest(req) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return { valid: false, error: 'Invalid token' };
  }

  return { valid: true, user: decoded };
}
