// pages/api/auth/linkedin.js
// Step 1 of LinkedIn OAuth: redirect the user to LinkedIn's authorization screen.

export default function handler(req, res) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).send('LinkedIn is not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI.');
  }

  // Scopes needed to read basic profile (for the author URN) and post on the user's behalf.
  const scope = ['openid', 'profile', 'w_member_social'].join(' ');

  // Simple CSRF state token; in production you'd want to persist and verify this server-side.
  const state = Math.random().toString(36).slice(2);

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);

  res.redirect(authUrl.toString());
}
