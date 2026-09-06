import { Router, Request, Response } from 'express';
import { isDbConnected } from '../db.js';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = isDbConnected() ? 'ONLINE' : 'FALLBACK_MEMORY';
  const aiStatus = config.mockAi ? 'ONLINE (SIMULATED)' : 'ONLINE (GEMINI 2.5)';
  const storageStatus = config.storageProvider === 'cloudinary' ? 'ONLINE (CLOUDINARY)' : 'ONLINE (LOCAL)';
  let emailStatus = 'ONLINE (LOCAL_SIMULATOR)';
  if (config.smtpUser && config.smtpPass) {
    emailStatus = `ONLINE (NODEMAILER: ${config.smtpHost})`;
  } else if (config.resendApiKey) {
    emailStatus = 'ONLINE (RESEND)';
  }

  res.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: dbStatus,
    ai: aiStatus,
    storage: storageStatus,
    email: emailStatus,
    uptimeSeconds: Math.floor(process.uptime())
  });
});
