import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { ExperienceResult, QRAccess } from '../models/index.js';
import { storageProvider } from '../services/storageProvider.js';
import { config } from '../config.js';

export const resultRouter = Router();

// In-memory fallback
const inMemoryResults: Record<string, any> = {
  'RES-DEMO-01': {
    resultId: 'RES-DEMO-01',
    sessionId: 'SESSION-DEMO-01',
    portal: 'detective',
    visitorName: 'Detective Vance',
    score: 950,
    xpEarned: 500,
    achievements: ['Master Detective', 'Contradiction Hunter', 'Polygraph Expert'],
    aiSummary: 'Flawless forensic cross-examination. Pinned all 5 critical evidence threads and uncovered the biometric alibi contradiction.',
    createdAt: new Date().toISOString(),
    levelResults: [
      { level: 1, label: 'Phase 1: Holographic Sweep', score: 100, maxScore: 100, timeTakenSec: 24, timeBudgetSec: 30, completedBeforeTimeout: true, accuracy: 96 },
      { level: 2, label: 'Phase 2: Digital Forensics', score: 145, maxScore: 150, timeTakenSec: 38, timeBudgetSec: 45, completedBeforeTimeout: true, accuracy: 94 },
      { level: 3, label: 'Phase 3: Interrogation Tree', score: 195, maxScore: 200, timeTakenSec: 42, timeBudgetSec: 50, completedBeforeTimeout: true, accuracy: 92 },
      { level: 4, label: 'Phase 4: Sensor Synthesis', score: 240, maxScore: 250, timeTakenSec: 51, timeBudgetSec: 55, completedBeforeTimeout: true, accuracy: 95 },
      { level: 5, label: 'Phase 5: Case Accusation', score: 270, maxScore: 300, timeTakenSec: 60, timeBudgetSec: 60, completedBeforeTimeout: true, accuracy: 98 }
    ]
  },
  'RES-DEMO-02': {
    resultId: 'RES-DEMO-02',
    sessionId: 'SESSION-DEMO-02',
    portal: 'last-signal',
    visitorName: 'Commander Chen',
    score: 890,
    xpEarned: 480,
    achievements: ['Epoch Arbiter', 'Harmonic Resonance', 'Deep Space Envoy'],
    aiSummary: 'Forged an unprecedented cosmic diplomatic resonance across deep space quadrants.',
    createdAt: new Date().toISOString(),
    levelResults: [
      { level: 1, label: 'Chapter 1: Anomaly Decryption', score: 90, maxScore: 100, timeTakenSec: 28, timeBudgetSec: 30, completedBeforeTimeout: true, accuracy: 90 },
      { level: 2, label: 'Chapter 2: Resonance Matrix', score: 135, maxScore: 150, timeTakenSec: 40, timeBudgetSec: 45, completedBeforeTimeout: true, accuracy: 88 },
      { level: 3, label: 'Chapter 3: The Chronicler', score: 180, maxScore: 200, timeTakenSec: 48, timeBudgetSec: 50, completedBeforeTimeout: true, accuracy: 91 },
      { level: 4, label: 'Chapter 4: Reactor Warp Crisis', score: 225, maxScore: 250, timeTakenSec: 54, timeBudgetSec: 55, completedBeforeTimeout: true, accuracy: 92 },
      { level: 5, label: 'Chapter 5: Final Epoch Broadcast', score: 260, maxScore: 300, timeTakenSec: 62, timeBudgetSec: 60, completedBeforeTimeout: false, accuracy: 85 }
    ]
  }
};
const inMemoryQRTokens: Record<string, any> = {
  'RES-DEMO-01': { token: 'RES-DEMO-01', resultId: 'RES-DEMO-01', expiresAt: new Date(Date.now() + 7 * 86400000) },
  'demo-detective': { token: 'demo-detective', resultId: 'RES-DEMO-01', expiresAt: new Date(Date.now() + 7 * 86400000) },
  'RES-DEMO-02': { token: 'RES-DEMO-02', resultId: 'RES-DEMO-02', expiresAt: new Date(Date.now() + 7 * 86400000) }
};

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
      // Allow direct fallback lookup by resultId or sessionId (e.g. RES-DEMO-01)
      let directResult: any = null;
      try {
        directResult = await ExperienceResult.findOne({ $or: [{ resultId: token }, { sessionId: token }] }).lean();
      } catch {
        directResult = null;
      }
      directResult = directResult || inMemoryResults[token];

      if (directResult) {
        return res.json({
          success: true,
          result: directResult,
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
        });
      }
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
