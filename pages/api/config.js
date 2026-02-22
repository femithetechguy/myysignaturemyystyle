import { verifyJWT } from '../../lib/jwtMiddleware';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !verifyJWT(token)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const configPath = path.join(process.cwd(), 'config', 'admin.json');

  if (req.method === 'GET') {
    // Read config fresh from disk (not cached import)
    try {
      const fileContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(fileContent);
      return res.status(200).json(config);
    } catch (error) {
      console.error('Config read error:', error);
      return res.status(500).json({ message: 'Failed to read config' });
    }
  }

  if (req.method === 'PUT') {
    // Update config (demonstration - in production, validate before saving)
    try {
      const updatedConfig = req.body;
      
      // Save to file
      await fs.writeFile(
        configPath,
        JSON.stringify(updatedConfig, null, 2),
        'utf-8'
      );

      return res.status(200).json({ 
        message: 'Config updated successfully',
        config: updatedConfig 
      });
    } catch (error) {
      console.error('Config update error:', error);
      return res.status(500).json({ message: 'Failed to update config' });
    }
  }
}
