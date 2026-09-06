export type ViewState = 
  | 'landing'
  | 'welcome'
  | 'portal'
  | 'detective'
  | 'smart-city'
  | 'ai-defense'
  | 'last-signal'
  | 'results';

export type ExperienceId = 'detective' | 'smart-city' | 'ai-defense' | 'last-signal';

export interface HardwareStatus {
  camera: 'granted' | 'denied' | 'prompt' | 'unavailable';
  microphone: 'granted' | 'denied' | 'prompt' | 'unavailable';
  aiOnline: boolean;
  soundEnabled: boolean;
  fullscreen: boolean;
  expoMode: boolean;
  demoMode: boolean;
}

export interface VisitorSession {
  id: string;
  timestamp: string;
  visitorPhotoUrl: string | null;
  experienceCompleted: ExperienceId | null;
  score: number;
  achievements: string[];
  metrics: Record<string, string | number>;
  aiSummary: string;
  caseStatus?: string;
  endingName?: string;
}

/* --- Detective Experience Types --- */
export interface DialogueNode {
  id: string;
  prompt: string;
  response: string;
  stressLevel: number; // 0 - 100
  revealsClueId?: string;
  isContradiction?: boolean;
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  alibi: string;
  motive: string;
  statement: string;
  avatar: string;
  contradiction: string;
  isCulprit: boolean;
  dialogueTree?: DialogueNode[];
  boardPosition?: { x: number; y: number };
}

export interface ClueEvidence {
  id: string;
  title: string;
  category: 'CCTV' | 'AUDIO' | 'DOCUMENT' | 'BIOMETRIC';
  timestamp: string;
  description: string;
  details: string;
  unlocked: boolean;
  conflictClueId?: string;
  level?: number; // 1 to 5
  boardPosition?: { x: number; y: number };
  isPinned?: boolean;
}

/* --- Smart City 2050 Types --- */
export interface CitySector {
  id: string;
  name: string;
  description: string;
  color: string;
  coordinates: [number, number, number];
}

export interface CityNPC {
  id: string;
  name: string;
  role: string;
  sectorId: string;
  personality: string;
  avatar: string;
  dialogueGreeting: string;
  responses: Record<string, string>;
  position: [number, number, number];
}

/* --- AI Defense Types --- */
export interface DefenseThreat {
  id: string;
  type: 'glitch' | 'malware' | 'quantum-probe' | 'ddos-cluster';
  x: number;
  y: number;
  speed: number;
  health: number;
  points: number;
  radius?: number;
  color?: string;
  mutationLabel?: string;
}

export interface PlayerAdaptationStats {
  reactionTimeMs: number;
  accuracyPct: number;
  threatsNeutralized: number;
  difficultyLevel: number;
  aiAggressionLevel: number;
  riskTolerance: 'Cautious' | 'Balanced' | 'Hyper-Aggressive';
}

/* --- The Last Signal Types --- */
export interface StoryChoice {
  id: string;
  text: string;
  speechTrigger: string;
  targetNodeId: string;
  consequence: string;
}

export interface StoryNode {
  id: string;
  sceneTitle: string;
  visualBackdrop: string;
  narration: string;
  soundCue?: string;
  choices: StoryChoice[];
  isEnding?: boolean;
  endingTitle?: string;
  endingBadge?: string;
}

/* --- Level & Cross-Level Correlation Types --- */
export interface LevelResult {
  level: number; // 1-5
  label: string; // e.g. "Evidence Sweep", "Transit Sector", "Wave 3: Decryption"
  score: number;
  maxScore: number;
  timeTakenSec: number;
  timeBudgetSec: number;
  completedBeforeTimeout: boolean;
  accuracy?: number;
  keyChoice?: string;
}

export interface CorrelationAnalysis {
  trend: 'improving' | 'steady' | 'declining' | 'erratic';
  trendLabel: string;
  consistencyRating: string;
  standoutLevel: { level: number; label: string; reason: string } | null;
  compositeTitle: string;
  compositeArchetype?: string;
  compositeGrade: 'S+' | 'S' | 'A' | 'B' | 'C';
  sparklinePoints: number[];
  portalSpecificGraphic?: {
    type: 'evidence-trail' | 'branch-triangle' | 'defense-telemetry' | 'city-efficiency';
    summary: string;
    details: any;
  };
}

/* --- Souvenir Snapshot --- */
export interface SouvenirData {
  visitorName?: string;
  experienceId: ExperienceId;
  experienceTitle: string;
  experienceSubtitle: string;
  visitorPhotoUrl: string;
  score: number;
  achievements: string[];
  metrics: { label: string; value: string | number }[];
  aiAnalysis: string;
  dateStr: string;
  sessionId: string;
  badge: string;
  themeColor: string;
  levelResults?: LevelResult[];
  correlation?: CorrelationAnalysis;
}
