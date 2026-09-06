import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { Scenario, SystemConfig } from './models/index.js';
import { CANONICAL_SCENARIOS } from './scenariosData.js';

export async function seedDatabase() {
  console.log('Seeding 40+ canonical unique scenarios into MongoDB...');
  await connectDB();

  try {
    for (const item of CANONICAL_SCENARIOS) {
      await Scenario.findOneAndUpdate(
        { scenarioId: item.scenarioId },
        {
          scenarioId: item.scenarioId,
          portal: item.portal,
          title: item.title,
          tagline: item.tagline,
          description: item.description,
          difficulty: item.difficulty,
          content: item.content,
          enabled: true
        },
        { upsert: true, new: true }
      );
    }

    // Default System Config
    await SystemConfig.findOneAndUpdate(
      { key: 'EXPO_TITLE' },
      { key: 'EXPO_TITLE', value: 'AI INTERACTIVE WORLD 2026' },
      { upsert: true }
    );
    await SystemConfig.findOneAndUpdate(
      { key: 'AUTO_RESET_SECONDS' },
      { key: 'AUTO_RESET_SECONDS', value: '45' },
      { upsert: true }
    );

    console.log(`Successfully seeded ${CANONICAL_SCENARIOS.length} unique scenarios across all 4 portals into MongoDB!`);
  } catch (err) {
    console.warn('MongoDB seeding noticed offline DB or mock mode:', err);
  }
}

// If run directly from CLI
if (process.argv[1]?.includes('seed')) {
  seedDatabase().then(() => {
    console.log('Seed execution finished.');
    process.exit(0);
  });
}
