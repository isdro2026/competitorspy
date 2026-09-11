// pages/api/social/post-linkedin.js
// Posts a text caption to LinkedIn on behalf of the connected account,
// using the stored OAuth access token from social_accounts.

import { supabase } from '@/lib/supabaseAdmin';

const APP_USER_ID = 'demo-user';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { caption } = req.body;
  if (!caption || !caption.trim()) {
    return res.status(400).json({ success: false, error: 'Caption is required' });
  }

  try {
    const { data: account, error: fetchError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', APP_USER_ID)
      .eq('platform', 'linkedin')
      .single();

    if (fetchError || !account) {
      return res.status(400).json({ success: false, error: 'LinkedIn is not connected yet' });
    }

    if (account.expires_at && new Date(account.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'LinkedIn connection expired — please reconnect' });
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
      console.error('LinkedIn post error:', liData);
      await supabase.from('social_post_logs').insert([{
        user_id: APP_USER_ID,
        platform: 'linkedin',
        caption,
        status: 'error',
        error_message: liData.message || `LinkedIn API returned ${liRes.status}`,
      }]);
      return res.status(500).json({ success: false, error: liData.message || 'Failed to post to LinkedIn' });
    }

    const postId = liRes.headers.get('x-restli-id') || liData.id || null;

    await supabase.from('social_post_logs').insert([{
      user_id: APP_USER_ID,
      platform: 'linkedin',
      caption,
      status: 'success',
      platform_post_id: postId,
    }]);

    return res.status(200).json({ success: true, postId });
  } catch (err) {
    console.error('post-linkedin error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
