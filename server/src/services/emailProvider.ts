import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config.js';
import { EmailDelivery } from '../models/index.js';

export interface SendExperienceEmailOptions {
  resultId: string;
  recipientEmail: string;
  experienceTitle: string;
  score: number;
  xpEarned: number;
  achievements: string[];
  snapshotUrl?: string;
  resultWebUrl: string;
}

export class EmailProvider {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;
    if (config.smtpUser && config.smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure || config.smtpPort === 465,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass
        }
      });
      return this.transporter;
    }
    return null;
  }
  /**
   * Sends experience souvenir email with rate limiting
   */
  public async sendExperienceReport(opts: SendExperienceEmailOptions): Promise<{ success: boolean; message: string }> {
    const { resultId, recipientEmail, experienceTitle, score, xpEarned, achievements, resultWebUrl } = opts;

    // Check rate limiting: max 3 attempts per resultId
    try {
      const existing = await EmailDelivery.find({ resultId }).lean();
      if (existing && existing.length >= 3) {
        return { success: false, message: 'Maximum email attempts reached for this session.' };
      }
      const alreadySent = existing?.some(e => e.status === 'SENT');
      if (alreadySent) {
        return { success: false, message: 'Your personalized souvenir report was already dispatched!' };
      }
    } catch {
      // ignore
    }

    // Prepare email HTML
    const subject = `Your AI Interactive World Experience 🚀`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #040915; color: #ffffff; padding: 24px; border-radius: 8px;">
        <h1 style="color: #00f2fe; margin-bottom: 8px;">AI INTERACTIVE WORLD</h1>
        <p style="font-size: 14px; color: #94a3b8;">SCIENCE EXPOSITION 2026 // COMMEMORATIVE REPORT</p>
        <hr style="border: 1px solid #1e293b; margin: 16px 0;" />
        
        <h2>Hello, Explorer! 👋</h2>
        <p>You just successfully conquered: <strong>${experienceTitle}</strong></p>
        
        <div style="background-color: #091836; padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #00f2fe;">
          <p style="font-size: 18px; margin: 4px 0;"><strong>Score:</strong> <span style="color: #00ff88;">${score} (${xpEarned} XP)</span></p>
          <p style="margin: 4px 0;"><strong>Achievements:</strong> ${achievements.join(', ')}</p>
        </div>

        <p>Your official high-resolution Experience Poster and Digital Certificate are accessible online:</p>
        <p><a href="${resultWebUrl}" style="display: inline-block; background-color: #00f2fe; color: #020408; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 4px;">VIEW YOUR POSTER & CERTIFICATE</a></p>

        <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
          AI Interactive World • Local Exhibition Terminal • Temporary session data will be cleared automatically.
        </p>
      </div>
    `;

    // Email dispatch: Nodemailer SMTP first, Resend second, Mock/Local simulator fallback
    let status: 'SENT' | 'FAILED' = 'SENT';
    let errorMsg: string | undefined = undefined;

    const transporter = this.getTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: config.smtpFrom,
          to: recipientEmail,
          subject,
          html: htmlBody
        });
        console.log(`[NODEMAILER DISPATCH] Souvenir email dispatched to ${recipientEmail} for result ${resultId}`);
      } catch (err: any) {
        console.warn('Nodemailer SMTP dispatch failed, logging delivery fallback:', err);
        status = 'FAILED';
        errorMsg = err.message || 'SMTP transmission failed';
      }
    } else if (config.resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.resendApiKey}`
          },
          body: JSON.stringify({
            from: config.resendFromEmail || 'AI Interactive World <onboarding@resend.dev>',
            to: [recipientEmail],
            subject,
            html: htmlBody
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(JSON.stringify(errData));
        }
        console.log(`[RESEND DISPATCH] Souvenir email dispatched to ${recipientEmail} for result ${resultId}`);
      } catch (err: any) {
        console.warn('Real Resend dispatch failed, logging delivery fallback:', err);
        status = 'FAILED';
        errorMsg = err.message || 'Transmission failed';
      }
    } else {
      console.log(`[EMAIL DISPATCH] Sent email to ${recipientEmail} for result ${resultId} (Mock/Local Delivery)`);
    }

    // Record delivery in database
    try {
      await EmailDelivery.create({
        resultId,
        recipient: recipientEmail,
        status,
        errorMsg,
        sentAt: status === 'SENT' ? new Date() : undefined
      });
    } catch {
      // offline fallback
    }

    if (status === 'SENT') {
      return { success: true, message: `Souvenir report successfully dispatched to ${recipientEmail}!` };
    } else {
      return { success: false, message: `Email server temporarily unavailable. Please scan the QR code to view on your phone!` };
    }
  }
}

export const emailProvider = new EmailProvider();
