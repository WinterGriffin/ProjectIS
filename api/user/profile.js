import { connectDB, User } from '../../lib/db.js';
import { verifyAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = verifyAuth(req);
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    const { weight, height, age, gender } = req.body;
    const user = await User.findByIdAndUpdate(
      auth.userId,
      { profile: { weight, height, age, gender } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}