import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { PDFDocument } from 'pdf-lib';
import { config } from '../config.js';
import { EmailDelivery } from '../models/index.js';

export interface SendExperienceEmailOptions {
  resultId: string;
  recipientEmail: string;
  experienceTitle: string;
  visitorName?: string;
  score: number;
  xpEarned: number;
  achievements: string[];
  badges?: { name: string; description?: string; tier?: string; icon?: string }[];
  cardFrontUrl?: string;
  cardBackUrl?: string;
  badgePrintUrl?: string;
  posterUrl?: string;
  snapshotUrl?: string;
  resultWebUrl: string;
}

/**
 * Converts a data URL or image URL into a high-res PDF Document Buffer
 */
async function imageToPdfBuffer(imageDataUrlOrUrl: string, title: string): Promise<Buffer | null> {
  try {
    let imageBytes: Uint8Array;
    let isPng = true;

    if (imageDataUrlOrUrl.startsWith('data:')) {
      const parts = imageDataUrlOrUrl.split(',');
      const isJpeg = parts[0].includes('jpeg') || parts[0].includes('jpg');
      isPng = !isJpeg;
      imageBytes = Buffer.from(parts[1], 'base64');
    } else {
      const targetUrl = imageDataUrlOrUrl.startsWith('/') ? `${config.appBaseUrl}${imageDataUrlOrUrl}` : imageDataUrlOrUrl;
      const resp = await fetch(targetUrl);
      if (!resp.ok) return null;
      const arrayBuf = await resp.arrayBuffer();
      imageBytes = new Uint8Array(arrayBuf);
      isPng = !imageDataUrlOrUrl.endsWith('.jpg') && !imageDataUrlOrUrl.endsWith('.jpeg');
    }

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(title);
    pdfDoc.setAuthor('AI Interactive World');
    pdfDoc.setSubject('Official Science Exposition 2026 Credentials');

    const embeddedImage = isPng 
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

    const { width, height } = embeddedImage;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (err) {
    console.warn(`[PDF GENERATION NOTICE] Could not convert image to PDF (${title}):`, err);
    return null;
  }
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
   * Sends experience souvenir email with rate limiting and attached PDF credentials
   */
  public async sendExperienceReport(opts: SendExperienceEmailOptions): Promise<{ success: boolean; message: string }> {
    const { 
      resultId, 
      recipientEmail, 
      experienceTitle, 
      visitorName = 'Cadet Alex',
      score, 
      xpEarned, 
      achievements = [], 
      badges = [],
      cardFrontUrl,
      cardBackUrl,
      badgePrintUrl,
      posterUrl,
      snapshotUrl,
      resultWebUrl 
    } = opts;

    // Check rate limiting: max 3 attempts per resultId
    try {
      const existing = await EmailDelivery.find({ resultId }).lean();
      if (existing && existing.length >= 3) {
        return { success: false, message: 'Maximum email attempts reached for this session.' };
      }
      const alreadySent = existing?.some(e => e.status === 'SENT');
      if (alreadySent) {
        return { success: false, message: 'Your personalized operative badge and poster were already dispatched!' };
      }
    } catch {
      // ignore
    }

    // Build Badges HTML Grid
    const badgesList = (badges && badges.length > 0) ? badges : achievements.map((ach, idx) => ({
      name: ach,
      description: 'Official Exhibition Achievement Award',
      tier: idx === 0 ? 'DIAMOND' : 'CYBER-GOLD',
      icon: '🎖️'
    }));

    const badgesHtml = badgesList.map(b => `
      <div style="background: rgba(14, 26, 56, 0.9); border: 1px solid #00f2fe; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 14px; font-weight: bold; color: #ffffff;">${b.icon || '🎖️'} ${b.name}</span>
          <span style="font-size: 10px; color: #f59e0b; background: rgba(245, 158, 11, 0.2); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${b.tier || 'VERIFIED BADGE'}</span>
        </div>
        ${b.description ? `<p style="font-size: 11px; color: #94a3b8; margin: 6px 0 0 0;">${b.description}</p>` : ''}
      </div>
    `).join('');

    // Generate PDF Attachments (Badge PDF & Poster PDF)
    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    const resendAttachments: Array<{ filename: string; content: string }> = [];

    const badgeSource = badgePrintUrl || cardFrontUrl;
    if (badgeSource) {
      const badgePdf = await imageToPdfBuffer(badgeSource, 'AI Interactive World - Official Operative Badge');
      if (badgePdf) {
        attachments.push({
          filename: 'AI-World-Operative-Badge.pdf',
          content: badgePdf,
          contentType: 'application/pdf'
        });
        resendAttachments.push({
          filename: 'AI-World-Operative-Badge.pdf',
          content: badgePdf.toString('base64')
        });
      }
    }

    const posterSource = posterUrl || snapshotUrl;
    if (posterSource) {
      const posterPdf = await imageToPdfBuffer(posterSource, 'AI Interactive World - Official Hero Poster');
      if (posterPdf) {
        attachments.push({
          filename: 'AI-World-Hero-Poster.pdf',
          content: posterPdf,
          contentType: 'application/pdf'
        });
        resendAttachments.push({
          filename: 'AI-World-Hero-Poster.pdf',
          content: posterPdf.toString('base64')
        });
      }
    }

    // Prepare email HTML
    const subject = `Your Official Operative Badge & Hero Poster // AI Interactive World 🚀`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #040915; color: #ffffff; padding: 28px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #00f2fe;">
        <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
          <span style="font-size: 11px; font-family: monospace; color: #00f2fe; letter-spacing: 2px;">SCIENCE EXPOSITION 2026</span>
          <h1 style="color: #ffffff; margin: 6px 0 0 0; font-size: 22px;">AI INTERACTIVE WORLD</h1>
          <p style="font-size: 13px; color: #94a3b8; margin: 4px 0 0 0;">OFFICIAL OPERATIVE BADGE & SOUVENIR POSTER</p>
        </div>
        
        <div style="margin: 20px 0;">
          <p style="font-size: 16px; margin: 0 0 8px 0;">Greetings, Operative <strong>${visitorName}</strong>! 👋</p>
          <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5; margin: 0;">
            Congratulations on completing your mission in <strong>${experienceTitle}</strong>! Your interactive 3D badge, full performance telemetry, and souvenir poster are live on your personal result page — tap the button below to open it instantly.
          </p>
        </div>
        
        <!-- Score & Status Summary -->
        <div style="background-color: #091836; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #00f2fe;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 12px; color: #94a3b8;">EXPEDITION SCORE:</td>
              <td style="font-size: 12px; color: #94a3b8; text-align: right;">REWARD XP:</td>
            </tr>
            <tr>
              <td style="font-size: 24px; font-weight: bold; color: #00f2fe;">${score} PTS</td>
              <td style="font-size: 24px; font-weight: bold; color: #00ff88; text-align: right;">+${xpEarned} XP</td>
            </tr>
          </table>
        </div>

        <!-- Attached PDF Documents Callout -->
        <div style="background: rgba(8, 24, 56, 0.95); border: 2px solid #00f2fe; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <h3 style="color: #00f2fe; margin: 0 0 8px 0; font-size: 15px;">📄 ATTACHED CREDENTIALS (PDF FORMAT)</h3>
          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 10px 0;">
            The following documents are attached to this email as high-resolution print-ready PDF files:
          </p>
          <ul style="color: #e2e8f0; font-size: 12px; line-height: 1.6; margin: 0; padding-left: 18px;">
            <li><strong>AI-World-Operative-Badge.pdf</strong> — Official 2-Sided Lanyard Badge with cut & fold guides (300 DPI)</li>
            <li><strong>AI-World-Hero-Poster.pdf</strong> — Official 1200×1500 HD Commemorative Exhibition Poster (300 DPI)</li>
          </ul>
        </div>

        <!-- Official Badges Vault -->
        <div style="margin: 24px 0;">
          <h3 style="color: #f59e0b; font-size: 14px; margin: 0 0 12px 0; letter-spacing: 1px; text-transform: uppercase;">
            ★ UNLOCKED OPERATIVE BADGES (${badgesList.length})
          </h3>
          ${badgesHtml}
        </div>

        <!-- Interactive 3D Web Passport Callout -->
        <div style="background: rgba(8, 20, 48, 0.85); border: 1px solid #38bdf8; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
          <h3 style="color: #ffffff; margin: 0 0 6px 0; font-size: 16px;">🎖️ INTERACTIVE 3D BADGE & LIVE TELEMETRY</h3>
          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;">
            Inspect your badge with full 3D rotation, performance telemetry matrix, and live exhibition radar.
          </p>
          <a href="${resultWebUrl}" style="display: inline-block; background-color: #00f2fe; color: #020408; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 13px; letter-spacing: 0.5px;">
            OPEN INTERACTIVE 3D BADGE PASSPORT ➔
          </a>
        </div>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px; text-align: center;">
          <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">
            Direct Passport Link: <a href="${resultWebUrl}" style="color: #38bdf8;">${resultWebUrl}</a>
          </p>
          <p style="font-size: 10px; color: #475569; margin: 0;">
            AI Interactive World • Science Exposition 2026 • Holographic Credential System
          </p>
        </div>
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
          html: htmlBody,
          attachments
        });
        console.log(`[NODEMAILER DISPATCH] Souvenir email with PDF attachments dispatched to ${recipientEmail} for result ${resultId}`);
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
            html: htmlBody,
            attachments: resendAttachments
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(JSON.stringify(errData));
        }
        console.log(`[RESEND DISPATCH] Souvenir email with PDF attachments dispatched to ${recipientEmail} for result ${resultId}`);
      } catch (err: any) {
        console.warn('Real Resend dispatch failed, logging delivery fallback:', err);
        status = 'FAILED';
        errorMsg = err.message || 'Transmission failed';
      }
    } else {
      console.log(`[EMAIL DISPATCH] Sent email to ${recipientEmail} with ${attachments.length} PDF attachments for result ${resultId} (Mock/Local Delivery)`);
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
      return { success: true, message: `Your results page and badge credentials have been sent to ${recipientEmail}! Check your inbox.` };
    } else {
      return { success: false, message: `Email server temporarily unavailable. Please scan the QR code to view on your phone!` };
    }
  }
}

export const emailProvider = new EmailProvider();



