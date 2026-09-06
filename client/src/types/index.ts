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
}
