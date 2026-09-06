import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { ExperienceResult, QRAccess } from '../models/index.js';
import { storageProvider } from '../services/storageProvider.js';
import { config } from '../config.js';

export const resultRouter = Router();

// In-memory fallback
const inMemoryResults: Record<string, any> = {};
const inMemoryQRTokens: Record<string, any> = {};

// 1. Authoritative Experience Completion & Result Recording
resultRouter.post('/experiences/:portal/complete', async (req: Request, res: Response) => {
  try {
    const { portal } = req.params;
    const {
      sessionId,
      scenarioId,
      score = 500,
      xpEarned = 500,
      level = 1,
      achievements = [],
      metrics = [],
      aiSummary = '',
      snapshotBase64
    } = req.body;

    const resultId = `RES-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Save snapshot image
    let snapshotUrl = '';
    if (snapshotBase64) {
      snapshotUrl = await storageProvider.saveSnapshot(resultId, snapshotBase64);
    }

    // Generate secure cryptographic token for QR
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Construct mobile result URL pointing to real public frontend route
    const resultWebUrl = `${config.appBaseUrl}/results/${token}`;

    // Generate real dynamic QR code data URL
    const qrDataUrl = await QRCode.toDataURL(resultWebUrl, {
      margin: 2,
      width: 320,
      color: { dark: '#040915', light: '#ffffff' }
    });

    const resultDoc = {
      resultId,
      sessionId,
      scenarioId,
      portal,
      score: Math.min(1000, Math.max(0, Number(score))),
      xpEarned: Number(xpEarned),
      level: Number(level),
      achievements,
      metrics,
      aiSummary,
      snapshotUrl,
      createdAt: new Date()
    };

    try {
      await ExperienceResult.create(resultDoc);
      await QRAccess.create({
        resultId,
        token,
        expiresAt,
        revoked: false,
        scannedCount: 0
      });
    } catch {
      inMemoryResults[resultId] = resultDoc;
      inMemoryQRTokens[token] = {
        resultId,
        token,
        expiresAt,
        revoked: false,
        scannedCount: 0
      };
    }

    res.json({
      success: true,
      resultId,
      token,
      resultWebUrl,
      qrDataUrl,
      score: resultDoc.score,
      xpEarned: resultDoc.xpEarned,
      level: resultDoc.level,
      achievements: resultDoc.achievements,
      aiSummary: resultDoc.aiSummary,
      snapshotUrl
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Public Mobile Result Page Data API (Called by /results/:token on phone)
resultRouter.get('/results/:token', async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;

    let qrDoc: any = null;
    try {
      qrDoc = await QRAccess.findOne({ token }).lean();
    } catch {
      qrDoc = inMemoryQRTokens[token];
    }

    if (!qrDoc) {
      return res.status(404).json({ success: false, error: 'Experience result not found or expired.' });
    }

    if (qrDoc.revoked || new Date() > new Date(qrDoc.expiresAt)) {
      return res.status(410).json({ success: false, error: 'This QR code link has expired.' });
    }

    // Increment scan count
    try {
      await QRAccess.updateOne(
        { token },
        { 
          $inc: { scannedCount: 1 },
          $set: { lastScannedAt: new Date() }
        }
      );
    } catch {
      if (inMemoryQRTokens[token]) inMemoryQRTokens[token].scannedCount++;
    }

    // Fetch result record
    let resultDoc: any = null;
    try {
      resultDoc = await ExperienceResult.findOne({ resultId: qrDoc.resultId }).lean();
    } catch {
      resultDoc = inMemoryResults[qrDoc.resultId];
    }

    if (!resultDoc) {
      return res.status(404).json({ success: false, error: 'Result details unavailable.' });
    }

    res.json({
      success: true,
      result: resultDoc,
      expiresAt: qrDoc.expiresAt
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
