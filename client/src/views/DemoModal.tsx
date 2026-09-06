import React, { useState } from 'react';
import { 
  Sparkles, 
  Key, 
  Zap, 
  RotateCcw, 
  Eye, 
  Bot, 
  Camera, 
  ShieldCheck, 
  PlaySquare, 
  CheckCircle2, 
  Building2, 
  Search, 
  ShieldAlert, 
  Radio
} from 'lucide-react';
import type { ExperienceId, ViewState } from '../types';
import { aiService } from '../services/aiService';
import { soundFX } from '../services/audioService';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToView: (view: ViewState) => void;
  onJumpToExperience: (id: ExperienceId) => void;
  expoMode: boolean;
  onToggleExpoMode: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  onJumpToView,
  onJumpToExperience,
  expoMode,
  onToggleExpoMode
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(aiService.getApiKey());
  const [apiSaved, setApiSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    aiService.setApiKey(apiKeyInput);
    setApiSaved(true);
    soundFX.playSuccess();
    setTimeout(() => setApiSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 select-none font-display">
      <div className="w-full max-w-2xl p-6 rounded-2xl hologram-panel border-2 border-violet-500 shadow-[0_0_50px_rgba(121,40,202,0.4)] space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-violet-500/30">
          <div className="flex items-center space-x-2 text-violet-300">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-bold tracking-wider uppercase text-white">
              PRESENTER & FACULTY DEMO CONTROL PANEL
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-slate-900 border border-slate-800"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* Rapid Experience Jump Bar */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            INSTANT EXPERIENCE JUMP (JUDGES SPEED-TEST)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => { soundFX.playWarp(); onJumpToExperience('detective'); onClose(); }}
              className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/60 text-left transition-all"
            >
              <Search className="w-4 h-4 text-cyan-400 mb-1" />
              <div className="text-xs font-bold text-white">01. DETECTIVE</div>
              <div className="text-[10px] text-slate-400 font-mono">Evidence & CCTV</div>
            </button>

            <button
              onClick={() => { soundFX.playWarp(); onJumpToExperience('smart-city'); onClose(); }}
              className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/60 text-left transition-all"
            >
              <Building2 className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="text-xs font-bold text-white">02. SMART CITY</div>
              <div className="text-[10px] text-slate-400 font-mono">3D World & NPCs</div>
            </button>

            <button
              onClick={() => { soundFX.playWarp(); onJumpToExperience('ai-defense'); onClose(); }}
              className="p-3 rounded-lg bg-pink-950/40 border border-pink-500/40 hover:bg-pink-900/60 text-left transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-pink-400 mb-1" />
              <div className="text-xs font-bold text-white">03. AI DEFENSE</div>
              <div className="text-[10px] text-slate-400 font-mono">Adaptive Swarm</div>
            </button>

            <button
              onClick={() => { soundFX.playWarp(); onJumpToExperience('last-signal'); onClose(); }}
              className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/60 text-left transition-all"
            >
              <Radio className="w-4 h-4 text-amber-400 mb-1" />
              <div className="text-xs font-bold text-white">04. LAST SIGNAL</div>
              <div className="text-[10px] text-slate-400 font-mono">Interactive Movie</div>
            </button>
          </div>
        </div>

        {/* Global View States Jump */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            GLOBAL VIEW NAVIGATION
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            <button
              onClick={() => { soundFX.playClick(); onJumpToView('landing'); onClose(); }}
              className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-violet-400 text-slate-200"
            >
              LANDING SCREEN
            </button>
            <button
              onClick={() => { soundFX.playClick(); onJumpToView('welcome'); onClose(); }}
              className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-violet-400 text-slate-200"
            >
              WELCOME & CAMERA SENSORS
            </button>
            <button
              onClick={() => { soundFX.playClick(); onJumpToView('portal'); onClose(); }}
              className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-violet-400 text-slate-200"
            >
              DIMENSIONAL PORTALS
            </button>
          </div>
        </div>

        {/* Expo Mode & Auto Turnover Toggle */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white flex items-center space-x-2">
              <span>EXPO AUTOMATIC VISITOR TURNOVER MODE</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${expoMode ? 'bg-emerald-950 text-emerald-400 border border-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                {expoMode ? 'ACTIVE (45s INACTIVITY RESET)' : 'DISABLED'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-0.5">
              Automatically purges visitor session memory and resets terminal after 45 seconds of idle inactivity for seamless crowd turnover.
            </div>
          </div>
          <button
            onClick={() => { soundFX.playClick(); onToggleExpoMode(); }}
            className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all ${
              expoMode 
                ? 'bg-amber-500 text-black shadow-[0_0_15px_#ffaa00]' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {expoMode ? 'DISABLE EXPO MODE' : 'ENABLE EXPO MODE'}
          </button>
        </div>

        {/* Optional Gemini API Key Configurator */}
        <form onSubmit={handleSaveApiKey} className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center space-x-1.5 text-violet-300">
              <Key className="w-3.5 h-3.5" />
              <span>LIVE GEMINI API KEY (OPTIONAL)</span>
            </span>
            <span className="text-[10px] text-emerald-400">
              {aiService.hasApiKey() ? 'LIVE GEMINI 2.5 ACTIVE' : 'HIGH-FIDELITY NEURAL SIMULATOR FALLBACK ACTIVE'}
            </span>
          </div>
          <div className="flex space-x-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy... (leave blank for local neural engine)"
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-violet-400 rounded px-3 py-2 text-xs font-mono text-white outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-all"
            >
              {apiSaved ? 'CONFIG SAVED!' : 'APPLY KEY'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
