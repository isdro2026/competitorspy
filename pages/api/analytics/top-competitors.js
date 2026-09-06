import { getTopCompetitors } from '@/lib/analytics';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, limit } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const topCompetitors = await getTopCompetitors(userId, limit ? parseInt(limit, 10) : 10);
    return res.status(200).json(topCompetitors);
  } catch (error) {
    console.error('Top competitors get error:', error);
    return res.status(500).json({ error: 'Failed to load top competitors' });
  }
}
