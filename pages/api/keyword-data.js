export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { keyword } = req.body;
  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ success: false, error: 'Keyword or niche is required' });
  }

  try {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    const auth = Buffer.from(`${login}:${password}`).toString('base64');

    const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          keywords: [keyword],
          location_code: 2840,
          language_code: 'en',
          limit: 20,
        },
      ]),
    });

    const result = await response.json();

    if (result.status_code !== 20000) {
      throw new Error(result.status_message || 'DataForSEO request failed');
    }

    const items = result.tasks?.[0]?.result?.[0]?.items || [];

    const keywords = items.map((item) => ({
      keyword: item.keyword,
      searchVolume: item.keyword_info?.search_volume ?? null,
      cpc: item.keyword_info?.cpc ?? null,
      competition: item.keyword_info?.competition_level ?? null,
    }));

    return res.status(200).json({ success: true, data: keywords });
  } catch (error) {
    console.error('keyword-data error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
