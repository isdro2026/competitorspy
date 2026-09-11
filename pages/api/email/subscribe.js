// pages/api/email/subscribe.js
import { sendWelcomeEmail } from '@/lib/emailService';
import { supabase } from '@/lib/supabaseAdmin'; // You'll need to set up Supabase

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, preferences } = req.body;

  // Validate email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    // Insert into database
    const { data, error } = await supabase
      .from('subscribers')
      .insert([
        {
          email,
          name: name || 'User',
          preferences: preferences || {
            reportFrequency: 'weekly',
            notifications: true,
            digest: true,
          },
          subscribedAt: new Date().toISOString(),
          verified: false,
        },
      ]);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    // Send welcome email
    const emailResult = await sendWelcomeEmail(email, name || 'User');

    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error);
      // Still return success as email can be retried
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed!',
      email: email,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
