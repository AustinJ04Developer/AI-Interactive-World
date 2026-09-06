import React from 'react';
import { HelpCircle, ShieldCheck, Keyboard, Eye, Volume2 } from 'lucide-react';
import { soundFX } from '../services/audioService';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none font-display">
      <div className="w-full max-w-xl p-6 rounded-2xl hologram-panel border border-cyan-400/40 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center space-x-2 text-cyan-300">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold tracking-wider uppercase text-white">
              EXHIBITION OPERATOR & VISITOR GUIDE
            </h3>
          </div>
          <button 
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-slate-900 border border-slate-800"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* Shortcuts */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>KEYBOARD SHORTCUTS</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-400">FULLSCREEN MODE</span>
              <span className="text-cyan-400 font-bold">F11 / BUTTON</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-400">MUTE / UNMUTE</span>
              <span className="text-cyan-400 font-bold">M / BUTTON</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-400">DEMO PANEL</span>
              <span className="text-violet-400 font-bold">CTRL+SHIFT+D / ~</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-400">CITY NAVIGATION</span>
              <span className="text-emerald-400 font-bold">W A S D + MOUSE</span>
            </div>
          </div>
        </div>

        {/* Privacy Declaration */}
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>ETHICAL AI & VISITOR PRIVACY COMMITMENT</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            1. <strong>Strictly Local Processing:</strong> Live webcam feed is rendered strictly inside client memory. No video or biometric streams are sent to remote servers.<br />
            2. <strong>Zero Facial Recognition:</strong> The system does not analyze identity, age, gender, or sensitive biometric features.<br />
            3. <strong>Automatic Memory Purge:</strong> Sessions and temporary snapshots are automatically cleared upon completion or when Expo Mode turnover resets.
          </p>
        </div>

        <button
          onClick={() => { soundFX.playClick(); onClose(); }}
          className="w-full cyber-btn text-xs py-2.5"
        >
          RETURN TO EXHIBITION
        </button>

      </div>
    </div>
  );
};
