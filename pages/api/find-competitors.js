import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { niche } = req.body;
  if (!niche || !niche.trim()) {
    return res.status(400).json({ success: false, error: 'Niche is required' });
  }

  try {
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `top ${niche} companies brands`,
        limit: 15,
      }),
    });

    const searchResult = await searchResponse.json();
    if (!searchResult.success) {
      throw new Error('Search failed: ' + (searchResult.error || 'unknown error'));
    }

    const searchSummary = (searchResult.data || [])
      .map((r, i) => `${i + 1}. ${r.title}\nURL: ${r.url}\n${r.description || ''}`)
      .join('\n\n');

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Here are web search results for the niche "${niche}":\n\n${searchSummary}\n\nFrom these results, identify the top 10 real companies/brands that are actual competitors in this niche. Return ONLY a JSON array (no markdown, no explanation) with this exact shape:\n[{"name": "Company Name", "website": "https://example.com", "industry": "${niche}"}]\n\nOnly include real, distinct companies with real website URLs found in the results above. If fewer than 10 genuine competitors are present, return fewer rather than inventing any.`,
      }],
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const competitors = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return res.status(200).json({ success: true, data: competitors });
  } catch (error) {
    console.error('find-competitors error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
