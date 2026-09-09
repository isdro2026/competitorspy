// pages/api/generate-caption-preview.js
import Anthropic from '@anthropic-ai/sdk';
import { fetchArticleText } from '@/lib/articleText';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

  const { inputType, inputValue } = req.body;
    if (!inputValue || !inputValue.trim()) {
          return res.status(400).json({ success: false, error: 'Niche or URL is required' });
    }
    if (!['niche', 'url'].includes(inputType)) {
          return res.status(400).json({ success: false, error: 'inputType must be niche or url' });
    }

  try {
        let prompt;

      if (inputType === 'url') {
              let articleText;
              try {
                        articleText = await fetchArticleText(inputValue.trim());
              } catch (fetchErr) {
                        return res.status(400).json({ success: false, error: 'Could not read that URL: ' + fetchErr.message });
              }

          prompt = 'Here is the text content of a web page:\n\n"""\n' + articleText + '\n"""\n\nWrite a professional LinkedIn post based on this content, focused on business value or industry angle, minimal hashtags. Return ONLY a JSON object (no markdown, no explanation) with this exact shape:\n{ "caption": "the LinkedIn post text" }';
      } else {
              prompt = 'You are a marketing content generator for the niche: "' + inputValue.trim() + '".\n\nWrite a professional LinkedIn post for this niche, focused on business value or industry angle, minimal hashtags. Return ONLY a JSON object (no markdown, no explanation) with this exact shape:\n{ "caption": "the LinkedIn post text" }';
      }

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const message = await anthropic.messages.create({
                model: 'claude-sonnet-4-5',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }],
        });

      const raw = message.content[0].text.trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        if (!parsed || !parsed.caption) {
                throw new Error('Could not parse generated caption');
        }

      return res.status(200).json({ success: true, caption: parsed.caption });
  } catch (err) {
        console.error('generate-caption-preview error:', err);
        return res.status(500).json({ success: false, error: err.message });
  }
}
