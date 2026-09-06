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
  expoSecondsLeft
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

  return (
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
                EXPO v3.5
              </div>
            </div>
          </button>
        </div>

        {/* Top-Center: Current Experience Title Badge */}
        <div className="hidden md:flex items-center px-4 py-1.5 rounded-full bg-slate-950/85 border border-slate-800 backdrop-blur-xl shadow-lg truncate max-w-md">
          <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2 shrink-0 animate-pulse shadow-[0_0_8px_#00f2fe]" />
          <span className="text-[11px] tracking-widest text-slate-200 font-bold uppercase truncate font-mono">
            {getExperienceTitle()}
          </span>
        </div>

        {/* Top-Right: Hardware Telemetry + Consolidated Utility Controls */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 pointer-events-auto shrink-0">
          
          {/* Hardware Indicators (Compact) */}
          <div className="flex items-center space-x-1 bg-slate-950/85 border border-slate-800/90 rounded-xl p-1 backdrop-blur-xl">
            {/* Webcam */}
            <div 
              className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-mono ${
                hardware.camera === 'granted' ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-500'
              }`}
              title={`Camera: ${hardware.camera}`}
            >
              <Camera className="w-3.5 h-3.5" />
            </div>

            {/* Mic */}
            <div 
              className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-mono ${
                hardware.microphone === 'granted' ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-500'
              }`}
              title={`Microphone: ${hardware.microphone}`}
            >
              <Mic className="w-3.5 h-3.5" />
            </div>

            {/* AI Core */}
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
              title="Exhibition Turnover Countdown"
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span className="font-bold">{expoSecondsLeft}s</span>
            </div>
          )}

          {/* Utility Buttons: Sound, Fullscreen, Demo, Help (Consolidated in top bar so bottom has ZERO overlaps!) */}
          <div className="flex items-center space-x-1 bg-slate-950/85 border border-slate-800/90 rounded-xl p-1 backdrop-blur-xl">
            {/* Sound Toggle */}
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

            {/* Fullscreen Toggle */}
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

            {/* Demo Mode Button */}
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

            {/* Help Button */}
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

      {/* Non-Game Watermark Bar (ONLY visible on Landing, Portal, Results - NEVER in active games to avoid overlaps!) */}
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
  );
};
