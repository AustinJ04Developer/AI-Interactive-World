import { Router, Request, Response } from 'express';
import { emailProvider } from '../services/emailProvider.js';
import { config } from '../config.js';

export const emailRouter = Router();

emailRouter.post('/send-experience', async (req: Request, res: Response) => {
  try {
    const {
      resultId,
      recipientEmail,
      experienceTitle,
      score,
      xpEarned,
      achievements,
      token
    } = req.body;

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (!resultId) {
      return res.status(400).json({ success: false, message: 'Result ID is required.' });
    }

    const resultWebUrl = `${config.appBaseUrl}/results/${token || resultId}`;

    const outcome = await emailProvider.sendExperienceReport({
      resultId,
      recipientEmail,
      experienceTitle: experienceTitle || 'AI Interactive World Experience',
      score: score || 500,
      xpEarned: xpEarned || 500,
      achievements: achievements || ['Mission Complete'],
      resultWebUrl
    });

    res.json(outcome);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
