import { connectDB, User } from '../../lib/db.js';
import { verifyAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  try {
    const auth = verifyAuth(req);
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
      const user = await User.findById(auth.userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}