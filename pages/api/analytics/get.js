import { getUserAnalytics } from '@/lib/analytics';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const analytics = await getUserAnalytics(userId);
    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Analytics get error:', error);
    return res.status(500).json({ error: 'Failed to load analytics' });
  }
}
