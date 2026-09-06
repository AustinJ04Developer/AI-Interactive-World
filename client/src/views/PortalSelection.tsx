import React, { useState } from 'react';
import { 
  Search, 
  Building2, 
  ShieldAlert, 
  Radio, 
  ArrowUpRight, 
  Sparkles, 
  Users, 
  User,
  Zap, 
  Award 
} from 'lucide-react';
import type { ExperienceId } from '../types';
import { soundFX } from '../services/audioService';
import { NovaGuide } from '../components/nova/NovaGuide';
import { GameDemoModal } from '../components/demo/GameDemoModal';

interface PortalSelectionProps {
  onSelectExperience: (id: ExperienceId, mode: 'SOLO' | 'TEAM') => void;
}

interface StudentPortalCard {
  id: ExperienceId;
  portalNum: string;
  roleTitle: string;
  missionName: string;
  subtitle: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
  tags: string[];
  xpReward: string;
  bgGradient: string;
  imageBackdrop: string;
  feedTag: string;
}

const STUDENT_PORTALS: StudentPortalCard[] = [
  {
    id: 'detective',
    portalNum: 'WORLD 01',
    roleTitle: 'SUPER DETECTIVE',
    missionName: 'THE MYSTERY LAB',
    subtitle: 'Find hidden clues & crack the secret case!',
    color: '#00f2fe',
    glowColor: 'rgba(0, 242, 254, 0.4)',
    icon: <Search className="w-8 h-8 text-cyan-300" />,
    tags: ['CCTV Video', 'Secret Clues', 'Suspects', 'Forensic AI'],
    xpReward: '+500 XP',
    bgGradient: 'from-cyan-950/40 via-slate-950/90 to-slate-950',
    imageBackdrop: '/media/portal_detective.jpg',
    feedTag: 'CAM #04 FORENSIC LAB'
  },
  {
    id: 'smart-city',
    portalNum: 'WORLD 02',
    roleTitle: 'CITY EXPLORER',
    missionName: 'SMART CITY 2050',
    subtitle: 'Explore 3D flying cars, robots & green energy!',
    color: '#00ff88',
    glowColor: 'rgba(0, 255, 136, 0.4)',
    icon: <Building2 className="w-8 h-8 text-emerald-300" />,
    tags: ['3D World', 'Flying Cars', 'Talk to AI', 'Hero Monument'],
    xpReward: '+500 XP',
    bgGradient: 'from-emerald-950/40 via-slate-950/90 to-slate-950',
    imageBackdrop: '/media/portal_smart_city.jpg',
    feedTag: 'DRONE #12 SKYWAY PATROL'
  },
  {
    id: 'ai-defense',
    portalNum: 'WORLD 03',
    roleTitle: 'AI DEFENDER',
    missionName: 'PROTECT THE CORE',
    subtitle: 'Can you defeat an AI swarm that adapts to your speed?',
    color: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.4)',
    icon: <ShieldAlert className="w-8 h-8 text-pink-300" />,
    tags: ['Fast Action', 'Laser Shields', 'Reaction Test', 'Mutating Glitches'],
    xpReward: '+500 XP',
    bgGradient: 'from-pink-950/40 via-slate-950/90 to-slate-950',
    imageBackdrop: '/media/portal_ai_defense.jpg',
    feedTag: 'QUANTUM CORE THERMOGRAPHY'
  },
  {
    id: 'last-signal',
    portalNum: 'WORLD 04',
    roleTitle: 'SPACE EXPLORER',
    missionName: 'THE LAST SIGNAL',
    subtitle: 'Make big decisions in a cinematic space adventure!',
    color: '#ffaa00',
    glowColor: 'rgba(255, 170, 0, 0.4)',
    icon: <Radio className="w-8 h-8 text-amber-300" />,
    tags: ['Cinematic Story', 'Voice Choices', 'Alien Signals', 'Movie Poster'],
    xpReward: '+500 XP',
    bgGradient: 'from-amber-950/40 via-slate-950/90 to-slate-950',
    imageBackdrop: '/media/portal_last_signal.jpg',
    feedTag: 'ORBITAL ARRAY TRANSMISSION'
  }
];

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectExperience }) => {
  const [hoveredPortal, setHoveredPortal] = useState<ExperienceId | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [pendingExperienceId, setPendingExperienceId] = useState<ExperienceId | null>(null);

  const handlePortalClick = (id: ExperienceId) => {
    soundFX.playClick();
    setPendingExperienceId(id);
    setDemoModalOpen(true);
  };

  const handleStartRealGame = () => {
    if (!pendingExperienceId) return;
    setDemoModalOpen(false);
    soundFX.playWarp();
    onSelectExperience(pendingExperienceId, 'SOLO');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between px-6 sm:px-12 pt-20 pb-10 space-bg">
      <div className="scanlines absolute inset-0 z-10 pointer-events-none" />

      {/* Atmospheric Glow */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-700 opacity-20"
        style={{
          background: hoveredPortal === 'detective' 
            ? 'radial-gradient(circle at 20% 50%, #00f2fe 0%, transparent 60%)'
            : hoveredPortal === 'smart-city'
            ? 'radial-gradient(circle at 40% 50%, #00ff88 0%, transparent 60%)'
            : hoveredPortal === 'ai-defense'
            ? 'radial-gradient(circle at 60% 50%, #ff007f 0%, transparent 60%)'
            : hoveredPortal === 'last-signal'
            ? 'radial-gradient(circle at 80% 50%, #ffaa00 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 50%, #0066ff 0%, transparent 70%)'
        }}
      />

      {/* Top Banner: Mascot & Mission Briefing */}
      <div className="relative z-20 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <NovaGuide
          message="Pick any world to start your mission!"
          subMessage="Every student gets a unique scenario assigned by our AI core."
          mood="excited"
        />

        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>SINGLE PLAYER EXPEDITION • ONE-TAP PLAY</span>
        </div>
      </div>

      {/* 4 Student-Friendly World Cards */}
      <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto w-full my-auto">
        {STUDENT_PORTALS.map((portal) => {
          const isHovered = hoveredPortal === portal.id;

          return (
            <div
              key={portal.id}
              onMouseEnter={() => {
                soundFX.playScan();
                setHoveredPortal(portal.id);
              }}
              onMouseLeave={() => setHoveredPortal(null)}
              onClick={() => handlePortalClick(portal.id)}
              className={`group relative rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 transform border backdrop-blur-xl overflow-hidden ${
                isHovered
                  ? 'scale-[1.03] -translate-y-2 shadow-2xl'
                  : 'border-slate-800/80 hover:border-slate-600'
              }`}
              style={{
                borderColor: isHovered ? portal.color : undefined,
                boxShadow: isHovered ? `0 0 35px ${portal.glowColor}, inset 0 0 20px ${portal.glowColor}` : undefined
              }}
            >
              {/* Photorealistic AI Generated Backdrop with Video Shimmer */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={portal.imageBackdrop}
                  alt={portal.missionName}
                  className={`w-full h-full object-cover transition-transform duration-700 ease-out opacity-25 group-hover:opacity-40 group-hover:scale-110 ${
                    isHovered ? 'brightness-110' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
                <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />
              </div>

              {/* Live Video Telemetry Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-950/90 border border-slate-800 text-[10px] font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-slate-300 font-bold truncate max-w-[130px]">{portal.feedTag}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    {portal.xpReward}
                  </span>
                </div>

                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${portal.color}15`, border: `1px solid ${portal.color}40` }}
                >
                  {portal.icon}
                </div>

                <div className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  BECOME A
                </div>
                <h3 className="text-xl font-display font-black text-white tracking-wide mb-1 group-hover:text-cyan-200 transition-colors">
                  {portal.roleTitle}
                </h3>
                <div 
                  className="text-xs font-mono font-bold mb-2 uppercase"
                  style={{ color: portal.color }}
                >
                  {portal.missionName}
                </div>

                <p className="text-xs font-sans text-slate-300 leading-relaxed line-clamp-3 mb-4">
                  {portal.subtitle}
                </p>
              </div>

              {/* Bottom Tags & Start Trigger */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {portal.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePortalClick(portal.id);
                    }}
                    className="flex-1 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-md group-hover:shadow-[0_0_15px_rgba(0,242,254,0.4)]"
                    style={{
                      backgroundColor: portal.color,
                      color: '#020408'
                    }}
                  >
                    <span>DEMO & PLAY</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Helper */}
      <div className="relative z-20 text-center font-mono text-[11px] text-slate-400">
        MISSION BRIEFING & INTERACTIVE DEMO INCLUDED • DURATION: 2–4 MINUTES • OFFICIAL SOUVENIR POSTER 📸
      </div>

      {/* Interactive Pre-Game Demo & Instruction Training Modal */}
      {demoModalOpen && pendingExperienceId && (
        <GameDemoModal
          isOpen={demoModalOpen}
          experienceId={pendingExperienceId}
          onClose={() => setDemoModalOpen(false)}
          onStartOriginalGame={handleStartRealGame}
        />
      )}
    </div>
  );
};
