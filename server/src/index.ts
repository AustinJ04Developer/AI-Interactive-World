import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config.js';
import { connectDB } from './db.js';
import { seedDatabase } from './seed.js';

import { sessionRouter } from './routes/sessionRoutes.js';
import { scenarioRouter } from './routes/scenarioRoutes.js';
import { resultRouter } from './routes/resultRoutes.js';
import { emailRouter } from './routes/emailRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { operatorRouter } from './routes/operatorRoutes.js';
import { healthRouter } from './routes/healthRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';

const app = express();

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve uploaded snapshots statically with explicit cross-origin permissions
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.resolve(process.cwd(), 'uploads')));

// Mount API routes
app.use('/api/session', sessionRouter);
app.use('/api', scenarioRouter);
app.use('/api', resultRouter);
app.use('/api/email', emailRouter);
app.use('/api/ai', aiRouter);
app.use('/api/operator', operatorRouter);
app.use('/api/system', healthRouter);
app.use('/api/admin', adminRouter);

// Root informational endpoint
app.get('/api', (_req, res) => {
  res.json({
    name: 'AI Interactive World API',
    version: '2.0.0',
    status: 'ACTIVE',
    mode: config.mockAi ? 'DEVELOPMENT_MOCK_AI' : 'PRODUCTION_AI'
  });
});

// Start Server
async function startServer() {
  try {
    await connectDB();
    // Seed initial 40+ scenarios
    await seedDatabase();

    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 AI INTERACTIVE WORLD — BACKEND SERVER ONLINE`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🛡️ AI Mode: ${config.mockAi ? 'Simulated Local Neural Engine' : 'Live Gemini 2.5'}`);
      console.log(`💾 Database: MongoDB (${config.mongoUri})`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

startServer();
