# DATABASE ARCHITECTURE — MONGODB (MONGOOSE)

AI INTERACTIVE WORLD uses MongoDB via Mongoose for flexible, schema-driven persistence of complex game scenarios, session telemetry, and secure QR tokens.

---

## 📊 Collections & Schemas

### 1. `usersessions`
Tracks an individual visitor or student team interaction.
```typescript
{
  sessionId: String,         // Unique session identifier, e.g. "SESSION-8F4K2"
  portal: String,            // 'detective' | 'smart-city' | 'ai-defense' | 'last-signal'
  status: String,            // 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
  mode: String,              // 'SOLO' | 'TEAM'
  teamSize: Number,          // 1 to 4
  startedAt: Date,
  endedAt: Date,
  createdAt: Date
}
```

### 2. `scenarios`
Stores 40+ canonical scenario definitions (10+ per portal).
```typescript
{
  scenarioId: String,        // e.g. 'DET-001', 'CTY-002', 'DEF-003', 'SPC-004'
  portal: String,            // 'detective' | 'smart-city' | 'ai-defense' | 'last-signal'
  title: String,             // Scenario title
  tagline: String,           // One-line teaser
  description: String,       // Brief student summary
  difficulty: String,        // 'EASY' | 'MEDIUM' | 'HARD'
  content: Object,           // Canonical clues, suspects, NPCs, wave parameters, choices
  enabled: Boolean,          // Can be toggled on/off in Operator Panel
  usageCount: Number,        // Number of times assigned (used in fair rotation)
  lastUsedAt: Date
}
```

### 3. `scenarioassignments`
Logs assignment history to ensure **fair rotation and non-repetition** for consecutive students.
```typescript
{
  sessionId: String,
  scenarioId: String,
  portal: String,
  assignedAt: Date
}
```
*Index: `portal: 1, assignedAt: -1` enables ultra-fast LRU exclusion of the last 3 scenarios.*

### 4. `experienceresults`
Stores the authoritative score, XP, badges, and snapshot metadata upon mission completion.
```typescript
{
  resultId: String,          // e.g. "RES-A89F"
  sessionId: String,
  scenarioId: String,
  portal: String,
  score: Number,             // Up to 1000 PTS
  xpEarned: Number,          // +500 XP
  level: Number,
  achievements: [String],    // Array of unlocked badges
  metrics: [{ label: String, value: Mixed }],
  aiSummary: String,
  snapshotUrl: String,
  createdAt: Date
}
```

### 5. `qraccesses`
Manages secure cryptographic tokens for the public mobile result page (`/results/:token`).
```typescript
{
  resultId: String,
  token: String,             // 32-character crypto hex
  expiresAt: Date,           // 7 days TTL
  revoked: Boolean,
  scannedCount: Number,      // Tracks mobile phone scans
  lastScannedAt: Date,
  createdAt: Date
}
```

### 6. `emaildeliveries`
Enforces rate limits and tracks souvenir report dispatch attempts.
```typescript
{
  resultId: String,
  recipient: String,
  status: String,            // 'QUEUED' | 'SENT' | 'FAILED'
  attempts: Number,          // Max 3 attempts enforced
  errorMsg: String,
  sentAt: Date,
  createdAt: Date
}
```

---

## 🔄 Fair Scenario Rotation Algorithm
When a student taps "START MISSION", the backend executes:
1. Fetch all enabled scenarios for that portal.
2. Query `scenarioassignments` for the last 3 assigned scenario IDs in this portal.
3. Exclude recently assigned and session-used scenarios (`CURRENT != PREVIOUS` and `CURRENT != LAST 3`).
4. Sort remaining eligible candidates by `usageCount` ascending (Least Recently Used).
5. Apply controlled randomness among the least-used candidates.
6. Record assignment in `scenarioassignments` and increment `usageCount`.
