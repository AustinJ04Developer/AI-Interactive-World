import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Mic, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  ShieldAlert, 
  Sparkles,
  HelpCircle,
  Home
} from 'lucide-react';
import type { HardwareStatus, ViewState } from '../../types';
import { soundFX } from '../../services/audioService';

interface GlobalHUDProps {
  currentView: ViewState;
  hardware: HardwareStatus;
  sessionId: string;
  onNavigateHome: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onOpenDemo: () => void;
  onOpenHelp: () => void;
  expoSecondsLeft?: number;
  level?: number;
  totalLevels?: number;
  timeRemainingInLevel?: number;
  timeBudgetInLevel?: number;
  transitionInfo?: {
    completedLevel: number;
    nextLevel: number;
    label: string;
    scoreEarned: number;
    maxScore: number;
    completedBeforeTimeout: boolean;
    message: string;
  } | null;
  score?: number;
}

export const GlobalHUD: React.FC<GlobalHUDProps> = ({
  currentView,
  hardware,
  sessionId,
  onNavigateHome,
  onToggleSound,
  onToggleFullscreen,
  onOpenDemo,
  onOpenHelp,
  expoSecondsLeft,
  level,
  totalLevels = 5,
  timeRemainingInLevel,
  timeBudgetInLevel,
  transitionInfo,
  score
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isGameActive = ['detective', 'smart-city', 'ai-defense', 'last-signal'].includes(currentView);

  const getExperienceTitle = () => {
    switch (currentView) {
      case 'landing':
        return 'NEURAL CORE // SYSTEM STANDBY';
      case 'welcome':
        return 'BIOMETRIC & SENSOR CALIBRATION';
      case 'portal':
        return 'DIMENSIONAL PORTAL SELECTION';
      case 'detective':
        return 'SUPER DETECTIVE // CASE LAB';
      case 'smart-city':
        return 'CITY EXPLORER // SMART METROPOLIS';
      case 'ai-defense':
        return 'AI DEFENDER // QUANTUM CORE';
      case 'last-signal':
        return 'SPACE EXPLORER // THE LAST SIGNAL';
      case 'results':
        return 'MISSION ARCHIVE // EXPERIENCE SOUVENIR';
      default:
        return 'AI INTERACTIVE WORLD';
    }
  };

  const timerPct = (timeRemainingInLevel !== undefined && timeBudgetInLevel)
    ? Math.max(0, Math.min(100, (timeRemainingInLevel / timeBudgetInLevel) * 100))
    : 100;
  const isTimerCritical = timeRemainingInLevel !== undefined && timeRemainingInLevel <= 10;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 pointer-events-none p-2 sm:p-4 select-none font-display">
        {/* Top Header Row - Responsive Single Bar */}
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2">
          
          {/* Top-Left: Brand & Home Navigation */}
          <div className="flex items-center space-x-2 pointer-events-auto shrink-0">
            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateHome();
              }}
              className="group flex items-center space-x-2 sm:space-x-3 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-950/85 border border-cyan-500/40 hover:border-cyan-400 backdrop-blur-xl shadow-lg transition-all duration-200 active:scale-95"
              title="Return to Dimensional Portal"
            >
              <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-950/70 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute" />
                <Home className="w-4 h-4 text-cyan-300 relative z-10" />
              </div>
              <div className="text-left">
                <div className="text-[11px] sm:text-xs tracking-wider text-cyan-300 font-black glow-cyan">
                  AI WORLD
                </div>
                <div className="text-[8px] sm:text-[9px] tracking-wider text-slate-400 font-mono hidden xs:block">
                  EXPO 2026
                </div>
              </div>
            </button>
          </div>

          {/* Top-Center: Current Experience Title Badge OR Level & Timer HUD */}
          {isGameActive && level !== undefined ? (
            <div className="flex items-center space-x-3 px-4 py-1.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,242,254,0.15)] pointer-events-auto">
              {/* Level Pill Indicator */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  LEVEL {level}/{totalLevels}
                </span>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalLevels }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 sm:w-3 h-1.5 rounded-sm transition-all duration-300 ${
                        idx + 1 < level
                          ? 'bg-cyan-400 shadow-[0_0_6px_#00f2fe]'
                          : idx + 1 === level
                          ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]'
                          : 'bg-slate-700/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Per-Level Countdown Bar & Time */}
              {timeRemainingInLevel !== undefined && (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="w-20 sm:w-28 h-2 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isTimerCritical 
                          ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]' 
                          : timerPct > 40 
                          ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' 
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${timerPct}%` }}
                    />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-mono font-bold ${
                    isTimerCritical ? 'text-rose-400 animate-pulse' : 'text-slate-200'
                  }`}>
                    {timeRemainingInLevel}s
                  </span>
                </div>
              )}

              {/* Active Score readout */}
              {score !== undefined && (
                <div className="hidden sm:flex items-center pl-2 border-l border-slate-800 text-[10px] font-mono text-cyan-300">
                  <span className="text-slate-400 mr-1">XP:</span>
                  <span className="font-bold text-cyan-400">{score}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center px-4 py-1.5 rounded-full bg-slate-950/85 border border-slate-800 backdrop-blur-xl shadow-lg truncate max-w-md">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2 shrink-0 animate-pulse shadow-[0_0_8px_#00f2fe]" />
              <span className="text-[11px] tracking-widest text-slate-200 font-bold uppercase truncate font-mono">
                {getExperienceTitle()}
              </span>
            </div>
          )}

          {/* Top-Right: Hardware Telemetry + Consolidated Utility Controls */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 pointer-events-auto shrink-0">
            
            {/* Hardware Indicators (Compact) */}
            <div className="flex items-center space-x-1 bg-slate-950/85 border border-slate-800/90 rounded-xl p-1 backdrop-blur-xl">
              <div 
                className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-mono ${
                  hardware.camera === 'granted' ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-500'
                }`}
                title={`Camera: ${hardware.camera}`}
              >
                <Camera className="w-3.5 h-3.5" />
              </div>

              <div 
                className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-mono ${
                  hardware.microphone === 'granted' ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-500'
                }`}
                title={`Microphone: ${hardware.microphone}`}
              >
                <Mic className="w-3.5 h-3.5" />
              </div>

              <div 
                className="p-1.5 rounded-lg flex items-center space-x-1 text-cyan-400 bg-cyan-950/50 text-[10px] font-mono"
                title="AI Neural Synthesis Online"
              >
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
              </div>
            </div>

            {/* Expo Mode Timer (if active) */}
            {hardware.expoMode && expoSecondsLeft !== undefined && (
              <div 
                className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-amber-950/80 border border-amber-500/50 text-[10px] font-mono text-amber-300 backdrop-blur-md"
                title="Exhibition Inactivity Reset Countdown"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span className="font-bold">{expoSecondsLeft}s</span>
              </div>
            )}

            {/* Utility Buttons: Sound, Fullscreen, Demo, Help */}
            <div className="flex items-center space-x-1 bg-slate-950/85 border border-slate-800/90 rounded-xl p-1 backdrop-blur-xl">
              <button
                onClick={() => {
                  onToggleSound();
                  soundFX.playClick();
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  hardware.soundEnabled
                    ? 'text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title={hardware.soundEnabled ? 'Mute Audio [M]' : 'Enable Audio [M]'}
              >
                {hardware.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onToggleFullscreen();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-all hidden sm:flex"
                title="Toggle Fullscreen"
              >
                {hardware.fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenDemo();
                }}
                className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-violet-300 bg-violet-950/40 border border-violet-500/30 hover:border-violet-400 flex items-center space-x-1 transition-all"
                title="Presenter Demo Mode (Ctrl+Shift+D or ~)"
              >
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span className="hidden md:inline">DEMO</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenHelp();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-all"
                title="Exhibition Help & Guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Non-Game Watermark Bar */}
        {!isGameActive && (
          <div className="fixed inset-x-0 bottom-0 pointer-events-none p-3 sm:p-5 flex items-end justify-between">
            <div className="pointer-events-auto flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md text-[10px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">SESSION #{sessionId.slice(0, 8)}</span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline">{currentTime}</span>
            </div>
          </div>
        )}
      </header>

      {/* Non-Intrusive Floating Cyber Banner (Does not disturb gameplay, no screen blackout) */}
      {transitionInfo && (
        <div className="fixed top-16 inset-x-0 z-50 flex items-center justify-center p-2 pointer-events-none select-none font-display animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-5 py-2.5 rounded-2xl border flex items-center space-x-3 shadow-2xl backdrop-blur-xl ${
            transitionInfo.completedBeforeTimeout
              ? 'bg-slate-950/92 border-cyan-400/80 shadow-[0_0_25px_rgba(0,242,254,0.3)] text-white'
              : 'bg-slate-950/92 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.3)] text-white'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${transitionInfo.completedBeforeTimeout ? 'bg-cyan-400' : 'bg-amber-400'} animate-ping`} />
            <div className="flex items-center space-x-2.5 text-xs font-mono">
              <span className="font-black text-cyan-300">LEVEL {transitionInfo.completedLevel} SECURED ➔</span>
              <span className="font-bold text-slate-100 uppercase truncate max-w-[200px]">{transitionInfo.label.split(':')[1] || transitionInfo.label}</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                +{transitionInfo.scoreEarned} XP
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

