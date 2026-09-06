import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory or root directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_interactive_world',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
  mockAi: process.env.MOCK_AI === 'true' || !process.env.GEMINI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  // Nodemailer SMTP settings
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || (process.env.SMTP_USER ? `AI Interactive World <${process.env.SMTP_USER}>` : 'AI Interactive World <expo@ai-world.local>'),
  // Fallback Resend configuration
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'AI Interactive World <onboarding@resend.dev>',
  storageProvider: process.env.STORAGE_PROVIDER || 'local'
};
