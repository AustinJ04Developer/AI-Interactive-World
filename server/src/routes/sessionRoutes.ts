import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { UserSession } from '../models/index.js';

export const sessionRouter = Router();

// In-memory fallback
const inMemorySessions: Record<string, any> = {};

sessionRouter.post('/start', async (req: Request, res: Response) => {
  try {
    const { mode = 'SOLO', teamSize = 1 } = req.body;
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const sessionId = `SESSION-${randomSuffix}`;

    try {
      await UserSession.create({
        sessionId,
        status: 'ACTIVE',
        mode,
        teamSize,
        startedAt: new Date()
      });
    } catch {
      inMemorySessions[sessionId] = {
        sessionId,
        status: 'ACTIVE',
        mode,
        teamSize,
        startedAt: new Date()
      };
    }

    res.json({
      success: true,
      sessionId,
      mode,
      teamSize,
      startedAt: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

sessionRouter.post('/end', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      try {
        await UserSession.updateOne(
          { sessionId },
          { $set: { status: 'COMPLETED', endedAt: new Date() } }
        );
      } catch {
        if (inMemorySessions[sessionId]) {
          inMemorySessions[sessionId].status = 'COMPLETED';
          inMemorySessions[sessionId].endedAt = new Date();
        }
      }
    }
    res.json({ success: true, message: 'Session terminated cleanly' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
