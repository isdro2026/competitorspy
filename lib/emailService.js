// lib/emailService.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'CompetitorSpy <reports@icdigitalmarketingllc.com>'; // Verified Resend domain

export async function sendCompetitorReport(email, competitorData) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <h2 style="color: #333;">Competitor Spy Report</h2>
      <p>Here's your competitor analysis report:</p>

      <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h3>${competitorData.competitor}</h3>
        <p><strong>URL:</strong> ${competitorData.url}</p>
        <p><strong>Industry:</strong> ${competitorData.industry}</p>
        <p><strong>Employees:</strong> ${competitorData.employees || 'N/A'}</p>
        <p><strong>Founded:</strong> ${competitorData.founded || 'N/A'}</p>
      </div>

      <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h4>Key Insights:</h4>
        <ul>
          ${competitorData.insights?.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
        <p>© 2026 CompetitorSpy. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `CompetitorSpy Report: ${competitorData.competitor}`,
      html: html,
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendNotification(email, title, message, actionUrl) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <h2 style="color: #333;">${title}</h2>
      <p>${message}</p>

      <a href="${actionUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        View Details
      </a>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
        <p>© 2026 CompetitorSpy. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: title,
      html: html,
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Notification send error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(email, userName) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <h2 style="color: #333;">Welcome to CompetitorSpy! 🚀</h2>
      <p>Hi ${userName},</p>

      <p>Thanks for joining CompetitorSpy! You're now set up to:</p>
      <ul>
        <li>✅ Analyze your competitors in real-time</li>
        <li>✅ Get detailed competitor insights</li>
        <li>✅ Receive automated competitor alerts</li>
        <li>✅ Generate competitor reports</li>
      </ul>

      <a href="https://competitorspy.com/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Go to Dashboard
      </a>

      <p>If you have any questions, just reply to this email!</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
        <p>© 2026 CompetitorSpy. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to CompetitorSpy!',
      html: html,
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error: error.message };
  }
}
