// pages/api/scrape-competitor.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, competitorId } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Call Firecrawl API
    const firecrawlResponse = await axios.post('https://api.firecrawl.dev/v0/scrape', {
      url: url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const scrapedData = firecrawlResponse.data;

    // Extract keywords from content
    const content = scrapedData.markdown || '';
    const keywords = extractKeywords(content);

    // Return scraped data
    return res.status(200).json({
      success: true,
      data: {
        url: url,
        title: scrapedData.metadata?.title || '',
        content: content,
        keywords: keywords,
        html: scrapedData.html,
        metadata: scrapedData.metadata
      }
    });

  } catch (error) {
    console.error('Scraping error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to scrape website',
      details: error.message 
    });
  }
}

// Simple keyword extraction function
function extractKeywords(text) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Count word frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Get top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}
