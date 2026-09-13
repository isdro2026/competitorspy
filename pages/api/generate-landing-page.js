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
    const currentYear = new Date().getFullYear();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Generate a complete, self-contained HTML landing page for a product/business in the niche: "${niche}". The current year is ${currentYear} -- if the page includes a copyright line or any other year reference, always use ${currentYear}, never an earlier year.

Requirements:
- Single HTML file with inline <style> CSS only, no external scripts, fonts, or images (use CSS gradients/shapes instead of images).
- Include: a compelling headline, a subheadline, a hero section with a call-to-action button, 3 key benefit/feature blocks with short descriptions, a simple pricing or offer section, a testimonial-style quote (clearly fictional/example), and a footer with a final call-to-action.
- Make up a plausible brand name specific to the niche.
- Use modern, clean design with a cohesive color palette suited to the niche.
- Return ONLY the raw HTML (starting with <!DOCTYPE html>), no markdown code fences, no explanation.`,
      }],
    });

    let html = message.content[0].text.trim();
    const codeBlockMatch = html.match(/```(?:html)?\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      html = codeBlockMatch[1].trim();
    }

    return res.status(200).json({ success: true, html });
  } catch (error) {
    console.error('generate-landing-page error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
