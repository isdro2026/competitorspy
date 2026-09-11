// pages/api/generate-caption-preview.js
import Anthropic from '@anthropic-ai/sdk';
import { fetchArticleText } from '@/lib/articleText';
import { supabase } from '@/lib/supabase';

function appendProductLine(caption, product) {
  if (!product) return caption;
  return `${caption}\n\nCheck it out: ${product.name} -> ${product.product_url}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { inputType, inputValue, productId } = req.body;
  if (!inputValue || !inputValue.trim()) {
    return res.status(400).json({ success: false, error: 'Niche or URL is required' });
  }
  if (!['niche', 'url'].includes(inputType)) {
    return res.status(400).json({ success: false, error: 'inputType must be niche or url' });
  }

  try {
    let product = null;
    if (productId) {
      const { data } = await supabase.from('products').select('*').eq('id', productId).single();
      product = data || null;
    }

    let prompt;
    const productLine = product
      ? `\n\nNaturally mention this product as a recommendation, and refer to it by name so a reader would want to click the link that follows the post: "${product.name}". Do not invent a URL yourself, do not add hashtags for it, just mention it naturally in one line near the end.`
      : '';

    if (inputType === 'url') {
      let articleText;
      try {
        articleText = await fetchArticleText(inputValue.trim());
      } catch (fetchErr) {
        return res.status(400).json({ success: false, error: `Could not read that URL: ${fetchErr.message}` });
      }

      prompt = `Here is the text content of a web page:

"""
${articleText}
"""

Write a professional LinkedIn post based on this content, focused on business value or industry angle, minimal hashtags.${productLine} Return ONLY a JSON object (no markdown, no explanation) with this exact shape:
{ "caption": "the LinkedIn post text" }`;
    } else {
      prompt = `You are a marketing content generator for the niche: "${inputValue.trim()}".

Write a professional LinkedIn post for this niche, focused on business value or industry angle, minimal hashtags.${productLine} Return ONLY a JSON object (no markdown, no explanation) with this exact shape:
{ "caption": "the LinkedIn post text" }`;
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/{[sS]*}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    if (!parsed || !parsed.caption) {
      throw new Error('Could not parse generated caption');
    }

    const finalCaption = appendProductLine(parsed.caption, product);

    return res.status(200).json({ success: true, caption: finalCaption });
  } catch (err) {
    console.error('generate-caption-preview error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
