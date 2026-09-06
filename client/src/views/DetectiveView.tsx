import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FileText, 
  Video, 
  Mic, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  Award, 
  Box, 
  Eye, 
  AlertTriangle,
  Fingerprint,
  Pin,
  Layers,
  ChevronRight,
  MessageSquare,
  Scale,
  Activity
} from 'lucide-react';
import type { SouvenirData, ClueEvidence, Suspect, LevelResult } from '../types';
import { apiService, type AssignedScenarioResponse } from '../services/apiService';
import { NovaGuide } from '../components/nova/NovaGuide';
import { ScenarioCCTVPlayer } from '../components/detective/ScenarioCCTVPlayer';
import { DetectiveCaseWall } from '../components/detective/DetectiveCaseWall';
import { SuspectDialogueModal } from '../components/detective/SuspectDialogueModal';
import { soundFX } from '../services/audioService';
import { useLevelTimer, type LevelConfig } from '../hooks/useLevelTimer';

interface DetectiveViewProps {
  sessionId: string;
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

const DETECTIVE_LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, label: 'Phase 1: Crime Scene Holographic Sweep', timeBudgetSec: 45, maxScore: 100 },
  { level: 2, label: 'Phase 2: Digital Forensics & Log Decryption', timeBudgetSec: 55, maxScore: 150 },
  { level: 3, label: 'Phase 3: Suspect Interrogation & Polygraph', timeBudgetSec: 65, maxScore: 200 },
  { level: 4, label: 'Phase 4: Sensor & Evidence Synthesis', timeBudgetSec: 65, maxScore: 250 },
  { level: 5, label: 'Phase 5: Grand Case Accusation & Verdict', timeBudgetSec: 70, maxScore: 300 },
];

export const DetectiveView: React.FC<DetectiveViewProps> = ({
  sessionId,
  visitorPhotoUrl,
  visitorName = 'Cadet Alex',
  onComplete,
  onExit,
  onHudUpdate
}) => {
  const [scenario, setScenario] = useState<AssignedScenarioResponse | null>(null);
  const [loadingScenario, setLoadingScenario] = useState<boolean>(true);
  
  // Case-Wall pinned evidence tracking (accumulates across levels 1-5)
  const [pinnedClueIds, setPinnedClueIds] = useState<string[]>(['c1']);
  const [selectedClue, setSelectedClue] = useState<ClueEvidence | null>(null);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [isInterrogationOpen, setIsInterrogationOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'case-wall' | 'cctv' | 'suspects' | 'accuse'>('case-wall');
  
  // Multi-tier NOVA AI hints
  const [novaTier, setNovaTier] = useState<1 | 2 | 3>(1);
  const [aiDeduction, setAiDeduction] = useState<string>('Examine crime scene clues and cross-reference timestamps with suspect statements.');
  const [interrogatedSuspects, setInterrogatedSuspects] = useState<Record<string, { tested: boolean; isContradiction: boolean; stress: number }>>({});
  const [isDebriefing, setIsDebriefing] = useState<boolean>(false);
  const [debriefOutcome, setDebriefOutcome] = useState<{ isCorrect: boolean; culpritName: string; explanation: string } | null>(null);

  const updateNovaDeduction = useCallback((tier: 1 | 2 | 3, clue: ClueEvidence | null, scen: AssignedScenarioResponse | null) => {
    if (tier === 1) {
      if (clue) {
        setAiDeduction(`[DIRECT OBSERVATION] Clue "${clue.title}" logged at ${clue.timestamp}: ${clue.details}`);
      } else {
        setAiDeduction('Examine crime scene clues and cross-reference timestamps with suspect statements.');
      }
    } else if (tier === 2) {
      setAiDeduction(`[GUIDED FORENSICS] Notice the access log at 02:14. One suspect claims an airtight alibi, but biometric access telemetry records their presence inside the restricted vault!`);
    } else {
      const culprit = scen?.content?.culpritName || 'Ava Cross';
      const reason = scen?.content?.solutionReason || 'Keycard and biometric timeline logs contradict their alibi.';
      setAiDeduction(`[CRITICAL FORENSIC MATCH] Sensor synthesis confirms the intruder is ${culprit}! Telemetry proof: ${reason} File charges against ${culprit} to convict!`);
    }
  }, []);

  // Universal 5-Level Scaffolding Completion
  const handleSessionComplete = useCallback((results: LevelResult[], finalScore: number) => {
    soundFX.playShutter();

    const isAccusationCorrect = debriefOutcome?.isCorrect ?? false;
    const priorLevelsCompletedWithoutTimeout = results.slice(0, 4).filter(r => r.completedBeforeTimeout).length;
    const earnedBadge = isAccusationCorrect && priorLevelsCompletedWithoutTimeout >= 3;

    const totalScoreVal = finalScore + (isAccusationCorrect ? 450 : 200);

    const souvenirData: SouvenirData = {
      experienceId: 'detective',
      experienceTitle: 'SUPER DETECTIVE // CASE REPORT',
      experienceSubtitle: isAccusationCorrect ? 'CASE SOLVED: CULPRIT APPREHENDED' : 'CASE CONCLUDED: FORENSIC DEBRIEF',
      visitorName,
      visitorPhotoUrl: visitorPhotoUrl || '',
      score: totalScoreVal,
      achievements: isAccusationCorrect
        ? ['Master Detective', 'Contradiction Hunter', 'Polygraph Expert', 'Evidence Synthesizer']
        : ['Forensic Analyst', 'Investigative Grit'],
      metrics: [
        { label: 'EVIDENCE PINNED', value: `${pinnedClueIds.length} ARTIFACTS` },
        { label: 'FORENSIC ACCURACY', value: isAccusationCorrect ? '98.5%' : '65.0%' },
        { label: 'CASE TIMELINE', value: '5 PHASES SYNCHRONIZED' },
        { label: 'CONTRADICTIONS EXPOSED', value: `${isAccusationCorrect ? 3 : 1} FLAGS` }
      ],
      aiAnalysis: isAccusationCorrect
        ? `Brilliant deductive reasoning. You mapped ${pinnedClueIds.length} corroborating clues across the case-wall, caught critical polygraph tells, and identified ${debriefOutcome?.culpritName} without flaw.`
        : `Comprehensive case debrief filed. While the initial accusation encountered contradictory telemetry, your forensic analysis recovered essential evidence across all 5 operational phases.`,
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sessionId: 'DET-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      badge: earnedBadge ? 'MASTER DETECTIVE' : 'FORENSIC CADET',
      themeColor: '#00f2fe',
      levelResults: results
    };

    setTimeout(() => {
      onComplete(souvenirData);
    }, 1500);
  }, [debriefOutcome, pinnedClueIds.length, visitorName, visitorPhotoUrl, onComplete]);

  const {
    currentLevel,
    timeRemainingInLevel,
    currentConfig,
    transitionInfo,
    totalScore,
    advanceLevel,
    timeoutLevel,
    startTimer,
    isTimerStarted
  } = useLevelTimer(DETECTIVE_LEVEL_CONFIGS, handleSessionComplete);

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

  // Fetch assigned scenario on mount
  useEffect(() => {
    soundFX.playBoot();
    apiService.fetchScenario('detective', sessionId).then((data) => {
      if (data) {
        setScenario(data);
        if (data.content?.clues?.length > 0) setSelectedClue(data.content.clues[0]);
        if (data.content?.suspects?.length > 0) setSelectedSuspect(data.content.suspects[0]);
      }
      setLoadingScenario(false);
    });
  }, [sessionId]);

  const clues: ClueEvidence[] = useMemo(() => {
    if (!scenario?.content?.clues) return [];
    return scenario.content.clues.map((c: any, idx: number) => ({
      ...c,
      level: (idx % 5) + 1,
      unlocked: true,
      isPinned: pinnedClueIds.includes(c.id)
    }));
  }, [scenario, pinnedClueIds]);

  const suspects: Suspect[] = useMemo(() => {
    if (!scenario?.content?.suspects) return [];
    return scenario.content.suspects.map((s: any) => ({
      ...s,
      isCulprit: s.id === scenario.content.culpritId || s.name === scenario.content.culpritName
    }));
  }, [scenario]);

  const handleTogglePinClue = (clueId: string) => {
    startTimer();
    soundFX.playClick();
    setPinnedClueIds(prev => {
      if (prev.includes(clueId)) {
        return prev.filter(id => id !== clueId);
      } else {
        return [...prev, clueId];
      }
    });
  };

  const handleInspectClue = async (clue: ClueEvidence) => {
    startTimer();
    soundFX.playClick();
    setSelectedClue(clue);
    soundFX.playAIProcess();

    updateNovaDeduction(novaTier, clue, scenario);

    // Auto-progress level 1 or 2 if examining clues
    if (currentLevel === 1 && pinnedClueIds.length >= 2) {
      advanceLevel(currentConfig.maxScore, 95, `Evidence Swept: ${clue.title}`);
    } else if (currentLevel === 2 && pinnedClueIds.length >= 3) {
      advanceLevel(currentConfig.maxScore, 92, `Decryption Verified: ${clue.title}`);
    }
  };

  const handleOpenInterrogation = (suspect: Suspect) => {
    startTimer();
    soundFX.playClick();
    setSelectedSuspect(suspect);
    setIsInterrogationOpen(true);
  };

  const handlePinTestimony = (testimony: string) => {
    soundFX.playClick();
    if (selectedSuspect) {
      setInterrogatedSuspects(prev => ({
        ...prev,
        [selectedSuspect.id]: {
          tested: true,
          isContradiction: selectedSuspect.isCulprit,
          stress: selectedSuspect.isCulprit ? 92 : 24
        }
      }));
    }
    // Advance Phase 3 on active interrogation testimony
    if (currentLevel === 3) {
      advanceLevel(currentConfig.maxScore, 90, `Testimony Logged: ${selectedSuspect?.name}`);
    }
    setAiDeduction(`[TESTIMONY PINNED] Polygraph result for ${selectedSuspect?.name}: ${selectedSuspect?.isCulprit ? '⚠ SEVERE BIOMETRIC STRESS (92%) — CONTRADICTION DETECTED!' : '✓ Normal stress levels (24%) — Statement corroborated.'}`);
    setIsInterrogationOpen(false);
  };

  const getSuspectPhoto = (name: string): string => {
    if (name.includes('Thorne') || name.includes('Silas') || name.includes('Vance')) return '/media/suspect_thorne.jpg';
    if (name.includes('Elena') || name.includes('Rostova') || name.includes('Ava') || name.includes('Evelyn')) return '/media/suspect_elena.jpg';
    if (name.includes('Finnick') || name.includes('Troy') || name.includes('Drake') || name.includes('Marcus')) return '/media/suspect_finnick.jpg';
    return '/media/suspect_maya.jpg';
  };

  const handleAccusation = (suspect: Suspect) => {
    soundFX.playWarp();
    const isCorrect = suspect.isCulprit;
    const culpritName = scenario?.content?.culpritName || 'Ava Cross';
    const explanation = scenario?.content?.solutionReason || 'Keycard and biometric timeline logs contradict their alibi.';

    setDebriefOutcome({
      isCorrect,
      culpritName,
      explanation
    });
    setIsDebriefing(true);

    if (isCorrect) {
      soundFX.playSuccess();
      advanceLevel(currentConfig.maxScore, 98, `Accused: ${suspect.name} (Correct)`);
    } else {
      soundFX.playAlert();
      // Non-fatal wrong accusation: debrief educates cadet, auto-resolves level
      advanceLevel(Math.floor(currentConfig.maxScore * 0.4), 65, `Debrief: Accused ${suspect.name}`);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-[#020408] via-[#050b18] to-black text-white p-3 sm:p-5 overflow-hidden select-none font-sans">
      <div className="scanlines absolute inset-0 pointer-events-none opacity-20" />

      {/* Top Detective Tactical Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between pb-3 border-b border-cyan-500/20 gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <Search className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                SUPER DETECTIVE // V2.0
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                EVIDENCE PINNED: {pinnedClueIds.length}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              {scenario?.title || 'QUANTUM CORE SABOTAGE'}
            </h2>
          </div>
        </div>

        {/* View Switcher Tabs & Timer Status */}
        <div className="flex items-center space-x-2">
          {!isTimerStarted && (
            <button
              onClick={() => { soundFX.playBoot(); startTimer(); }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5 animate-pulse transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>START INVESTIGATION</span>
            </button>
          )}

          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800">
            <button
              onClick={() => { soundFX.playClick(); startTimer(); setActiveTab('case-wall'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'case-wall' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>CASE-WALL</span>
            </button>
            <button
              onClick={() => { soundFX.playClick(); startTimer(); setActiveTab('cctv'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'cctv' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>CCTV FEED</span>
            </button>
            <button
              onClick={() => { soundFX.playClick(); startTimer(); setActiveTab('suspects'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'suspects' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>INTERROGATION</span>
            </button>
          </div>
        </div>

        {/* NOVA AI Scaling Hint Tier Selector */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-[11px] font-mono">
          <span className="text-slate-400 font-bold">NOVA HINT TIER:</span>
          <button
            onClick={() => {
              setNovaTier(1);
              updateNovaDeduction(1, selectedClue, scenario);
            }}
            className={`px-2 py-0.5 rounded ${novaTier === 1 ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
            title="Tier 1: Direct Observation"
          >
            DIRECT
          </button>
          <button
            onClick={() => {
              setNovaTier(2);
              updateNovaDeduction(2, selectedClue, scenario);
            }}
            className={`px-2 py-0.5 rounded ${novaTier === 2 ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
            title="Tier 2: Guided Association"
          >
            GUIDED
          </button>
          <button
            onClick={() => {
              setNovaTier(3);
              updateNovaDeduction(3, selectedClue, scenario);
            }}
            className={`px-2 py-0.5 rounded ${novaTier === 3 ? 'bg-violet-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            title="Tier 3: Socratic Provocation"
          >
            SOCRATIC
          </button>
        </div>
      </div>

      {/* Main Forensic Workspace */}
      <div className="relative z-20 flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden mt-3">
        
        {/* Left Interactive Zone: Case Wall OR CCTV OR Suspect Grid (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-2xl">
          {activeTab === 'case-wall' && (
            <div className="flex-1 overflow-hidden p-2">
              <DetectiveCaseWall
                clues={clues}
                suspects={suspects}
                pinnedClueIds={pinnedClueIds}
                selectedSuspectId={selectedSuspect?.id || null}
                onTogglePinClue={handleTogglePinClue}
                onSelectClue={handleInspectClue}
                onSelectSuspect={(s) => {
                  setSelectedSuspect(s);
                  handleOpenInterrogation(s);
                }}
              />
            </div>
          )}

          {activeTab === 'cctv' && (
            <div className="flex-1 p-4 flex flex-col justify-center">
              <ScenarioCCTVPlayer scenario={scenario} selectedClue={selectedClue} />
            </div>
          )}

          {activeTab === 'suspects' && (
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {suspects.map(s => {
                const testRecord = interrogatedSuspects[s.id];
                return (
                  <div key={s.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <img
                          src={getSuspectPhoto(s.name)}
                          alt={s.name}
                          className="w-12 h-12 rounded-lg object-cover border border-cyan-400/50 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white leading-tight">{s.name}</h4>
                          <p className="text-[11px] font-mono text-cyan-400">{s.role}</p>
                        </div>
                      </div>

                      <p className="text-xs font-sans text-slate-300 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        “{s.alibi}”
                      </p>

                      {/* Polygraph / Telemetry Verification Badge */}
                      <div className="mt-2.5">
                        {testRecord ? (
                          testRecord.isContradiction ? (
                            <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/80 text-red-300 font-mono text-[10px] font-bold flex items-center space-x-1.5 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>STRESS 92% • CONTRADICTION DETECTED!</span>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 font-mono text-[10px] font-bold flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>STRESS 24% • ALIBI CORROBORATED</span>
                            </div>
                          )
                        ) : (
                          <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 font-mono text-[10px] flex items-center space-x-1.5">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            <span>POLYGRAPH TEST PENDING</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleOpenInterrogation(s)}
                        className="w-full py-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 font-mono text-xs font-bold transition-all"
                      >
                        INTERROGATE
                      </button>
                      <button
                        onClick={() => handleAccusation(s)}
                        className={`w-full py-2.5 rounded-lg font-mono text-xs font-black shadow-lg transition-all ${
                          testRecord?.isContradiction
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white animate-pulse'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        FILE CHARGES (ACCUSE)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Tactical Console: NOVA AI Feed, Selected Clue Dossier & Accusation Button (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 overflow-hidden">
          
          {/* NOVA AI Guidance Pod */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
            <div className="flex items-center space-x-2 text-cyan-300 font-mono text-xs font-bold mb-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>NOVA NEURAL ADVISOR [TIER {novaTier}]</span>
            </div>
            <p className="text-xs font-mono text-slate-200 leading-relaxed">
              {aiDeduction}
            </p>
          </div>

          {/* Active Clue Inspector */}
          <div className="flex-1 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 overflow-y-auto flex flex-col justify-between">
            {selectedClue ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                  <span className="text-amber-400 font-bold">{selectedClue.category}</span>
                  <span className="text-slate-400">{selectedClue.timestamp}</span>
                </div>
                <h3 className="text-base font-bold text-white">{selectedClue.title}</h3>
                <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  {selectedClue.details}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => handleTogglePinClue(selectedClue.id)}
                    className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      pinnedClueIds.includes(selectedClue.id)
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5 fill-current" />
                    <span>{pinnedClueIds.includes(selectedClue.id) ? 'PINNED TO CASE-WALL' : 'PIN EVIDENCE'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 font-mono text-xs">
                Select an evidence card on the corkboard to inspect details.
              </div>
            )}

            {/* Level 5 Grand Accusation Trigger */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('suspects');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs font-mono uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Scale className="w-4 h-4" />
                <span>PROCEED TO FINAL ACCUSATION</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Suspect Interrogation Dialogue Modal */}
      <SuspectDialogueModal
        suspect={selectedSuspect}
        isOpen={isInterrogationOpen}
        onClose={() => setIsInterrogationOpen(false)}
        onPinTestimony={handlePinTestimony}
      />

      {/* Forensic Debrief Modal (Outcome of Accusation) */}
      {isDebriefing && debriefOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none font-display">
          <div className="relative max-w-lg w-full p-6 rounded-2xl bg-slate-950 border-2 border-cyan-400 shadow-2xl text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold mb-3 border bg-slate-900 text-cyan-300 border-cyan-500/40">
              {debriefOutcome.isCorrect ? '✓ CASE SOLVED' : '⚠ FORENSIC DEBRIEF'}
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              {debriefOutcome.isCorrect ? 'Perpetrator Apprehended' : 'Accusation Contradicted'}
            </h3>

            <p className="text-xs font-mono text-slate-300 mb-4 leading-relaxed">
              {debriefOutcome.isCorrect
                ? `Sensors confirmed the match. ${debriefOutcome.culpritName} was identified via direct physical and digital contradiction: ${debriefOutcome.explanation}`
                : `The physical timeline cleared your initial target. Official logs confirm the true intruder was ${debriefOutcome.culpritName}: ${debriefOutcome.explanation}`}
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 mb-5">
              Case file synchronized with Exhibition Souvenir Database.
            </div>

            <button
              onClick={() => setIsDebriefing(false)}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider"
            >
              FINALIZE CASE DOSSIER ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
