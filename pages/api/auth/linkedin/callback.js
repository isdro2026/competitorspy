// pages/api/auth/linkedin/callback.js
// Step 2 of LinkedIn OAuth: exchange the code for an access token, fetch the
// user's LinkedIn URN, and store both in Supabase so we can post on their behalf later.

import { supabase } from '@/lib/supabaseAdmin';

// No multi-tenant auth system yet — mirrors the "demo-user" convention used
// elsewhere in the app (see AnalyticsDashboard / Dashboard.jsx).
const APP_USER_ID = 'demo-user';

export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.redirect(`/dashboard?linkedin_error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.status(400).send('Missing authorization code from LinkedIn.');
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  try {
    // Exchange the authorization code for an access token.
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('LinkedIn token exchange failed:', tokenData);
      return res.redirect(`/dashboard?linkedin_error=${encodeURIComponent(tokenData.error_description || 'Token exchange failed')}`);
    }

    const { access_token, expires_in } = tokenData;

    // Fetch the LinkedIn member's URN (needed as the "author" on every post).
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.sub) {
      console.error('LinkedIn userinfo failed:', profile);
      return res.redirect('/dashboard?linkedin_error=Could not read LinkedIn profile');
    }

    const memberUrn = `urn:li:person:${profile.sub}`;
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Upsert so reconnecting simply refreshes the stored token.
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert(
        {
          user_id: APP_USER_ID,
          platform: 'linkedin',
          access_token,
          account_urn: memberUrn,
          account_name: profile.name || null,
          expires_at: expiresAt,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,platform' }
      );

    if (dbError) {
      console.error('Failed to store LinkedIn account:', dbError);
      return res.redirect('/dashboard?linkedin_error=Failed to save LinkedIn connection');
    }

    return res.redirect('/dashboard?linkedin_connected=1');
  } catch (err) {
    console.error('LinkedIn OAuth callback error:', err);
    return res.redirect(`/dashboard?linkedin_error=${encodeURIComponent(err.message)}`);
  }
}
