// pages/api/social/status.js
// Reports which social platforms the current user has connected.

import { supabase } from '@/lib/supabase';

const APP_USER_ID = 'demo-user';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('platform, account_name, connected_at, expires_at')
      .eq('user_id', APP_USER_ID);

    if (error) throw error;

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('social status error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
