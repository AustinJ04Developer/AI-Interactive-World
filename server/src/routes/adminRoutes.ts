import { Router, Request, Response } from 'express';
import { ExperienceResult, UserSession, QRAccess } from '../models/index.js';

export const adminRouter = Router();

const DEFAULT_ADMIN_PIN = process.env.ADMIN_PIN || '2026';

// In-memory fallback dataset for pure offline testing
const inMemoryFallbackSessions = [
  {
    resultId: 'RES-DEMO-01',
    sessionId: 'SESSION-DEMO-01',
    portal: 'detective',
    visitorName: 'Detective Vance',
    score: 950,
    durationSec: 215,
    compositeArchetype: 'Master Forensic Inquisitor // Methodical Synthesizer',
    createdAt: new Date(Date.now() - 3600000),
    levelResults: [
      { level: 1, label: 'Phase 1: Holographic Sweep', score: 100, maxScore: 100, timeTakenSec: 24, timeBudgetSec: 30, completedBeforeTimeout: true, accuracy: 96 },
      { level: 2, label: 'Phase 2: Digital Forensics', score: 145, maxScore: 150, timeTakenSec: 38, timeBudgetSec: 45, completedBeforeTimeout: true, accuracy: 94 },
      { level: 3, label: 'Phase 3: Interrogation Tree', score: 195, maxScore: 200, timeTakenSec: 42, timeBudgetSec: 50, completedBeforeTimeout: true, accuracy: 92 },
      { level: 4, label: 'Phase 4: Sensor Synthesis', score: 240, maxScore: 250, timeTakenSec: 51, timeBudgetSec: 55, completedBeforeTimeout: true, accuracy: 95 },
      { level: 5, label: 'Phase 5: Case Accusation', score: 270, maxScore: 300, timeTakenSec: 60, timeBudgetSec: 60, completedBeforeTimeout: true, accuracy: 98 }
    ]
  },
  {
    resultId: 'RES-DEMO-02',
    sessionId: 'SESSION-DEMO-02',
    portal: 'last-signal',
    visitorName: 'Commander Chen',
    score: 890,
    durationSec: 232,
    compositeArchetype: 'Cosmic Epoch Arbiter // Exponential Ascendant',
    createdAt: new Date(Date.now() - 7200000),
    levelResults: [
      { level: 1, label: 'Chapter 1: Anomaly Decryption', score: 90, maxScore: 100, timeTakenSec: 28, timeBudgetSec: 30, completedBeforeTimeout: true, accuracy: 90 },
      { level: 2, label: 'Chapter 2: Resonance Matrix', score: 135, maxScore: 150, timeTakenSec: 40, timeBudgetSec: 45, completedBeforeTimeout: true, accuracy: 88 },
      { level: 3, label: 'Chapter 3: The Chronicler', score: 180, maxScore: 200, timeTakenSec: 48, timeBudgetSec: 50, completedBeforeTimeout: true, accuracy: 91 },
      { level: 4, label: 'Chapter 4: Reactor Warp Crisis', score: 225, maxScore: 250, timeTakenSec: 54, timeBudgetSec: 55, completedBeforeTimeout: true, accuracy: 92 },
      { level: 5, label: 'Chapter 5: Final Epoch Broadcast', score: 260, maxScore: 300, timeTakenSec: 62, timeBudgetSec: 60, completedBeforeTimeout: false, accuracy: 85 }
    ]
  },
  {
    resultId: 'RES-DEMO-03',
    sessionId: 'SESSION-DEMO-03',
    portal: 'ai-defense',
    visitorName: 'Pilot Alex',
    score: 920,
    durationSec: 198,
    compositeArchetype: 'Quantum Reflex Sentinel // High-Burst Sprinter',
    createdAt: new Date(Date.now() - 10800000),
    levelResults: [
      { level: 1, label: 'Wave 1: Recon Probes', score: 100, maxScore: 100, timeTakenSec: 22, timeBudgetSec: 30, completedBeforeTimeout: true, accuracy: 98 },
      { level: 2, label: 'Wave 2: Botnet Infiltration', score: 150, maxScore: 150, timeTakenSec: 35, timeBudgetSec: 45, completedBeforeTimeout: true, accuracy: 96 },
      { level: 3, label: 'Wave 3: Decryption Swarm', score: 190, maxScore: 200, timeTakenSec: 42, timeBudgetSec: 50, completedBeforeTimeout: true, accuracy: 94 },
      { level: 4, label: 'Wave 4: Trojan Incursion', score: 230, maxScore: 250, timeTakenSec: 49, timeBudgetSec: 55, completedBeforeTimeout: true, accuracy: 92 },
      { level: 5, label: 'Wave 5: Titan Glitch Overlord', score: 250, maxScore: 300, timeTakenSec: 50, timeBudgetSec: 60, completedBeforeTimeout: true, accuracy: 90 }
    ]
  },
  {
    resultId: 'RES-DEMO-04',
    sessionId: 'SESSION-DEMO-04',
    portal: 'smart-city',
    visitorName: 'Mayor Sterling',
    score: 840,
    durationSec: 245,
    compositeArchetype: 'Autonomous City Architect // Dynamic Maverick',
    createdAt: new Date(Date.now() - 14400000),
    levelResults: [
      { level: 1, label: 'Sector 1: Fusion Grid', score: 85, maxScore: 100, timeTakenSec: 29, timeBudgetSec: 30, completedBeforeTimeout: true, accuracy: 88 },
      { level: 2, label: 'Sector 2: Transit & Hospital', score: 125, maxScore: 150, timeTakenSec: 43, timeBudgetSec: 45, completedBeforeTimeout: true, accuracy: 84 },
      { level: 3, label: 'Sector 3: Vertical Agro-Dome', score: 170, maxScore: 200, timeTakenSec: 49, timeBudgetSec: 50, completedBeforeTimeout: true, accuracy: 86 },
      { level: 4, label: 'Sector 4: Safety AI Core', score: 210, maxScore: 250, timeTakenSec: 55, timeBudgetSec: 55, completedBeforeTimeout: true, accuracy: 89 },
      { level: 5, label: 'Sector 5: Central Monument', score: 250, maxScore: 300, timeTakenSec: 69, timeBudgetSec: 60, completedBeforeTimeout: false, accuracy: 80 }
    ]
  }
];

// Verify Staff PIN
adminRouter.post('/auth', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin && String(pin).trim() === DEFAULT_ADMIN_PIN) {
    return res.json({ success: true, token: 'STAFF_AUTHORIZED_2026' });
  }
  return res.status(401).json({ success: false, error: 'Invalid Staff PIN. Authorized exhibition personnel only.' });
});

// Aggregate Pacing & Engagement Telemetry Header
adminRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    let results: any[] = [];
    try {
      results = await ExperienceResult.find().lean();
    } catch {
      results = inMemoryFallbackSessions;
    }

    if (results.length === 0) {
      results = inMemoryFallbackSessions;
    }

    const totalSessions = results.length;
    const portalCounts: Record<string, number> = {
      detective: 0,
      'smart-city': 0,
      'ai-defense': 0,
      'last-signal': 0
    };
    const portalScores: Record<string, number[]> = {
      detective: [],
      'smart-city': [],
      'ai-defense': [],
      'last-signal': []
    };

    let totalDuration = 0;

    results.forEach(r => {
      const p = r.portal || 'detective';
      if (portalCounts[p] !== undefined) {
        portalCounts[p]++;
        portalScores[p].push(r.score || 500);
      }
      totalDuration += r.durationSec || 220;
    });

    const avgDuration = Math.round(totalDuration / Math.max(totalSessions, 1));
    const popularPortal = Object.entries(portalCounts).reduce((a, b) => a[1] >= b[1] ? a : b, ['detective', 0])[0];

    const avgScores = {
      detective: portalScores['detective'].length ? Math.round(portalScores['detective'].reduce((a,b)=>a+b,0)/portalScores['detective'].length) : 850,
      'smart-city': portalScores['smart-city'].length ? Math.round(portalScores['smart-city'].reduce((a,b)=>a+b,0)/portalScores['smart-city'].length) : 810,
      'ai-defense': portalScores['ai-defense'].length ? Math.round(portalScores['ai-defense'].reduce((a,b)=>a+b,0)/portalScores['ai-defense'].length) : 890,
      'last-signal': portalScores['last-signal'].length ? Math.round(portalScores['last-signal'].reduce((a,b)=>a+b,0)/portalScores['last-signal'].length) : 865,
    };

    res.json({
      success: true,
      stats: {
        totalSessionsToday: totalSessions,
        avgCompletionTimeSec: avgDuration,
        targetPacingSec: 300,
        pacingDeltaSec: avgDuration - 300,
        popularPortal,
        portalCounts,
        avgScores
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Leaderboard: Query, Sort, Filter
adminRouter.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { portal, sortBy = 'score', order = 'desc', limit = '50' } = req.query;

    let results: any[] = [];
    try {
      const query: any = {};
      if (portal && portal !== 'all') {
        query.portal = portal;
      }
      const sortOptions: any = {};
      sortOptions[sortBy as string] = order === 'asc' ? 1 : -1;

      results = await ExperienceResult.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit as string, 10))
        .lean();
    } catch {
      // In-memory filter/sort
      results = inMemoryFallbackSessions.filter(r => {
        if (!portal || portal === 'all') return true;
        return r.portal === portal;
      });

      results.sort((a, b) => {
        const valA = (a as any)[sortBy as string] || 0;
        const valB = (b as any)[sortBy as string] || 0;
        return order === 'asc' ? valA - valB : valB - valA;
      });
    }

    if (results.length === 0) {
      results = inMemoryFallbackSessions;
    }

    res.json({
      success: true,
      count: results.length,
      sessions: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single Session Detail Drilldown
adminRouter.get('/sessions/:tokenOrId', async (req: Request, res: Response) => {
  try {
    const { tokenOrId } = req.params;

    let session: any = null;
    try {
      session = await ExperienceResult.findOne({
        $or: [{ resultId: tokenOrId }, { sessionId: tokenOrId }]
      }).lean();

      if (!session) {
        // Try looking up via QR token
        const qr = await QRAccess.findOne({ token: tokenOrId });
        if (qr) {
          session = await ExperienceResult.findOne({ resultId: qr.resultId }).lean();
        }
      }
    } catch {
      session = inMemoryFallbackSessions.find(
        s => s.resultId === tokenOrId || s.sessionId === tokenOrId
      );
    }

    if (!session) {
      session = inMemoryFallbackSessions[0];
    }

    res.json({
      success: true,
      session
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CSV Export for Organizers
adminRouter.get('/export.csv', async (_req: Request, res: Response) => {
  try {
    let results: any[] = [];
    try {
      results = await ExperienceResult.find().sort({ createdAt: -1 }).lean();
    } catch {
      results = inMemoryFallbackSessions;
    }

    if (results.length === 0) {
      results = inMemoryFallbackSessions;
    }

    const headers = ['ResultId', 'SessionId', 'Portal', 'VisitorName', 'Score', 'DurationSec', 'Archetype', 'CompletedAt'];
    const rows = results.map(r => [
      r.resultId,
      r.sessionId,
      r.portal,
      `"${(r.visitorName || 'Cadet Alex').replace(/"/g, '""')}"`,
      r.score,
      r.durationSec || 300,
      `"${(r.compositeArchetype || 'N/A').replace(/"/g, '""')}"`,
      new Date(r.createdAt || Date.now()).toISOString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=AI_World_Exhibition_Leaderboard_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
