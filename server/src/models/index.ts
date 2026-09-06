import mongoose, { Schema, Document } from 'mongoose';

/* =========================================================================
   1. USER SESSION MODEL
   ========================================================================= */
export interface IUserSession extends Document {
  sessionId: string;
  portal?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  mode: 'SOLO' | 'TEAM';
  teamSize: number;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  portal: { type: String },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'EXPIRED'], default: 'ACTIVE' },
  mode: { type: String, enum: ['SOLO', 'TEAM'], default: 'SOLO' },
  teamSize: { type: Number, default: 1 },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);

/* =========================================================================
   2. SCENARIO MODEL (40+ Canonical Scenarios Pool)
   ========================================================================= */
export interface IScenario extends Document {
  scenarioId: string;
  portal: 'detective' | 'smart-city' | 'ai-defense' | 'last-signal';
  title: string;
  tagline: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  content: Record<string, any>;
  enabled: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScenarioSchema = new Schema<IScenario>({
  scenarioId: { type: String, required: true, unique: true, index: true },
  portal: { 
    type: String, 
    required: true, 
    enum: ['detective', 'smart-city', 'ai-defense', 'last-signal'], 
    index: true 
  },
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'EASY' },
  content: { type: Schema.Types.Mixed, required: true },
  enabled: { type: Boolean, default: true, index: true },
  usageCount: { type: Number, default: 0, index: true },
  lastUsedAt: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Scenario = mongoose.model<IScenario>('Scenario', ScenarioSchema);

/* =========================================================================
   3. SCENARIO ASSIGNMENT MODEL (Tracks History for Non-Repetition)
   ========================================================================= */
export interface IScenarioAssignment extends Document {
  sessionId: string;
  scenarioId: string;
  portal: string;
  assignedAt: Date;
}

const ScenarioAssignmentSchema = new Schema<IScenarioAssignment>({
  sessionId: { type: String, required: true, index: true },
  scenarioId: { type: String, required: true, index: true },
  portal: { type: String, required: true, index: true },
  assignedAt: { type: Date, default: Date.now, index: true }
});

export const ScenarioAssignment = mongoose.model<IScenarioAssignment>('ScenarioAssignment', ScenarioAssignmentSchema);

/* =========================================================================
   4. EXPERIENCE RESULT MODEL (Authoritative Completion Result)
   ========================================================================= */
export interface IExperienceResult extends Document {
  resultId: string;
  sessionId: string;
  scenarioId: string;
  portal: string;
  score: number;
  xpEarned: number;
  level: number;
  achievements: string[];
  metrics: { label: string; value: string | number }[];
  aiSummary: string;
  snapshotUrl?: string;
  createdAt: Date;
}

const ExperienceResultSchema = new Schema<IExperienceResult>({
  resultId: { type: String, required: true, unique: true, index: true },
  sessionId: { type: String, required: true, index: true },
  scenarioId: { type: String, required: true },
  portal: { type: String, required: true },
  score: { type: Number, required: true },
  xpEarned: { type: Number, default: 500 },
  level: { type: Number, default: 1 },
  achievements: [{ type: String }],
  metrics: [{
    label: { type: String },
    value: { type: Schema.Types.Mixed }
  }],
  aiSummary: { type: String, default: '' },
  snapshotUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const ExperienceResult = mongoose.model<IExperienceResult>('ExperienceResult', ExperienceResultSchema);

/* =========================================================================
   5. QR ACCESS MODEL (Cryptographic Secure Tokens)
   ========================================================================= */
export interface IQRAccess extends Document {
  resultId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  scannedCount: number;
  lastScannedAt?: Date;
  createdAt: Date;
}

const QRAccessSchema = new Schema<IQRAccess>({
  resultId: { type: String, required: true, index: true },
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  scannedCount: { type: Number, default: 0 },
  lastScannedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const QRAccess = mongoose.model<IQRAccess>('QRAccess', QRAccessSchema);

/* =========================================================================
   6. EMAIL DELIVERY MODEL (Rate-Limited Logging)
   ========================================================================= */
export interface IEmailDelivery extends Document {
  resultId: string;
  recipient: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  attempts: number;
  errorMsg?: string;
  sentAt?: Date;
  createdAt: Date;
}

const EmailDeliverySchema = new Schema<IEmailDelivery>({
  resultId: { type: String, required: true, index: true },
  recipient: { type: String, required: true },
  status: { type: String, enum: ['QUEUED', 'SENT', 'FAILED'], default: 'QUEUED' },
  attempts: { type: Number, default: 1 },
  errorMsg: { type: String },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const EmailDelivery = mongoose.model<IEmailDelivery>('EmailDelivery', EmailDeliverySchema);

/* =========================================================================
   7. SYSTEM CONFIG MODEL
   ========================================================================= */
export interface ISystemConfig extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfig>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
