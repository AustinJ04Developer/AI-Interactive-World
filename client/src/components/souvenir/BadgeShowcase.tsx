import React from 'react';
import { 
  Award, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Target, 
  Crosshair, 
  Compass, 
  Radio, 
  CheckCircle2,
  Flame,
  Star
} from 'lucide-react';
import type { SouvenirData } from '../../types';

interface BadgeShowcaseProps {
  data: SouvenirData;
}

interface BadgeItem {
  id: string;
  name: string;
  category: 'portal' | 'skill' | 'achievement' | 'mastery';
  tier: 'Diamond' | 'Gold' | 'Cyber-Neon' | 'Master';
  description: string;
  icon: string;
  colorHex: string;
}

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ data }) => {
  // Synthesize curated badge items based on portal and achievements
  const portalBadges: Record<string, BadgeItem[]> = {
    'detective': [
      {
        id: 'b-detective-master',
        name: data.badge || 'MASTER DETECTIVE',
        category: 'portal',
        tier: 'Diamond',
        description: 'Completed forensic synthesis and identified true culprit without contradictory telemetry.',
        icon: '🔍',
        colorHex: '#00f2fe'
      },
      {
        id: 'b-contra-hunter',
        name: 'CONTRADICTION HUNTER',
        category: 'skill',
        tier: 'Gold',
        description: 'Exposed biometric stress spikes on suspect polygraph testimony.',
        icon: '⚡',
        colorHex: '#ffaa00'
      },
      {
        id: 'b-timeline-sync',
        name: 'CHRONO-SYNTHESIZER',
        category: 'achievement',
        tier: 'Cyber-Neon',
        description: 'Correlated access logs across 5 operational phases under 300s budget.',
        icon: '⏱️',
        colorHex: '#00ff88'
      }
    ],
    'smart-city': [
      {
        id: 'b-city-master',
        name: data.badge || 'MASTER URBAN PLANNER',
        category: 'portal',
        tier: 'Diamond',
        description: 'Navigated all 5 municipal sectors maintaining net-zero grid efficiency.',
        icon: '🏙️',
        colorHex: '#00ff88'
      },
      {
        id: 'b-zero-emission',
        name: 'NET-ZERO PILOT',
        category: 'skill',
        tier: 'Gold',
        description: 'Completed circuit without high-speed collisions or obstacle traps.',
        icon: '🍃',
        colorHex: '#10b981'
      },
      {
        id: 'b-civic-connector',
        name: 'CIVIC AI INTERFACER',
        category: 'achievement',
        tier: 'Cyber-Neon',
        description: 'Synchronized telemetry across Fusion Grid, Hospital, and Central Monument.',
        icon: '🌐',
        colorHex: '#00f2fe'
      }
    ],
    'ai-defense': [
      {
        id: 'b-defense-master',
        name: data.badge || 'CYBER-ATHLETE ELITE',
        category: 'portal',
        tier: 'Diamond',
        description: 'Secured Quantum Core across 5 escalating waves of malware infiltration.',
        icon: '🛡️',
        colorHex: '#ff007f'
      },
      {
        id: 'b-reflex-sentinel',
        name: 'SUB-200MS REFLEX',
        category: 'skill',
        tier: 'Gold',
        description: 'Maintained lightning target locks with zero core breach failures.',
        icon: '🎯',
        colorHex: '#f43f5e'
      },
      {
        id: 'b-swarm-survivor',
        name: 'TITAN BREAKER',
        category: 'achievement',
        tier: 'Cyber-Neon',
        description: 'Neutralized high-threat zero-day glitch entities using plasma bursts.',
        icon: '💥',
        colorHex: '#a855f7'
      }
    ],
    'last-signal': [
      {
        id: 'b-signal-master',
        name: data.badge || 'EPOCH CHRONICLER',
        category: 'portal',
        tier: 'Diamond',
        description: 'Decrypted alien harmonics and broadcasted unified epoch frequency.',
        icon: '📡',
        colorHex: '#7928ca'
      },
      {
        id: 'b-diplo-envoy',
        name: 'COSMIC HARMONIC ENVOY',
        category: 'skill',
        tier: 'Gold',
        description: 'Established peaceful communication primes with deep space intelligence.',
        icon: '🕊️',
        colorHex: '#06b6d4'
      },
      {
        id: 'b-quantum-crisis',
        name: 'SINGULARITY SHIELD',
        category: 'achievement',
        tier: 'Cyber-Neon',
        description: 'Stabilized reactor warp crisis across 5 decision phases.',
        icon: '⚛️',
        colorHex: '#ec4899'
      }
    ]
  };

  const currentBadges = portalBadges[data.experienceId] || portalBadges['detective'];

  // Add any extra dynamic achievement badges passed in data
  const extraBadges: BadgeItem[] = (data.achievements || []).map((ach, idx) => ({
    id: `dyn-ach-${idx}`,
    name: ach.toUpperCase(),
    category: 'achievement',
    tier: idx === 0 ? 'Gold' : 'Cyber-Neon',
    description: `Unlocked during ${data.experienceTitle} expedition run.`,
    icon: idx % 2 === 0 ? '★' : '🎖️',
    colorHex: idx % 2 === 0 ? '#00f2fe' : '#ffaa00'
  }));

  // Deduplicate badges by name
  const allBadges = [...currentBadges];
  extraBadges.forEach(eb => {
    if (!allBadges.some(b => b.name === eb.name)) {
      allBadges.push(eb);
    }
  });

  return (
    <div className="w-full space-y-4 py-2">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
            OFFICIAL EXHIBITION BADGE VAULT
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
          {allBadges.length} BADGES UNLOCKED
        </span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {allBadges.map((badge) => (
          <div 
            key={badge.id}
            className="p-4 rounded-2xl border bg-slate-950/80 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group shadow-lg relative overflow-hidden"
            style={{ borderColor: `${badge.colorHex}40` }}
          >
            {/* Ambient Background Glow */}
            <div 
              className="absolute -top-10 -right-10 w-24 h-24 rounded-full pointer-events-none opacity-20 blur-xl"
              style={{ backgroundColor: badge.colorHex }}
            />

            <div>
              {/* Badge Top Header */}
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase"
                  style={{ 
                    borderColor: `${badge.colorHex}60`, 
                    color: badge.colorHex,
                    backgroundColor: `${badge.colorHex}15`
                  }}
                >
                  {badge.tier} MEDAL
                </span>
                <span className="text-[9px] font-mono text-slate-500">EXPO 2026</span>
              </div>

              {/* Central Medal Emblem */}
              <div className="flex items-center space-x-3 my-1">
                <div 
                  className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform shrink-0"
                  style={{ 
                    borderColor: badge.colorHex, 
                    backgroundColor: `${badge.colorHex}20`,
                    boxShadow: `0 0 20px ${badge.colorHex}30`
                  }}
                >
                  {badge.icon}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-display font-black text-white leading-tight tracking-wide group-hover:text-cyan-300 transition-colors">
                    {badge.name}
                  </h4>
                  <div className="text-[9px] font-mono text-slate-400 capitalize mt-0.5">
                    {badge.category} Medal
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] font-sans text-slate-300 leading-relaxed mt-2.5 font-normal">
                {badge.description}
              </p>
            </div>

            {/* Verification Footer */}
            <div className="pt-2.5 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>VERIFIED ACCREDITATION</span>
              </span>
              <span>100% UNLOCKED</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
