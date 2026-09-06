import { Router, Request, Response } from 'express';
import { aiProvider } from '../services/aiProvider.js';

export const aiRouter = Router();

aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { action, npcName, role, message, clueTitle, suspectName, scenarioTitle, experience, score, achievements } = req.body;

    if (action === 'npc') {
      const responseText = await aiProvider.talkToNPC(npcName || 'AI Citizen', role || 'Guide', message || 'Hello');
      return res.json({ success: true, text: responseText });
    }

    if (action === 'detective') {
      const deduction = await aiProvider.analyzeDetectiveClue(clueTitle || 'Clue', suspectName || 'Suspect', scenarioTitle || 'Investigation');
      return res.json({ success: true, ...deduction });
    }

    if (action === 'commendation') {
      const summary = await aiProvider.generateSouvenirCommendation(experience || 'detective', score || 500, achievements || []);
      return res.json({ success: true, text: summary });
    }

    res.status(400).json({ success: false, error: 'Unknown AI action' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
