import { Router, Request, Response } from 'express';
import { scenarioEngine } from '../services/scenarioEngine.js';
import { Scenario } from '../models/index.js';
import { CANONICAL_SCENARIOS } from '../scenariosData.js';

export const scenarioRouter = Router();

// Assign unique non-repeating scenario
scenarioRouter.get('/experiences/:portal/scenario', async (req: Request, res: Response) => {
  try {
    const portal = req.params.portal as string;
    const sessionId = (req.query.sessionId as string) || 'SESSION-DEFAULT';

    const validPortals = ['detective', 'smart-city', 'ai-defense', 'last-signal'];
    if (!validPortals.includes(portal)) {
      return res.status(400).json({ success: false, error: 'Invalid portal identifier' });
    }

    const assigned = await scenarioEngine.assignScenario(portal, sessionId);

    res.json({
      success: true,
      scenario: assigned,
      sessionId
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Operator Scenario Management: list all scenarios
scenarioRouter.get('/scenarios/manage', async (req: Request, res: Response) => {
  try {
    let scenarios: any[] = [];
    try {
      scenarios = await Scenario.find().sort({ portal: 1, scenarioId: 1 }).lean();
    } catch {
      // ignore
    }
    if (scenarios.length === 0) {
      scenarios = CANONICAL_SCENARIOS;
    }

    res.json({
      success: true,
      totalCount: scenarios.length,
      scenarios
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Operator toggle scenario
scenarioRouter.post('/scenarios/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    try {
      await Scenario.updateOne({ scenarioId: id }, { $set: { enabled } });
    } catch {
      const match = CANONICAL_SCENARIOS.find(s => s.scenarioId === id);
      if (match) match.enabled = enabled;
    }

    res.json({ success: true, scenarioId: id, enabled });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Operator reset scenario usage counts
scenarioRouter.post('/scenarios/reset-usage', async (req: Request, res: Response) => {
  try {
    await scenarioEngine.resetUsageCounts();
    res.json({ success: true, message: 'All scenario usage counters reset to zero' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
