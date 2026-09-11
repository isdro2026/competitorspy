// pages/api/cron/run-schedules.js
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabaseAdmin';
import { fetchArticleText } from '@/lib/articleText';

const APP_USER_ID = 'demo-user';

function computeNextRunAt(frequency, from = new Date()) {
  const next = new Date(from);
  if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  } else if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else {
    next.setDate(next.getDate() + 1);
  }
  return next.toISOString();
}

async function getProduct(productId) {
  if (!productId) return null;
  const { data } = await supabase.from('products').select('*').eq('id', productId).single();
  return data || null;
}

function appendProductLine(caption, product) {
  if (!product) return caption;
  return `${caption}\n\nCheck it out: ${product.name} -> ${product.product_url}`;
}

async function generateCaption(schedule, product) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const productLine = product
    ? `\n\nNaturally mention this product as a recommendation, referring to it by name so a reader would want to click the link that follows the post: "${product.name}". Do not invent a URL yourself, just mention it naturally in one line near the end.`
    : '';

  let prompt;
  if (schedule.input_type === 'url') {
    const articleText = await fetchArticleText(schedule.input_value);
    prompt = `Here is the text content of a web page:

"""
${articleText}
"""

Write a professional LinkedIn post based on this content, focused on business value or industry angle, minimal hashtags. Vary the phrasing and angle from a typical post so repeated posts about this page don't read identically.${productLine} Return ONLY a JSON object (no markdown, no explanation) with this exact shape:
{ "caption": "the LinkedIn post text" }`;
  } else {
    prompt = `You are a marketing content generator for the niche: "${schedule.input_value}".

Write a professional LinkedIn post for this niche, focused on business value or industry angle, minimal hashtags.${productLine} Return ONLY a JSON object (no markdown, no explanation) with this exact shape:
{ "caption": "the LinkedIn post text" }`;
  }

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
  return appendProductLine(parsed.caption, product);
}

async function postToLinkedIn(caption) {
  const { data: account, error: fetchError } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', APP_USER_ID)
    .eq('platform', 'linkedin')
    .single();

  if (fetchError || !account) {
    throw new Error('LinkedIn is not connected');
  }
  if (account.expires_at && new Date(account.expires_at) < new Date()) {
    throw new Error('LinkedIn connection expired');
  }

  const postBody = {
    author: account.account_urn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: caption },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postBody),
  });

  const liData = await liRes.json().catch(() => ({}));

  if (!liRes.ok) {
    throw new Error(liData.message || `LinkedIn API returned ${liRes.status}`);
  }

  const postId = liRes.headers.get('x-restli-id') || liData.id || null;

  await supabase.from('social_post_logs').insert([{
    user_id: APP_USER_ID,
    platform: 'linkedin',
    caption,
    status: 'success',
    platform_post_id: postId,
  }]);

  return postId;
}

export default async function handler(req, res) {
  // Vercel Cron sends GET requests; allow POST too for manual testing.
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const results = [];

  try {
    const { data: due, error } = await supabase
      .from('content_schedules')
      .select('*')
      .eq('user_id', APP_USER_ID)
      .eq('active', true)
      .lte('next_run_at', new Date().toISOString());

    if (error) throw error;

    for (const schedule of due || []) {
      try {
        const product = await getProduct(schedule.product_id);
        const caption = await generateCaption(schedule, product);
        const postId = await postToLinkedIn(caption);

        await supabase
          .from('content_schedules')
          .update({
            last_run_at: new Date().toISOString(),
            last_status: 'success',
            last_error: null,
            last_caption: caption,
            next_run_at: computeNextRunAt(schedule.frequency),
          })
          .eq('id', schedule.id);

        results.push({ id: schedule.id, input: schedule.input_value, status: 'success', postId });
      } catch (err) {
        console.error(`run-schedules error for schedule ${schedule.id}:`, err);

        await supabase
          .from('content_schedules')
          .update({
            last_run_at: new Date().toISOString(),
            last_status: 'error',
            last_error: err.message,
            next_run_at: computeNextRunAt(schedule.frequency),
          })
          .eq('id', schedule.id);

        results.push({ id: schedule.id, input: schedule.input_value, status: 'error', error: err.message });
      }
    }

    return res.status(200).json({ success: true, ran: results.length, results });
  } catch (err) {
    console.error('run-schedules error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
