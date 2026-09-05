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
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are a marketing content generator for the niche: "${niche}".

Generate marketing content and return ONLY a JSON object (no markdown, no explanation) with this exact shape:
{
  "adCopy": {
    "headline": "short punchy ad headline, under 40 characters",
    "primaryText": "1-2 sentence ad body copy for Facebook/Instagram ads",
    "cta": "a short call-to-action button label, e.g. Shop Now"
  },
  "blogPost": {
    "title": "an SEO-friendly blog post title for this niche",
    "content": "a 3-paragraph blog post intro/body, written in a helpful, engaging tone, plain text with paragraphs separated by newlines"
  },
  "socialCaptions": [
    {"platform": "Instagram", "caption": "a caption with relevant hashtags"},
    {"platform": "Twitter/X", "caption": "a short punchy caption under 280 characters"},
    {"platform": "TikTok", "caption": "a short, trend-aware caption with hashtags"}
  ]
}`,
      }],
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const content = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!content) {
      throw new Error('Could not parse generated content');
    }

    return res.status(200).json({ success: true, data: content });
  } catch (error) {
    console.error('generate-content error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
