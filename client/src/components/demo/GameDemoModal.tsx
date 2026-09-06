import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  HelpCircle, 
  Zap, 
  Target, 
  Building2, 
  Search, 
  Radio, 
  ShieldAlert, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Flame, 
  Sliders, 
  Eye, 
  CheckCircle2, 
  Compass,
  Bomb,
  Snowflake,
  Sparkles
} from 'lucide-react';
import type { ExperienceId } from '../../types';
import { soundFX } from '../../services/audioService';

interface GameDemoModalProps {
  isOpen: boolean;
  experienceId: ExperienceId;
  onClose: () => void;
  onStartOriginalGame: () => void;
}

export const GameDemoModal: React.FC<GameDemoModalProps> = ({
  isOpen,
  experienceId,
  onClose,
  onStartOriginalGame
}) => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'practice'>('instructions');

  // Mini-sandbox practice states
  // Smart City Sandbox
  const [citySpeed, setCitySpeed] = useState<number>(0);
  const [cityNitro, setCityNitro] = useState<boolean>(false);
  const [cityHeading, setCityHeading] = useState<number>(0);
  const [cityTargetDist, setCityTargetDist] = useState<number>(48);

  // AI Defense Sandbox
  const [defensePracticeHits, setDefensePracticeHits] = useState<number>(0);
  const [practiceEmpUsed, setPracticeEmpUsed] = useState<boolean>(false);
  const [practiceFreezeUsed, setPracticeFreezeUsed] = useState<boolean>(false);

  // Space Explorer Sandbox
  const [practiceThrottle, setPracticeThrottle] = useState<number>(1.5);
  const [practiceRadarScan, setPracticeRadarScan] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartRealGame = () => {
    soundFX.playWarp();
    onStartOriginalGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 select-none font-display">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl hologram-panel border-2 border-cyan-400 shadow-[0_0_50px_rgba(0,242,254,0.35)] bg-slate-950/95 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-300">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                MISSION BRIEFING & TRAINING MODE
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                {experienceId === 'smart-city' && 'SMART CITY 2050 // CYBER SPEEDSTER TRAINING'}
                {experienceId === 'ai-defense' && 'AI DEFENDER // TARGET PRACTICE & ABILITY TRAINING'}
                {experienceId === 'detective' && 'SUPER DETECTIVE // FORENSIC CCTV TRAINING'}
                {experienceId === 'last-signal' && 'SPACE EXPLORER // FLIGHT DECK TRAINING'}
              </h3>
            </div>
          </div>

          {/* Tab Switcher: Instructions vs Practice Sandbox */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { soundFX.playClick(); setActiveTab('instructions'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'instructions' ? 'bg-cyan-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              HOW TO PLAY
            </button>
            <button
              onClick={() => { soundFX.playClick(); setActiveTab('practice'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'practice' ? 'bg-cyan-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎮 TRY PRACTICE DEMO
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: HOW TO PLAY INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-4 font-sans">
              
              {/* SMART CITY INSTRUCTIONS */}
              {experienceId === 'smart-city' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                    <div className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>MISSION OBJECTIVE: SEARCH THE METROPOLIS</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      You are operating a futuristic zero-emission cyber hovercar. Five secret anomalies are hidden across the city sectors (Fusion Grid, Smart Hospital, Agro-Dome, Municipal Safety, and Central Monument). Unlike old games, the target is <strong>NOT right in front of you</strong>—you must drive through the city streets and use your racing minimap radar to locate them!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-emerald-400 font-bold text-[11px]">1. STEER & DRIVE</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Press <strong>[W][A][S][D]</strong> or <strong>[Arrow Keys]</strong>. Use on-screen virtual directional buttons if on touchscreen or mouse!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-amber-400 font-bold text-[11px]">2. NITRO & DRIFT</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Hold <strong>[SHIFT]</strong> or tap the <strong>NITRO</strong> button to boost past 140 km/h! Tap <strong>[SPACE]</strong> for high-speed plasma drifting.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-cyan-400 font-bold text-[11px]">3. RADAR & BEACON</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Look at the side <strong>GPS RADAR</strong> on the bottom-left. Follow the compass heading and skyway light beam straight to the target!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI DEFENDER INSTRUCTIONS */}
              {experienceId === 'ai-defense' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-pink-950/40 border border-pink-500/40 space-y-2">
                    <div className="text-xs font-mono font-bold text-pink-400 flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>MISSION OBJECTIVE: PROTECT THE QUANTUM REACTOR</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Mutating algorithmic bugs and quantum probes are swarming the reactor core. Click or tap to fire interceptor beams. The AI neural engine dynamically monitors your reaction latency and accuracy, escalating difficulty in real time!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-pink-400 font-bold text-[11px]">1. POINT & SHOOT</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Click or tap any threat to fire laser beams. Consecutive hits build <strong>COMBO x2, x3, x5</strong> multipliers!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-cyan-400 font-bold text-[11px]">2. EMP BOMB [SPACE]</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        When swarmed, press <strong>[SPACE]</strong> or tap EMP to wipe every threat on screen with an electric shockwave!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-emerald-400 font-bold text-[11px]">3. FREEZE & REPAIR</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Press <strong>[F]</strong> for Chrono-Freeze (4s slow-mo) or <strong>[R]</strong> to repair +35 core health when low!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUPER DETECTIVE INSTRUCTIONS */}
              {experienceId === 'detective' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                    <div className="text-xs font-mono font-bold text-cyan-400 flex items-center space-x-2">
                      <Search className="w-4 h-4" />
                      <span>MISSION OBJECTIVE: CRACK THE QUANTUM CRIME</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      A vital scientific breakthrough was stolen from the laboratory. Examine the live scenario CCTV surveillance video, cross-examine clue timestamps against suspect alibis, and identify who is lying to issue the arrest warrant!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-cyan-400 font-bold text-[11px]">1. SCENARIO CCTV FEED</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Watch the animated surveillance camera footage. Use the scrubber timeline to catch the suspect entering the crime scene!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-emerald-400 font-bold text-[11px]">2. SPOT CONTRADICTIONS</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Compare the suspect's stated alibi against the timestamp recorded on the security sensors. One suspect's alibi is impossible!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-amber-400 font-bold text-[11px]">3. ARREST & WIN</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Click <strong>ACCUSE</strong> next to the guilty culprit. Solving the case awards <strong>+500 XP</strong> and an official detective badge!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SPACE EXPLORER INSTRUCTIONS */}
              {experienceId === 'last-signal' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                    <div className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-2">
                      <Radio className="w-4 h-4" />
                      <span>MISSION OBJECTIVE: FIRST CONTACT PROTOCOL</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Deep space station Aethelgard has intercepted an artificial intelligence signal from 4.2 light years away. As Commander, you will make high-stakes moral decisions that determine the future of interstellar humanity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-amber-400 font-bold text-[11px]">1. WARP THROTTLE</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Use the interactive Warp Throttle slider on the flight bridge to control relativistic starfield speed from 0.5c to 4.0c!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-cyan-400 font-bold text-[11px]">2. VOICE OR CLICK</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Speak spoken commands into your microphone or click the choice cards to steer the cinematic storyline!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-emerald-400 font-bold text-[11px]">3. CINEMATIC POSTER</div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Every branching path culminates in a custom movie poster souvenir chronicling your galactic leadership.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: INTERACTIVE PRACTICE DEMO SANDBOX */}
          {activeTab === 'practice' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-4">
              
              {/* SMART CITY DEMO SANDBOX */}
              {experienceId === 'smart-city' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 border-b border-emerald-500/20 pb-2">
                    <span className="font-bold flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4" />
                      <span>PRACTICE DRIVING SIMULATOR // TEST VEHICLE CONTROLS</span>
                    </span>
                    <span className="text-slate-400">STATUS: TRAINING ACTIVE</span>
                  </div>

                  {/* Practice Speedometer & Heading Display */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-around">
                    <div className="text-center">
                      <div className="text-[10px] font-mono text-slate-400">CURRENT SPEED</div>
                      <div className={`text-3xl font-display font-black ${cityNitro ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                        {citySpeed} <span className="text-xs font-mono">KM/H</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] font-mono text-slate-400">MINIMAP TARGET</div>
                      <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                        {cityTargetDist}m [NE ↗]
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] font-mono text-slate-400">NITRO STATUS</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                        {cityNitro ? '🔥 BOOSTING (145 KM/H)' : 'READY (PRESS NITRO)'}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Test Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCitySpeed(prev => Math.min(100, prev + 25));
                        setCityTargetDist(prev => Math.max(5, prev - 8));
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-300 font-mono text-xs font-bold hover:bg-emerald-900"
                    >
                      ▲ DRIVE FORWARD
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setCitySpeed(prev => Math.max(0, prev - 25));
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs font-bold"
                    >
                      ▼ BRAKE / REVERSE
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playNitro();
                        setCityNitro(true);
                        setCitySpeed(145);
                        setTimeout(() => setCityNitro(false), 2000);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-mono text-xs font-black shadow-[0_0_15px_#ffaa00]"
                    >
                      🔥 TEST NITRO BOOST
                    </button>
                  </div>
                </div>
              )}

              {/* AI DEFENDER DEMO SANDBOX */}
              {experienceId === 'ai-defense' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-pink-400 border-b border-pink-500/20 pb-2">
                    <span className="font-bold flex items-center space-x-1.5">
                      <Target className="w-4 h-4" />
                      <span>TARGET PRACTICE RANGE // TEST FIRING & ABILITIES</span>
                    </span>
                    <span className="text-slate-400">PRACTICE HITS: {defensePracticeHits}</span>
                  </div>

                  {/* Practice Target Range */}
                  <div className="h-40 rounded-xl bg-slate-950 border border-slate-800 relative flex items-center justify-around overflow-hidden">
                    <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
                    
                    {/* 3 Clickable Practice Threat Dummies */}
                    {[1, 2, 3].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          soundFX.playLaser();
                          soundFX.playHit();
                          setDefensePracticeHits(prev => prev + 1);
                        }}
                        className="w-14 h-14 rounded-2xl bg-pink-950/80 border-2 border-pink-400 hover:scale-110 active:scale-95 text-pink-300 flex flex-col items-center justify-center font-mono font-bold text-xs transition-transform shadow-[0_0_15px_#ff007f]"
                      >
                        <ShieldAlert className="w-5 h-5 mb-1" />
                        <span>BUG #{t}</span>
                      </button>
                    ))}
                  </div>

                  {/* Test Abilities Bar */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        soundFX.playEMP();
                        setPracticeEmpUsed(true);
                        setTimeout(() => setPracticeEmpUsed(false), 2000);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-200 font-mono text-xs font-bold hover:bg-cyan-900"
                    >
                      <Bomb className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                      <span>TEST EMP SHOCKWAVE [SPACE]</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFX.playScan();
                        setPracticeFreezeUsed(true);
                        setTimeout(() => setPracticeFreezeUsed(false), 2000);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-200 font-mono text-xs font-bold hover:bg-emerald-900"
                    >
                      <Snowflake className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                      <span>TEST CHRONO FREEZE [F]</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUPER DETECTIVE DEMO SANDBOX */}
              {experienceId === 'detective' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400 border-b border-cyan-500/20 pb-2">
                    <span className="font-bold flex items-center space-x-1.5">
                      <Search className="w-4 h-4" />
                      <span>FORENSIC TIMELINE TEST // CULPRIT VERIFICATION</span>
                    </span>
                    <span className="text-emerald-400">READY TO CROSS-EXAMINE</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="text-cyan-300 font-bold">PRACTICE CLUE LOG:</div>
                    <div className="text-slate-300 font-sans">
                      "Security Camera 04 recorded suspect keycard #9942 at <strong>22:14:02</strong> inside the vault."
                    </div>
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-[11px]">
                      ⚠ SUSPECT ALIBI: "I was having dinner 10 miles away at 22:15!"
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      ✓ CONTRADICTION FOUND: Suspect could not be in two places at once!
                    </div>
                  </div>
                </div>
              )}

              {/* SPACE EXPLORER DEMO SANDBOX */}
              {experienceId === 'last-signal' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400 border-b border-amber-500/20 pb-2">
                    <span className="font-bold flex items-center space-x-1.5">
                      <Radio className="w-4 h-4" />
                      <span>FLIGHT DECK TESTING // WARP SPEED CONTROL</span>
                    </span>
                    <span className="text-slate-400">STARFIELD MULTIPLIER: {practiceThrottle.toFixed(1)}c</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-around">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-slate-400">TEST WARP THROTTLE</div>
                      <input
                        type="range"
                        min="0.5"
                        max="4.0"
                        step="0.1"
                        value={practiceThrottle}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setPracticeThrottle(val);
                          soundFX.playClick(300 + val * 150);
                        }}
                        className="w-48 accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <button
                      onClick={() => {
                        soundFX.playScan();
                        setPracticeRadarScan(true);
                        setTimeout(() => setPracticeRadarScan(false), 2000);
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-950 border border-amber-400 text-amber-300 font-mono text-xs font-bold"
                    >
                      <Compass className={`w-3.5 h-3.5 inline mr-1 ${practiceRadarScan ? 'animate-spin' : ''}`} />
                      <span>{practiceRadarScan ? 'SCANNING HARMONICS...' : 'TEST DEEP RADAR'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-cyan-500/30 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold"
          >
            ✕ CANCEL
          </button>

          <div className="flex items-center space-x-3">
            {activeTab === 'instructions' && (
              <button
                onClick={() => { soundFX.playClick(); setActiveTab('practice'); }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-400 text-cyan-300 hover:bg-cyan-950 font-mono text-xs font-bold flex items-center space-x-1.5"
              >
                <span>TRY DEMO CONTROLS FIRST</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleStartRealGame}
              className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_25px_rgba(0,242,254,0.45)] active:scale-95 transition-all"
            >
              <span>LAUNCH ORIGINAL GAME</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
