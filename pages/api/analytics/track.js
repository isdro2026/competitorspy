// pages/api/analytics/track.js
import { 
  trackPageView, 
  trackFeatureUsage, 
  trackCompetitorSearch,
  trackScraper,
  trackContentGeneration 
} from '@/lib/analytics';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, eventType, data } = req.body;

  if (!userId || !eventType) {
    return res.status(400).json({ error: 'Missing userId or eventType' });
  }

  try {
    switch (eventType) {
      case 'page_view':
        await trackPageView(userId, data.page, data.metadata);
        break;

      case 'feature_usage':
        await trackFeatureUsage(userId, data.feature, data.data);
        break;

      case 'competitor_search':
        await trackCompetitorSearch(userId, data.competitorName, data.results);
        break;

      case 'scraper':
        await trackScraper(userId, data.url, data.success, data.errorMessage);
        break;

      case 'content_generation':
        await trackContentGeneration(userId, data.type, data.success);
        break;

      default:
        return res.status(400).json({ error: 'Unknown event type' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return res.status(500).json({ error: 'Failed to track event' });
  }
}
