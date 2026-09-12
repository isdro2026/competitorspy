
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabaseAdmin';

function extractJson(raw) {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { niche, productId, keyword } = req.body;
  if (!niche || !niche.trim()) {
    return res.status(400).json({ success: false, error: 'Niche is required' });
  }

  try {
    let product = null;
    if (productId) {
      const { data } = await supabase.from('products').select('*').eq('id', productId).single();
      product = data || null;
    }

    const productInstruction = product
      ? `\n\nWeave in a natural, non-pushy mention of this product as a recommendation somewhere in the blog post and in the LinkedIn/Facebook/Pinterest captions, referring to it by name: "${product.name}". Do not invent a URL yourself and do not add an image reference -- the product photo and link will be shown separately alongside your text.`
      : '';

    // Pull real keyword data for Google/Microsoft Ads, since those platforms are
    // keyword-targeted (unlike social captions, which just need a niche/topic).
    let keywordData = [];
    const seedKeyword = (keyword && keyword.trim()) || niche;
    try {
      const login = process.env.DATAFORSEO_LOGIN;
      const password = process.env.DATAFORSEO_PASSWORD;
      if (login && password) {
        const auth = Buffer.from(`${login}:${password}`).toString('base64');
        const kwRes = await fetch(
          'https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live',
          {
            method: 'POST',
            headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
            body: JSON.stringify([
              { keywords: [seedKeyword], location_code: 2840, language_code: 'en', limit: 8 },
            ]),
          }
        );
        const kwJson = await kwRes.json();
        const items = kwJson?.tasks?.[0]?.result?.[0]?.items || [];
        keywordData = items
          .map((item) => ({
            keyword: item.keyword,
            searchVolume: item.keyword_info?.search_volume ?? null,
            cpc: item.keyword_info?.cpc ?? null,
            competition: item.keyword_info?.competition_level ?? null,
          }))
          .filter((k) => k.keyword);
      }
    } catch (kwErr) {
      console.error('generate-content: keyword lookup failed, falling back to niche only:', kwErr.message);
    }

    const keywordInstruction = keywordData.length
      ? `\n\nFor "Google Ads" and "Microsoft Ads" specifically, base the copy on this real keyword data (pick the most relevant term(s) for the headline/description, favor higher search volume where it fits naturally):\n${keywordData
          .map(
            (k) =>
              `- "${k.keyword}"${k.searchVolume != null ? ` (search volume: ${k.searchVolume}` : ''}${
                k.cpc != null ? `, avg CPC: ${k.cpc}` : ''
              }${k.searchVolume != null ? ')' : ''}`
          )
          .join('\n')}\nWork the primary keyword naturally into the headline and description so it stays relevant for search Quality Score -- do not just append it as a hashtag.`
      : keyword && keyword.trim()
      ? `\n\nFor "Google Ads" and "Microsoft Ads" specifically, build the copy tightly around this target keyword: "${keyword.trim()}". Work it naturally into the headline and description.`
      : '';

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const currentYear = new Date().getFullYear();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are a marketing content generator for the niche: "${niche}". The current year is ${currentYear} -- if any title or copy references a specific year, always use ${currentYear}, never an earlier year.${productInstruction}${keywordInstruction}

Generate marketing content and return ONLY a JSON object (no markdown, no explanation, no code fences) with this exact shape:
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
    {"platform": "Instagram", "caption": "a caption with relevant hashtags, casual and visual tone"},
    {"platform": "Facebook", "caption": "a slightly longer, conversational caption suited to Facebook's older, community-driven audience"},
    {"platform": "Twitter/X", "caption": "a short punchy caption under 280 characters"},
    {"platform": "TikTok", "caption": "a short, trend-aware caption with hashtags"},
    {"platform": "LinkedIn", "caption": "a professional-toned post suited to LinkedIn, focused on business value or industry angle, minimal hashtags"},
    {"platform": "Pinterest", "caption": "a descriptive, keyword-rich caption suited to Pinterest search and discovery"},
    {"platform": "Google Ads", "caption": "a search ad in the format 'Headline: ...' on one line and 'Description: ...' on the next, no hashtags, keyword-focused"},
    {"platform": "Microsoft Ads", "caption": "a search ad in the format 'Headline: ...' on one line and 'Description: ...' on the next, no hashtags, keyword-focused"}
  ]
}

Keep every field concise so the whole response stays well under the token limit. Return the JSON object only, nothing before or after it.`,
      }],
    });

    const raw = message.content[0].text;
    const content = extractJson(raw);

    if (!content) {
      console.error('generate-content: could not parse. stop_reason=', message.stop_reason, 'raw length=', raw.length, 'raw snippet=', raw.slice(0, 300));
      throw new Error('Could not parse generated content. Please try again.');
    }

    return res.status(200).json({ success: true, data: content, product, keywordData });
  } catch (error) {
    console.error('generate-content error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
