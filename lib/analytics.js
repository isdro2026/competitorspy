// lib/analytics.js
import { supabase } from '@/lib/supabase';

export async function trackPageView(userId, page, metadata = {}) {
  try {
    await supabase
      .from('page_views')
      .insert([
        {
          userId,
          page,
          timestamp: new Date().toISOString(),
          metadata,
        },
      ]);
  } catch (error) {
    console.error('Page view tracking error:', error);
  }
}

export async function trackFeatureUsage(userId, feature, data = {}) {
  try {
    await supabase
      .from('feature_usage')
      .insert([
        {
          userId,
          feature,
          timestamp: new Date().toISOString(),
          data,
        },
      ]);
  } catch (error) {
    console.error('Feature usage tracking error:', error);
  }
}

export async function trackCompetitorSearch(userId, competitorName, results = {}) {
  try {
    await supabase
      .from('competitor_searches')
      .insert([
        {
          userId,
          competitorName,
          timestamp: new Date().toISOString(),
          resultCount: results.count || 0,
          metadata: results,
        },
      ]);
  } catch (error) {
    console.error('Competitor search tracking error:', error);
  }
}

export async function trackScraper(userId, url, success = true, errorMessage = null) {
  try {
    await supabase
      .from('scraper_logs')
      .insert([
        {
          userId,
          url,
          success,
          errorMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
  } catch (error) {
    console.error('Scraper tracking error:', error);
  }
}

export async function trackContentGeneration(userId, type, success = true) {
  try {
    await supabase
      .from('content_generation')
      .insert([
        {
          userId,
          type,
          success,
          timestamp: new Date().toISOString(),
        },
      ]);
  } catch (error) {
    console.error('Content generation tracking error:', error);
  }
}

export async function getUserAnalytics(userId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Page views
    const { data: pageViews } = await supabase
      .from('page_views')
      .select('page, timestamp')
      .eq('userId', userId)
      .gte('timestamp', startDate.toISOString());

    // Feature usage
    const { data: featureUsage } = await supabase
      .from('feature_usage')
      .select('feature, timestamp')
      .eq('userId', userId)
      .gte('timestamp', startDate.toISOString());

    // Competitor searches
    const { data: searches } = await supabase
      .from('competitor_searches')
      .select('competitorName, timestamp, resultCount')
      .eq('userId', userId)
      .gte('timestamp', startDate.toISOString());

    // Scraper activity
    const { data: scraperLogs } = await supabase
      .from('scraper_logs')
      .select('url, success, timestamp')
      .eq('userId', userId)
      .gte('timestamp', startDate.toISOString());

    return {
      pageViews: pageViews || [],
      featureUsage: featureUsage || [],
      searches: searches || [],
      scraperActivity: scraperLogs || [],
      summary: {
        totalPageViews: pageViews?.length || 0,
        totalFeatures: featureUsage?.length || 0,
        totalSearches: searches?.length || 0,
        scraperSuccess: scraperLogs?.filter(l => l.success).length || 0,
      },
    };
  } catch (error) {
    console.error('Get analytics error:', error);
    return { error: error.message };
  }
}

export async function getTopCompetitors(userId, limit = 10) {
  try {
    const { data } = await supabase
      .from('competitor_searches')
      .select('competitorName')
      .eq('userId', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    // Count occurrences
    const counted = {};
    data?.forEach(item => {
      counted[item.competitorName] = (counted[item.competitorName] || 0) + 1;
    });

    return Object.entries(counted)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Get top competitors error:', error);
    return [];
  }
}
