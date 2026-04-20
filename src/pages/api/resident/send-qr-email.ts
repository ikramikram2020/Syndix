import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, residentName, qrDataUrl, accessUrl, buildingName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // QR code from URL (always works in email)
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(accessUrl)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0A1A3E, #1C2B6B); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">SYNDIX</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Hello, ${residentName}! 👋</h2>
            <p>Welcome to SYNDIX! Scan the QR code below to access your portal:</p>
            <div style="text-align: center; margin: 20px 0;">
              <img src="${qrCodeApiUrl}" style="width: 180px;" />
            </div>
            <p>Or click: <a href="${accessUrl}">${accessUrl}</a></p>
            <p><strong>Building:</strong> ${buildingName || 'Your Building'}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">This QR code expires in 365 days.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"SYNDIX" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `🏢 Welcome to SYNDIX, ${residentName}! 🎉`,
      html: htmlContent,
    });

    console.log('✅ Email sent to:', email);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}