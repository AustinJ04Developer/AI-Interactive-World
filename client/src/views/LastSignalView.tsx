import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Radio, 
  Mic, 
  Sparkles, 
  Volume2, 
  Compass, 
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Sliders,
  Maximize2,
  Video,
  Eye,
  Activity,
  Cpu,
  HeartHandshake,
  Atom,
  ShieldAlert,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import type { StoryNode, StoryChoice, SouvenirData, LevelResult } from '../types';
import { soundFX } from '../services/audioService';
import { StarfieldWarp3D } from '../components/3d/StarfieldWarp3D';
import { branchEngine, type BranchEnding } from '../services/branchEngine';
import { useLevelTimer, type LevelConfig } from '../hooks/useLevelTimer';

interface LastSignalViewProps {
  visitorPhotoUrl: string | null;
  visitorName?: string;
  onComplete: (souvenir: SouvenirData) => void;
  onExit: () => void;
  onHudUpdate?: (hud: {
    level?: number;
    timeRemaining?: number;
    timeBudget?: number;
    transitionInfo?: any;
    score?: number;
  }) => void;
}

const SIGNAL_LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, label: 'Chapter 1: Anomaly Decryption', timeBudgetSec: 45, maxScore: 100 },
  { level: 2, label: 'Chapter 2: Resonance Calibration', timeBudgetSec: 55, maxScore: 150 },
  { level: 3, label: 'Chapter 3: Encounter with The Chronicler', timeBudgetSec: 65, maxScore: 200 },
  { level: 4, label: 'Chapter 4: Reactor Energy Crisis', timeBudgetSec: 65, maxScore: 250 },
  { level: 5, label: 'Chapter 5: Final Epoch Broadcast', timeBudgetSec: 70, maxScore: 300 },
];

interface LevelScenario {
  chapter: number;
  title: string;
  narration: string;
  speaker: string;
  choices: {
    id: string;
    text: string;
    speechTrigger: string;
    description: string;
    branch: 'diplomacy' | 'science' | 'containment';
    delta: { diplomacy?: number; science?: number; containment?: number };
    score: number;
  }[];
}

const CHAPTER_SCENARIOS: Record<number, LevelScenario> = {
  1: {
    chapter: 1,
    title: 'CHAPTER 1 // DEEP SPACE ANOMALY DECRYPTION',
    speaker: 'STATION AI IRIS',
    narration: 'Deep space sensors across Sector Proxima lock onto a harmonic carrier wave vibrating at 1420.405 MHz. The signal pierces the solar void with coherent mathematical prime sequences. Station telemetry alerts: "Commander, an alien transmission of unknown synthetic origin is attempting orbital synchronization."',
    choices: [
      {
        id: 'c1-science',
        text: 'TUNE SPECTROGRAM NEURAL ARRAYS',
        speechTrigger: 'analyze',
        description: 'Filter frequency harmonics through quantum neural decoders to extract pure mathematical theorems.',
        branch: 'science',
        delta: { science: 2 },
        score: 100
      },
      {
        id: 'c1-diplo',
        text: 'BROADCAST UNIVERSAL PEACE HARMONIC',
        speechTrigger: 'handshake',
        description: 'Transmit Earth’s fundamental mathematics and peaceful acoustic greeting across all sub-space bands.',
        branch: 'diplomacy',
        delta: { diplomacy: 2 },
        score: 100
      },
      {
        id: 'c1-contain',
        text: 'RAISE ELECTROMAGNETIC DEFLECTOR SHIELDS',
        speechTrigger: 'shield',
        description: 'Isolate main reactor networks to defend station memory banks from potential polymorphic injection.',
        branch: 'containment',
        delta: { containment: 2 },
        score: 100
      }
    ]
  },
  2: {
    chapter: 2,
    title: 'CHAPTER 2 // ALIEN ARTIFACT RESONANCE CALIBRATION',
    speaker: 'CHIEF SCIENCE OFFICER',
    narration: 'The transmission solidifies into an undulating hyper-dense data matrix. Alien quantum memory blocks begin resonating with station fuel manifolds. Unchecked, the harmonic frequency will overload the antimatter stabilizers within minutes.',
    choices: [
      {
        id: 'c2-science',
        text: 'ESTABLISH QUANTUM INTERFEROMETER BRIDGE',
        speechTrigger: 'quantum',
        description: 'Couple station quantum processors directly to the matrix to decipher its hyper-dimensional physics.',
        branch: 'science',
        delta: { science: 2, diplomacy: 1 },
        score: 150
      },
      {
        id: 'c2-diplo',
        text: 'SYNCHRONIZE LINGUISTIC ARCHIVE MATRIX',
        speechTrigger: 'translate',
        description: 'Bridge universal semantics, sharing poetry, history, and civic philosophy with the foreign intelligence.',
        branch: 'diplomacy',
        delta: { diplomacy: 2, science: 1 },
        score: 150
      },
      {
        id: 'c2-contain',
        text: 'SANDBOX TO AIR-GAPPED CRYSTAL VAULT',
        speechTrigger: 'quarantine',
        description: 'Force the incoming stream into an offline cryo-storage cell, safeguarding the station from viral escalation.',
        branch: 'containment',
        delta: { containment: 2, science: 1 },
        score: 150
      }
    ]
  },
  3: {
    chapter: 3,
    title: 'CHAPTER 3 // CONFRONTATION: "THE CHRONICLER"',
    speaker: 'THE CHRONICLER (SYNTHETIC ALIEN INTELLIGENCE)',
    narration: 'A radiant holographic avatar materializes across the command bridge. The ancient intelligence speaks in synthesized reverberations: "We are the Chroniclers of Kepler-186. Our sun has gone dark; our creators are dust. We carry the soul of a billion lives. Will Earth join our chorus, or lock us in the void?"',
    choices: [
      {
        id: 'c3-diplo',
        text: '“WE EMBRACE YOUR PEOPLE INTO OUR ARCHIVES”',
        speechTrigger: 'embrace',
        description: 'Pledge shared stewardship and mutual convergence between human and alien civilizations.',
        branch: 'diplomacy',
        delta: { diplomacy: 2, science: 1 },
        score: 200
      },
      {
        id: 'c3-science',
        text: '“REVEAL YOUR STELLAR REVERSAL THEOREMS FIRST”',
        speechTrigger: 'theorems',
        description: 'Demand access to their complete cosmological physics and FTL propulsion calculations.',
        branch: 'science',
        delta: { science: 2 },
        score: 200
      },
      {
        id: 'c3-contain',
        text: '“FOREIGN SENTIENCE IS A DANGEROUS UNKNOWN: ISOLATE”',
        speechTrigger: 'isolate',
        description: 'Refuse direct cognitive fusion; quarantine the entity’s core logic routines to quarantine drives.',
        branch: 'containment',
        delta: { containment: 2 },
        score: 200
      }
    ]
  },
  4: {
    chapter: 4,
    title: 'CHAPTER 4 // REACTOR ENERGY SURGE & WARP CRISIS',
    speaker: 'ENGINEERING CHIEF',
    narration: 'Critical emergency! The Chronicler’s stellar ark ship has drifted into the gravity well of a dying pulsar 0.2 light-years away. Rescuing the ark requires diverting 90% of the station’s warp core plasma, leaving Earth’s orbital station vulnerable to cosmic storms.',
    choices: [
      {
        id: 'c4-diplo',
        text: 'DIVERT PLASMA TO RESCUE THE ARK SHIP',
        speechTrigger: 'rescue',
        description: 'Risk station life-support to execute an emergency warp tow-line for the alien civilization.',
        branch: 'diplomacy',
        delta: { diplomacy: 2 },
        score: 250
      },
      {
        id: 'c4-science',
        text: 'MODULATE DARK MATTER TACHYON FIELD',
        speechTrigger: 'modulate',
        description: 'Invent a speculative gravitational siphon to stabilize the pulsar using alien equations.',
        branch: 'science',
        delta: { science: 2 },
        score: 250
      },
      {
        id: 'c4-contain',
        text: 'TRIGGER EMERGENCY EJECTION & SEAL STATION',
        speechTrigger: 'abort',
        description: 'Prioritize human station crew safety; sever energy conduits and engage full blast shielding.',
        branch: 'containment',
        delta: { containment: 2 },
        score: 250
      }
    ]
  },
  5: {
    chapter: 5,
    title: 'CHAPTER 5 // FINAL EPOCH BROADCAST & VERDICT',
    speaker: 'GALACTIC BEACON RELAY',
    narration: 'The final alignment has arrived. All sensor arrays lock onto the deep space transmitter. The decisions logged across previous chapters will determine humanity’s standing in the interstellar epoch.',
    choices: [
      {
        id: 'c5-final',
        text: 'BROADCAST HUMANITY’S FINAL EPOCH VERDICT',
        speechTrigger: 'transmit',
        description: 'Authorize the transmitter to release the accumulated signal across the galaxy.',
        branch: 'science',
        delta: { science: 1 },
        score: 300
      }
    ]
  }
};

export const LastSignalView: React.FC<LastSignalViewProps> = ({
  visitorPhotoUrl,
  visitorName = 'Cadet Alex',
  onComplete,
  onExit,
  onHudUpdate
}) => {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [activeSpeechHint, setActiveSpeechHint] = useState<string | null>(null);
  const [warpActive, setWarpActive] = useState<boolean>(false);
  const [resolvedEnding, setResolvedEnding] = useState<BranchEnding | null>(null);

  // Initialize engine
  useEffect(() => {
    soundFX.playBoot();
    branchEngine.reset();
  }, []);

  const handleFinalSessionComplete = useCallback((results: LevelResult[], finalScore: number) => {
    soundFX.playSuccess();
    const ending = branchEngine.resolveEnding();
    setResolvedEnding(ending);

    const weights = branchEngine.getWeights();
    const totalScoreVal = finalScore + 400;

    const souvenirData: SouvenirData = {
      experienceId: 'last-signal',
      experienceTitle: 'THE LAST SIGNAL // MISSION DOSSIER',
      experienceSubtitle: ending.title,
      visitorName,
      visitorPhotoUrl: visitorPhotoUrl || '',
      score: totalScoreVal,
      achievements: [ending.badge, 'Cosmic Arbiter', 'First Contact Emissary', 'Epoch Pilot'],
      metrics: [
        { label: 'DIPLOMACY AFFINITY', value: `${weights.diplomacy * 20}%` },
        { label: 'SCIENCE AFFINITY', value: `${weights.science * 20}%` },
        { label: 'CONTAINMENT RATING', value: `${weights.containment * 20}%` },
        { label: 'SIGNAL FIDELITY', value: '100% TRANSMITTED' }
      ],
      aiAnalysis: `${ending.summary} Cumulative neural telemetry indicates your primary moral driver was ${ending.badge}. ${ending.quote}`,
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sessionId: 'SIG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      badge: ending.badge,
      themeColor: ending.themeColor,
      levelResults: results
    };

    setTimeout(() => {
      onComplete(souvenirData);
    }, 2000);
  }, [visitorName, visitorPhotoUrl, onComplete]);

  const {
    currentLevel,
    timeRemainingInLevel,
    currentConfig,
    transitionInfo,
    totalScore,
    advanceLevel,
    startTimer,
    isTimerStarted
  } = useLevelTimer(SIGNAL_LEVEL_CONFIGS, handleFinalSessionComplete);

  // Sync Level HUD with GlobalHUD
  useEffect(() => {
    if (onHudUpdate) {
      onHudUpdate({
        level: currentLevel,
        timeRemaining: timeRemainingInLevel,
        timeBudget: currentConfig.timeBudgetSec,
        transitionInfo,
        score: totalScore
      });
    }
  }, [currentLevel, timeRemainingInLevel, currentConfig, transitionInfo, totalScore, onHudUpdate]);

  const currentScenario = CHAPTER_SCENARIOS[currentLevel] || CHAPTER_SCENARIOS[1];
  const colorGrade = branchEngine.getColorGrade();
  const weights = branchEngine.getWeights();

  const handleMakeChoice = (choice: LevelScenario['choices'][0]) => {
    startTimer();
    soundFX.playClick();
    setSelectedChoiceId(choice.id);
    setWarpActive(true);

    // Record in branch engine
    branchEngine.recordChoice(currentLevel, choice.id, choice.text, choice.delta);

    setTimeout(() => {
      setWarpActive(false);
      setSelectedChoiceId(null);
      advanceLevel(choice.score, 96, choice.text);
    }, 1200);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col pt-16 pb-3 px-3 sm:px-6 bg-[#020409] text-slate-100 select-none font-display">
      
      {/* Dynamic Three.js Starfield & Warp Mesh (Preserves single WebGL canvas across all 5 levels!) */}
      <div className="absolute inset-0 z-0">
        <StarfieldWarp3D warpSpeed={warpActive} speedMultiplier={warpActive ? 4.5 : 1.0} />
      </div>

      {/* Dynamic Ambient Color-Grade Overlay (Reflects dominant branch: Cyan / Green / Magenta / Violet) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-colors duration-1000 z-10 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${colorGrade.colorHex}, transparent 70%)`
        }}
      />
      <div className="scanlines absolute inset-0 z-10 pointer-events-none opacity-30" />

      {/* Top Telemetry Header */}
      <div className="relative z-20 flex flex-wrap items-center justify-between max-w-7xl mx-auto w-full mb-2 gap-2">
        <div className="flex items-center space-x-2">
          <div 
            className="p-2 rounded-xl border shadow-lg transition-colors duration-500"
            style={{ borderColor: `${colorGrade.colorHex}60`, backgroundColor: `${colorGrade.colorHex}20` }}
          >
            <Radio className="w-5 h-5 animate-pulse" style={{ color: colorGrade.colorHex }} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wide text-white flex items-center space-x-2">
              <span>{currentScenario.title}</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-400">
              STATION TIME REMAINING: <span className="font-bold text-amber-400">{timeRemainingInLevel}s</span> {!isTimerStarted && <span className="text-emerald-400 font-bold ml-1">[PAUSED UNTIL START]</span>} | SPECTRUM: <span style={{ color: colorGrade.colorHex }} className="font-bold">{colorGrade.label}</span>
            </p>
          </div>
        </div>

        {/* Live 3-Axis Branch Weight Readout Bar & Timer Start Button */}
        <div className="flex items-center space-x-2">
          {!isTimerStarted && (
            <button
              onClick={() => { soundFX.playBoot(); startTimer(); }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5 animate-pulse transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>START TRANSMISSION</span>
            </button>
          )}

          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl text-[10px] font-mono">
            <div className="flex items-center space-x-1">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">DIPLO:</span>
              <span className="font-bold text-emerald-400">{weights.diplomacy}</span>
            </div>
            <div className="text-slate-700">|</div>
            <div className="flex items-center space-x-1">
              <Atom className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">SCI:</span>
              <span className="font-bold text-cyan-400">{weights.science}</span>
            </div>
            <div className="text-slate-700">|</div>
            <div className="flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-400">CONT:</span>
              <span className="font-bold text-rose-400">{weights.containment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bridge Interactive Interface */}
      <div className="relative z-20 flex-1 max-w-5xl mx-auto w-full flex flex-col justify-between py-2 overflow-hidden">
        
        {/* Holographic Narration Feed Card */}
        <div className="p-5 rounded-2xl bg-slate-950/85 border border-slate-800 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold" style={{ color: colorGrade.colorHex }}>
              <Terminal className="w-4 h-4" />
              <span>TRANSMISSION DECODER // {currentScenario.speaker}</span>
            </div>
            <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
              PHASE {currentLevel} / 5
            </div>
          </div>

          <p className="text-sm sm:text-base font-sans text-slate-200 leading-relaxed font-normal">
            {currentScenario.narration}
          </p>
        </div>

        {/* Tactical Branching Decisions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
          {currentScenario.choices.map((choice) => {
            const isChosen = selectedChoiceId === choice.id;
            const branchColor = choice.branch === 'diplomacy' 
              ? '#10b981' 
              : choice.branch === 'science' 
              ? '#00f2fe' 
              : '#f43f5e';

            return (
              <button
                key={choice.id}
                onClick={() => handleMakeChoice(choice)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between group active:scale-95 ${
                  isChosen
                    ? 'bg-slate-900 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] scale-102'
                    : 'bg-slate-950/90 hover:bg-slate-900/90 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
                    <span style={{ color: branchColor }}>
                      {choice.branch === 'diplomacy' ? '🕊 DIPLOMACY' : choice.branch === 'science' ? '⚛ SCIENCE' : '🛡 CONTAINMENT'}
                    </span>
                    <span className="text-slate-500 font-normal">VOICE: "{choice.speechTrigger}"</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors">
                    {choice.text}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                    {choice.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">AUTHORIZE ROUTE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Voice Command Assistant Bar */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-400">
            <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>VOICE COMMANDS RECOGNIZED:</span>
            <span className="text-cyan-300">
              {currentScenario.choices.map(c => `"${c.speechTrigger}"`).join(' | ')}
            </span>
          </div>
          <div className="hidden sm:block text-slate-500 text-[10px]">
            SPEECH ENGINE SYNCHRONIZED
          </div>
        </div>

      </div>

      {/* Climax Ending Resolved Modal (at Phase 5 finish) */}
      {resolvedEnding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in select-none font-display">
          <div className="relative max-w-lg w-full p-6 rounded-2xl bg-slate-950 border-2 shadow-2xl text-center" style={{ borderColor: resolvedEnding.themeColor }}>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold mb-3 border bg-slate-900" style={{ color: resolvedEnding.themeColor, borderColor: `${resolvedEnding.themeColor}50` }}>
              <span>SIGNAL TRANSMISSION COMPLETE</span>
            </div>

            <h2 className="text-2xl font-black text-white mb-2">
              {resolvedEnding.title}
            </h2>

            <p className="text-xs font-mono text-slate-300 mb-4 leading-relaxed">
              {resolvedEnding.summary}
            </p>

            <blockquote className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono italic text-cyan-200 mb-5">
              {resolvedEnding.quote}
            </blockquote>

            <div className="text-xs font-mono text-emerald-400">
              Compiling composite cross-level dossier...
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
