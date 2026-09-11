// pages/api/email/send-report.js
import { sendCompetitorReport } from '@/lib/emailService';
import { supabase } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, competitorData } = req.body;

  // Validate inputs
  if (!email || !competitorData) {
    return res.status(400).json({ error: 'Missing email or competitor data' });
  }

  try {
    // Verify user is authenticated and owns this email
    // (Add your auth check here)

    // Send report email
    const emailResult = await sendCompetitorReport(email, competitorData);

    if (!emailResult.success) {
      return res.status(500).json({ error: emailResult.error });
    }

    // Log in database
    await supabase
      .from('email_logs')
      .insert([
        {
          email,
          type: 'competitor_report',
          competitor: competitorData.competitor,
          messageId: emailResult.messageId,
          sentAt: new Date().toISOString(),
        },
      ]);

    return res.status(200).json({
      success: true,
      message: 'Report sent successfully!',
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error('Send report error:', error);
    return res.status(500).json({ error: 'Failed to send report' });
  }
}
