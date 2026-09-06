import { Scenario, ScenarioAssignment } from '../models/index.js';
import { CANONICAL_SCENARIOS, ScenarioDefinition } from '../scenariosData.js';

// In-memory assignment cache for rapid LRU calculation & offline resilience
const inMemoryAssignments: { portal: string; scenarioId: string; sessionId: string; assignedAt: Date }[] = [];
const inMemoryUsageCounts: Record<string, number> = {};

export class ScenarioEngine {
  /**
   * Assigns a unique, fair, non-repeating scenario for the student's portal session
   */
  public async assignScenario(portal: string, sessionId: string): Promise<ScenarioDefinition> {
    // 1. Fetch available enabled scenarios from DB or canonical dataset
    let scenarios: ScenarioDefinition[] = [];
    try {
      const dbScenarios = await Scenario.find({ portal, enabled: true }).lean();
      if (dbScenarios && dbScenarios.length > 0) {
        scenarios = dbScenarios.map(s => ({
          scenarioId: s.scenarioId,
          portal: s.portal as any,
          title: s.title,
          tagline: s.tagline,
          description: s.description,
          difficulty: s.difficulty as any,
          content: s.content,
          enabled: s.enabled,
          usageCount: s.usageCount
        }));
      }
    } catch {
      // Fallback below
    }

    if (scenarios.length === 0) {
      scenarios = CANONICAL_SCENARIOS.filter(s => s.portal === portal && s.enabled);
    }

    // 2. Fetch the last 3 assigned scenario IDs for this portal to prevent consecutive duplicates
    let recentScenarioIds: string[] = [];
    try {
      const recentDocs = await ScenarioAssignment.find({ portal })
        .sort({ assignedAt: -1 })
        .limit(3)
        .lean();
      recentScenarioIds = recentDocs.map(r => r.scenarioId);
    } catch {
      recentScenarioIds = inMemoryAssignments
        .filter(a => a.portal === portal)
        .slice(-3)
        .map(a => a.scenarioId);
    }

    // 3. Exclude scenarios used in the current session
    let sessionUsedIds: string[] = [];
    try {
      const sessionDocs = await ScenarioAssignment.find({ sessionId, portal }).lean();
      sessionUsedIds = sessionDocs.map(s => s.scenarioId);
    } catch {
      sessionUsedIds = inMemoryAssignments
        .filter(a => a.sessionId === sessionId && a.portal === portal)
        .map(a => a.scenarioId);
    }

    // 4. Filter eligible candidates: exclude last 3 and session used
    let eligible = scenarios.filter(s => 
      !recentScenarioIds.includes(s.scenarioId) && !sessionUsedIds.includes(s.scenarioId)
    );

    // If pool is tight, just exclude the immediate previous scenario
    if (eligible.length === 0 && recentScenarioIds.length > 0) {
      const immediatePrev = recentScenarioIds[0];
      eligible = scenarios.filter(s => s.scenarioId !== immediatePrev);
    }

    // Ultimate fallback if only 1 scenario exists
    if (eligible.length === 0) {
      eligible = scenarios;
    }

    // 5. Fair LRU + Least-Used Selection: sort by usage count ascending
    eligible.sort((a, b) => {
      const countA = a.usageCount || inMemoryUsageCounts[a.scenarioId] || 0;
      const countB = b.usageCount || inMemoryUsageCounts[b.scenarioId] || 0;
      return countA - countB;
    });

    // Select among top 3 least-used with controlled randomness
    const candidatePool = eligible.slice(0, Math.min(3, eligible.length));
    const selected = candidatePool[Math.floor(Math.random() * candidatePool.length)];

    // 6. Record assignment in database and in-memory tracker
    const now = new Date();
    try {
      await ScenarioAssignment.create({
        sessionId,
        scenarioId: selected.scenarioId,
        portal,
        assignedAt: now
      });
      await Scenario.updateOne(
        { scenarioId: selected.scenarioId },
        { 
          $inc: { usageCount: 1 },
          $set: { lastUsedAt: now }
        }
      );
    } catch (e) {
      // In-memory update
      inMemoryAssignments.push({
        portal,
        scenarioId: selected.scenarioId,
        sessionId,
        assignedAt: now
      });
      inMemoryUsageCounts[selected.scenarioId] = (inMemoryUsageCounts[selected.scenarioId] || 0) + 1;
    }

    return selected;
  }

  /**
   * Get scenario details by ID
   */
  public async getScenarioById(scenarioId: string): Promise<ScenarioDefinition | null> {
    try {
      const s = await Scenario.findOne({ scenarioId }).lean();
      if (s) {
        return {
          scenarioId: s.scenarioId,
          portal: s.portal as any,
          title: s.title,
          tagline: s.tagline,
          description: s.description,
          difficulty: s.difficulty as any,
          content: s.content,
          enabled: s.enabled,
          usageCount: s.usageCount
        };
      }
    } catch {
      // fallback to canonical list
    }
    return CANONICAL_SCENARIOS.find(s => s.scenarioId === scenarioId) || null;
  }

  /**
   * Reset usage counts (Operator function)
   */
  public async resetUsageCounts(): Promise<void> {
    try {
      await Scenario.updateMany({}, { $set: { usageCount: 0, lastUsedAt: null } });
      await ScenarioAssignment.deleteMany({});
    } catch {
      // In-memory reset
    }
    inMemoryAssignments.length = 0;
    for (const k in inMemoryUsageCounts) delete inMemoryUsageCounts[k];
  }
}

export const scenarioEngine = new ScenarioEngine();
