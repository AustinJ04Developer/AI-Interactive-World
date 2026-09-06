import React, { useState, useEffect } from 'react';
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
  Play, 
  Pause, 
  Volume2, 
  AlertTriangle,
  Fingerprint,
  Layers,
  ChevronRight
} from 'lucide-react';
import type { SouvenirData } from '../types';
import { apiService, type AssignedScenarioResponse } from '../services/apiService';
import { NovaGuide } from '../components/nova/NovaGuide';
import { ScenarioCCTVPlayer } from '../components/detective/ScenarioCCTVPlayer';
import { soundFX } from '../services/audioService';

interface DetectiveViewProps {
  sessionId: string;
  visitorPhotoUrl: string | null;
  visitorName?: string;
  onComplete: (souvenir: SouvenirData) => void;
  onExit: () => void;
}

const getSuspectPhoto = (name: string): string => {
  if (name.includes('Thorne') || name.includes('Silas')) return '/media/suspect_thorne.jpg';
  if (name.includes('Elena') || name.includes('Rostova')) return '/media/suspect_elena.jpg';
  if (name.includes('Finnick') || name.includes('Troy')) return '/media/suspect_finnick.jpg';
  return '/media/suspect_maya.jpg';
};

export const DetectiveView: React.FC<DetectiveViewProps> = ({
  sessionId,
  visitorPhotoUrl,
  visitorName = 'Cadet Alex',
  onComplete,
  onExit
}) => {
  const [scenario, setScenario] = useState<AssignedScenarioResponse | null>(null);
  const [loadingScenario, setLoadingScenario] = useState<boolean>(true);
  
  // Responsive workspace tabs for mobile/tablet (< 1024px)
  const [mobileActiveTab, setMobileActiveTab] = useState<'evidence' | 'inspection' | 'accuse'>('evidence');
  
  // Left column drawer tab (clues vs suspects)
  const [drawerTab, setDrawerTab] = useState<'clues' | 'suspects'>('clues');
  
  const [selectedClue, setSelectedClue] = useState<any>(null);
  const [selectedSuspect, setSelectedSuspect] = useState<any>(null);
  const [aiDeduction, setAiDeduction] = useState<string>('Select any clue or suspect to cross-examine forensic telemetry.');
  const [solved, setSolved] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Fetch scenario on mount
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

  const handleInspectClue = async (clue: any) => {
    soundFX.playClick();
    setSelectedClue(clue);
    soundFX.playAIProcess();
    setAiDeduction('NOVA neural coprocessor is cross-referencing timeline timestamps...');

    const res = await apiService.talkToAI({
      action: 'detective',
      clueTitle: clue.title,
      suspectName: selectedSuspect?.name || 'Target Suspect',
      scenarioTitle: scenario?.title || 'Investigation'
    });

    if (res?.text) {
      setAiDeduction(res.text);
    } else {
      setAiDeduction(`Forensic Analysis: "${clue.details}" Correlate timestamp with witness logs to identify who had physical access.`);
    }
  };

  const handleSelectSuspect = (suspect: any) => {
    soundFX.playClick();
    setSelectedSuspect(suspect);
    soundFX.playAIProcess();
    setAiDeduction(`Cross-examining ${suspect.name}. Stated Alibi: "${suspect.alibi}". Check the clue timestamps to verify whether this alibi holds up!`);
  };

  const handleAccusation = async (suspect: any) => {
    soundFX.playWarp();
    const isCorrect = suspect.id === scenario?.content?.culpritId || suspect.name === scenario?.content?.culpritName;
    setSolved(true);

    const score = isCorrect ? 950 : 420;
    const xp = isCorrect ? 500 : 150;
    const achievements = isCorrect 
      ? ['Super Detective', 'Case Master', 'Forensic Genius', 'Contradiction Hunter'] 
      : ['Junior Detective', 'Investigative Effort'];

    const realCulprit = scenario?.content?.culpritName || 'the real intruder';
    const solutionReason = scenario?.content?.solutionReason || 'Forensic timeline logs contradict their presence.';

    const aiSummary = isCorrect
      ? `CASE SOLVED! Outstanding deduction! You correctly identified ${suspect.name} as the culprit. Key Evidence: ${solutionReason}`
      : `FALSE ARREST DEBRIEF: You accused ${suspect.name}, but they are INNOCENT! Stated Alibi: "${suspect.alibi}". Security checkpoint records verified their presence elsewhere. The TRUE culprit was ${realCulprit} — ${solutionReason}`;

    const metrics = [
      { label: 'MYSTERY CASE', value: scenario?.title || 'The Mystery Lab' },
      { label: 'FINAL VERDICT', value: isCorrect ? 'SOLVED: CULPRIT JAILED' : 'FALSE ACCUSATION' },
      { label: isCorrect ? 'CONVICTED CULPRIT' : 'ACCUSED (INNOCENT)', value: suspect.name },
      { label: isCorrect ? 'XP REWARD' : 'TRUE CULPRIT WAS', value: isCorrect ? `+${xp} XP` : realCulprit }
    ];

    const souvenirData: SouvenirData = {
      experienceId: 'detective',
      experienceTitle: isCorrect ? `CASE SOLVED: ${scenario?.title || 'SUPER DETECTIVE'}` : `INQUEST REPORT: ${scenario?.title || 'SUPER DETECTIVE'}`,
      experienceSubtitle: isCorrect ? 'VERDICT: CULPRIT CONVICTED WITH PROOF' : `VERDICT: INNOCENT ARRESTED — TRUE CULPRIT: ${realCulprit.toUpperCase()}`,
      visitorName,
      visitorPhotoUrl: visitorPhotoUrl || '',
      score,
      achievements,
      metrics,
      aiAnalysis: aiSummary,
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sessionId,
      badge: isCorrect ? 'SUPER DETECTIVE ELITE' : 'FORENSIC INVESTIGATOR',
      themeColor: isCorrect ? '#00f2fe' : '#ff007f'
    };

    setTimeout(() => {
      onComplete(souvenirData);
    }, 1000);
  };

  if (loadingScenario) {
    return (
      <div className="w-screen h-screen bg-[#020408] text-white flex flex-col items-center justify-center space-y-4 font-display">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <div className="text-cyan-400 font-bold tracking-wider text-sm">
          INITIALIZING FORENSIC CASE FILE...
        </div>
      </div>
    );
  }

  const clues = scenario?.content?.clues || [];
  const suspects = scenario?.content?.suspects || [];

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col pt-20 pb-4 px-3 sm:px-6 space-bg select-none">
      <div className="scanlines absolute inset-0 z-10 pointer-events-none" />

      {/* TOP SCENARIO STATUS HEADER */}
      <div className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between max-w-7xl mx-auto w-full gap-2 mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono">
              <span className="text-cyan-400 font-bold">CASE ID: {scenario?.scenarioId || 'DET-001'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold uppercase">{scenario?.difficulty || 'EASY'}</span>
            </div>
            <h2 className="text-base sm:text-xl font-display font-black text-white tracking-wide truncate max-w-lg">
              {scenario?.title || 'The Vanishing Quantum Prototype'}
            </h2>
          </div>
        </div>

        {/* Mascot Prompt Bar */}
        <NovaGuide
          message="Examine clues & alibis to find the contradiction!"
          subMessage="Compare timestamps to uncover who is lying."
          mood="thinking"
          actionText="QUICK GUIDE"
          onAction={() => setShowHelp(prev => !prev)}
        />
      </div>

      {/* INSTRUCTIONS POPUP OVERLAY */}
      {showHelp && (
        <div className="relative z-30 max-w-7xl mx-auto w-full p-3 rounded-xl bg-slate-950/95 border-2 border-cyan-400 text-xs font-mono text-cyan-200 flex items-center justify-between shadow-2xl mb-2 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center gap-4">
            <span>1. Click Clues to examine CCTV, Audio & 3D telemetry 🔎</span>
            <span>2. Toggle UV LENS to expose hidden digital checksums 🟣</span>
            <span>3. Cross-reference suspect alibis and hit ACCUSE! 🏆</span>
          </div>
          <button onClick={() => setShowHelp(false)} className="text-white font-bold underline ml-2">
            CLOSE
          </button>
        </div>
      )}

      {/* MOBILE RESPONSIVE TAB BAR (VISIBLE ON SCREENS < 1024px) */}
      <div className="lg:hidden relative z-20 flex space-x-1.5 mb-2 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setMobileActiveTab('evidence')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            mobileActiveTab === 'evidence' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400'
          }`}
        >
          1. EVIDENCE ({clues.length})
        </button>
        <button
          onClick={() => setMobileActiveTab('inspection')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            mobileActiveTab === 'inspection' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400'
          }`}
        >
          2. CRIME DESK
        </button>
        <button
          onClick={() => setMobileActiveTab('accuse')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            mobileActiveTab === 'accuse' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400'
          }`}
        >
          3. ACCUSE ({suspects.length})
        </button>
      </div>

      {/* MAIN 3-ZONE INVESTIGATION WORKSPACE */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-7xl mx-auto w-full flex-1 overflow-hidden">
        
        {/* ================= ZONE 1: EVIDENCE & SUSPECT DOSSIER DRAWER (4 COLS) ================= */}
        <div className={`lg:col-span-4 flex flex-col rounded-2xl hologram-panel border border-cyan-500/30 p-3 bg-slate-950/80 backdrop-blur-xl space-y-2.5 overflow-hidden ${
          mobileActiveTab === 'evidence' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Switcher Buttons */}
          <div className="flex space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => { setDrawerTab('clues'); soundFX.playClick(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                drawerTab === 'clues' ? 'bg-cyan-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              EVIDENCE CLUES ({clues.length})
            </button>
            <button
              onClick={() => { setDrawerTab('suspects'); soundFX.playClick(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                drawerTab === 'suspects' ? 'bg-cyan-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SUSPECT ALIBIS ({suspects.length})
            </button>
          </div>

          {/* Clues List */}
          {drawerTab === 'clues' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {clues.map((clue: any) => {
                const isSelected = selectedClue?.id === clue.id;
                return (
                  <div
                    key={clue.id}
                    onClick={() => handleInspectClue(clue)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-300 font-bold flex items-center space-x-1.5">
                        {clue.category === 'CCTV' && <Video className="w-3.5 h-3.5 text-cyan-400" />}
                        {clue.category === 'AUDIO' && <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                        {clue.category === 'DOCUMENT' && <FileText className="w-3.5 h-3.5 text-amber-400" />}
                        {clue.category === 'BIOMETRIC' && <Fingerprint className="w-3.5 h-3.5 text-purple-400" />}
                        <span className="truncate max-w-[170px]">{clue.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {clue.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans line-clamp-2">
                      {clue.details}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Suspects List */}
          {drawerTab === 'suspects' && (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {suspects.map((suspect: any) => {
                const isSelected = selectedSuspect?.id === suspect.id;
                const photoSrc = getSuspectPhoto(suspect.name);
                return (
                  <div
                    key={suspect.id}
                    onClick={() => handleSelectSuspect(suspect)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/60 shrink-0 bg-slate-950 shadow-sm">
                        <img src={photoSrc} alt={suspect.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono font-bold text-white flex items-center justify-between">
                          <span className="truncate">{suspect.name}</span>
                          {isSelected && (
                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40">
                              ACTIVE INQUIRY
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-cyan-300 font-mono truncate">
                          {suspect.role}
                        </div>
                      </div>
                    </div>

                    {/* Full Stated Alibi without line-clamp */}
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-amber-200/90 font-sans leading-relaxed">
                      <span className="text-[10px] font-mono font-bold text-amber-400 block mb-0.5 uppercase tracking-wider">
                        STATED ALIBI:
                      </span>
                      "{suspect.alibi}"
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= ZONE 2: SCENARIO-GENERATED CCTV VIDEO SURVEILLANCE ================= */}
        <div className={`lg:col-span-5 flex flex-col rounded-2xl hologram-panel border border-cyan-400/40 p-3 bg-slate-950/85 backdrop-blur-xl space-y-2.5 overflow-hidden ${
          mobileActiveTab === 'inspection' ? 'flex' : 'hidden lg:flex'
        }`}>
          
          {/* Header Bar - Clear Scenario CCTV Tag */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>CRIME SCENE SURVEILLANCE FEED</span>
            </span>

            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
              HD REPLAY ACTIVE
            </span>
          </div>

          {/* Scenario Generated CCTV Surveillance Video */}
          <div className="relative flex-1 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 flex flex-col">
            <ScenarioCCTVPlayer scenario={scenario} selectedClue={selectedClue} />
          </div>

          {/* NOVA AI Deduction Speech Bubble */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/90 to-slate-950 border border-cyan-500/40 space-y-1">
            <div className="text-[10px] font-mono text-cyan-400 font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>NOVA FORENSIC DEDUCTION:</span>
            </div>
            <p className="text-xs font-sans text-white leading-relaxed">
              "{aiDeduction}"
            </p>
          </div>
        </div>

        {/* ================= ZONE 3: WHO IS THE CULPRIT? ACCUSATION MATRIX (3 COLS) ================= */}
        <div className={`lg:col-span-3 flex flex-col rounded-2xl hologram-panel border border-cyan-400/40 p-3 bg-slate-950/85 backdrop-blur-xl space-y-3 overflow-hidden ${
          mobileActiveTab === 'accuse' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-1.5 border-b border-slate-800">
            WHO IS THE CULPRIT?
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Review the alibis against the timeline clues. When ready, issue the official arrest warrant:
          </p>

          {/* Suspect Accusation Cards */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {suspects.map((s: any) => (
              <div
                key={s.id}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-400 transition-all space-y-2 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs font-mono">{s.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">{s.role}</div>
                  </div>
                  <button
                    onClick={() => handleAccusation(s)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-[10px] tracking-wider transition-colors"
                  >
                    ARREST
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 font-sans italic line-clamp-2">
                  Alibi: "{s.alibi}"
                </div>
              </div>
            ))}
          </div>

          {/* Award Status Badge */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-center text-slate-400">
            CORRECT ARREST AWARDS <span className="text-cyan-300 font-bold">+500 XP</span> & OFFICIAL DOSSIER
          </div>
        </div>

      </div>
    </div>
  );
};
