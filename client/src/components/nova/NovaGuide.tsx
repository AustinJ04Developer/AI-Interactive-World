import React from 'react';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';
import { soundFX } from '../../services/audioService';

interface NovaGuideProps {
  message: string;
  subMessage?: string;
  mood?: 'happy' | 'thinking' | 'excited' | 'hero';
  onAction?: () => void;
  actionText?: string;
}

export const NovaGuide: React.FC<NovaGuideProps> = ({
  message,
  subMessage,
  mood = 'happy',
  onAction,
  actionText
}) => {
  return (
    <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-violet-950/80 border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.3)] backdrop-blur-xl animate-pulse-glow max-w-xl">
      {/* Animated 3D NOVA Mascot Robot Body */}
      <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-500 p-0.5 shadow-[0_0_20px_#00f2fe] animate-bounce-slow">
        <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center relative overflow-hidden">
          <img 
            src="/media/nova_mascot.jpg" 
            alt="NOVA AI Mascot" 
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
          />
          {/* Hologram scan line */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400 animate-scan-sweep pointer-events-none" />
          <div className="absolute inset-0 bg-cyan-400/10 mix-blend-overlay pointer-events-none" />
        </div>

        {/* Pulsing AI status ring */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border border-slate-950 flex items-center justify-center text-[8px] font-black text-black shadow-[0_0_8px_#00ff88]">
          ✓
        </span>
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-cyan-300 font-bold tracking-wider">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>NOVA // YOUR AI GUIDE</span>
        </div>
        <p className="text-xs sm:text-sm font-display font-bold text-white tracking-wide mt-0.5">
          {message}
        </p>
        {subMessage && (
          <p className="text-[11px] font-sans text-slate-300 mt-0.5">
            {subMessage}
          </p>
        )}
      </div>

      {/* Optional One-Tap Action */}
      {actionText && onAction && (
        <button
          onClick={() => {
            soundFX.playClick();
            onAction();
          }}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs tracking-wider shadow-[0_0_15px_rgba(0,242,254,0.5)] transition-transform hover:scale-105"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
