import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  RotateCw, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  QrCode, 
  Cpu, 
  Zap, 
  Activity, 
  CheckCircle2,
  ExternalLink,
  Flame,
  Star,
  Target,
  Maximize2,
  X
} from 'lucide-react';
import type { SouvenirData, ExperienceId } from '../../types';
import { resolveAssetUrl } from '../../services/apiService';

interface OperativeCard3DProps {
  data: SouvenirData;
  qrDataUrl?: string | null;
  correlation?: any;
  onFlip?: (isFlipped: boolean) => void;
}

export const OperativeCard3D: React.FC<OperativeCard3DProps> = ({
  data,
  qrDataUrl,
  correlation,
  onFlip
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isFullScreenView, setIsFullScreenView] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt & Lighting State
  const [tilt, setTilt] = useState<{ x: number; y: number; glareX: number; glareY: number }>({
    x: 0,
    y: 0,
    glareX: 50,
    glareY: 50
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleFlip = () => {
    const next = !isFlipped;
    setIsFlipped(next);
    if (onFlip) onFlip(next);
  };

  // Mouse tilt & holographic glare calculation
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -12;
    const tiltY = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: tiltX, y: tiltY, glareX, glareY });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = Math.max(-10, Math.min(10, ((y - centerY) / centerY) * -8));
    const tiltY = Math.max(-10, Math.min(10, ((x - centerX) / centerX) * 8));
    setTilt({ x: tiltX, y: tiltY, glareX: (x / rect.width) * 100, glareY: (y / rect.height) * 100 });
  }, []);

  const portalThemes: Record<string, { 
    color: string; 
    glow: string; 
    accent: string; 
    label: string; 
    icon: string;
    insignia: string;
    badgeTitle: string;
  }> = {
    'detective': { 
      color: '#00f2fe', 
      glow: 'rgba(0,242,254,0.35)', 
      accent: '#031726', 
      label: 'CYBER FORENSIC INVESTIGATOR', 
      icon: '🔍',
      insignia: 'FORENSIC TITAN',
      badgeTitle: 'FORENSIC INVESTIGATOR'
    },
    'smart-city': { 
      color: '#00ff88', 
      glow: 'rgba(0,255,136,0.35)', 
      accent: '#032014', 
      label: 'AUTONOMOUS URBAN ARCHITECT', 
      icon: '🏙️',
      insignia: 'METROPOLIS ARCHITECT',
      badgeTitle: 'SMART CITY ARCHITECT'
    },
    'ai-defense': { 
      color: '#ff007f', 
      glow: 'rgba(255,0,127,0.35)', 
      accent: '#260314', 
      label: 'CYBERNETIC SENTINEL', 
      icon: '🛡️',
      insignia: 'AEGIS SENTINEL',
      badgeTitle: 'CYBER DEFENDER'
    },
    'last-signal': { 
      color: '#a855f7', 
      glow: 'rgba(168,85,247,0.35)', 
      accent: '#170326', 
      label: 'QUANTUM SIGNAL SPECIALIST', 
      icon: '📡',
      insignia: 'CHRONOS DECODER',
      badgeTitle: 'QUANTUM CHRONICLER'
    }
  };

  const theme = portalThemes[data.experienceId] || portalThemes['detective'];
  const photoUrl = resolveAssetUrl(data.visitorPhotoUrl) || '/media/synthetic_avatar.png';
  const badgeRank = data.badge || (data.score >= 850 ? 'COMMANDER RANK' : data.score >= 600 ? 'SPECIALIST RANK' : 'OPERATIVE CADET');

  const ribbons = [
    { label: 'TACTICAL SPEED', score: '5/5 CLEARED', color: '#00f2fe' },
    { label: 'NEURAL SCORE', score: `${data.score} PTS`, color: '#f59e0b' },
    { label: 'ARCHETYPE', score: correlation?.compositeGrade || 'S+', color: '#10b981' },
    { label: 'AUTHENTICATED', score: 'EXPO 2026', color: '#a855f7' }
  ];

  return (
    <div className="w-full flex flex-col items-center select-none py-1 relative">
      {/* Top Controls Bar: Side Indicator & Full View Button */}
      <div className="flex items-center justify-between w-full max-w-[360px] mb-2 px-1 text-xs font-mono">
        <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'BADGE BACK // TELEMETRY' : 'BADGE FRONT // OPERATIVE PASS'}</span>
        </span>

        <button
          onClick={() => setIsFullScreenView(true)}
          className="text-slate-400 hover:text-cyan-300 font-bold flex items-center space-x-1 transition-colors"
          title="Open Fullscreen 3D Badge Inspector"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="text-[10px]">FULL VIEW</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* REALISTIC NYLON LANYARD STRAP & GUNMETAL CARABINER CLIP                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col items-center pointer-events-none -mb-3 z-30">
        <div className="w-9 h-12 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-x border-cyan-500/40 shadow-lg relative flex flex-col justify-around py-1">
          <div className="w-full h-0.5 bg-cyan-400/40" />
          <div className="text-[7px] font-mono tracking-widest text-cyan-300 uppercase text-center font-black rotate-90 scale-90">
            EXPO-26
          </div>
          <div className="w-full h-0.5 bg-cyan-400/40" />
        </div>

        <div className="w-6 h-6 rounded-md bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 border border-slate-300 shadow-md flex items-center justify-center -mt-1 z-20">
          <div className="w-2.5 h-3 rounded-full border-2 border-slate-300/80 bg-slate-900/60" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3D PERSPECTIVE BADGE WRAPPER                                              */}
      {/* ========================================================================= */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onClick={handleFlip}
        className="badge-3d-wrapper cursor-pointer group transition-transform duration-200"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          height: '580px',
          minHeight: '580px',
          perspective: '1600px',
          margin: '0 auto',
          flexShrink: 0
        }}
        title="Click or Tap to Rotate Badge"
      >
        <div 
          className="badge-3d-card"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '580px',
            borderRadius: '24px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `rotateY(${isFlipped ? 180 + (isHovered ? tilt.y : 0) : (isHovered ? tilt.y : 0)}deg) rotateX(${isHovered ? tilt.x : 0}deg)`,
            boxShadow: `0 25px 60px -15px rgba(0,0,0,0.95), 0 0 45px ${theme.glow}`
          }}
        >
          {/* ========================================================================= */}
          {/* FRONT SIDE: OFFICIAL HOLOGRAPHIC OPERATIVE BADGE                          */}
          {/* ========================================================================= */}
          <div 
            className="badge-3d-face border-2 backdrop-blur-2xl"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              minHeight: '580px',
              borderRadius: '24px',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.25rem',
              overflow: 'hidden',
              borderColor: `${theme.color}90`,
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, ${theme.accent} 0%, #060a14 60%, #010307 100%)`,
            }}
          >
            {/* Prismatic Holographic Foil Shader Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 mix-blend-color-dodge transition-opacity group-hover:opacity-35"
              style={{
                background: `linear-gradient(${115 + tilt.y * 2}deg, transparent 20%, rgba(255,255,255,0.4) 40%, rgba(0,242,254,0.6) 50%, rgba(255,0,128,0.5) 60%, transparent 80%)`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${tilt.glareX}% ${tilt.glareY}%`
              }}
            />

            {/* Micro-mesh Security Grid Background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: `radial-gradient(${theme.color} 1px, transparent 1px)`,
                backgroundSize: '12px 12px'
              }}
            />

            {/* Authentic Oval Lanyard Punch Slot */}
            <div className="absolute top-2.5 inset-x-0 mx-auto w-14 h-2.5 rounded-full bg-black/90 border border-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center z-10">
              <div className="w-8 h-1 rounded-full bg-slate-950" />
            </div>

            {/* Top Badge Header */}
            <div className="pt-3 border-b border-slate-800/80 pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div 
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-base shadow-lg relative overflow-hidden"
                    style={{ 
                      borderColor: theme.color, 
                      backgroundColor: `${theme.color}25`,
                      boxShadow: `0 0 15px ${theme.color}40`
                    }}
                  >
                    <span>{theme.icon}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase block font-bold">
                      EXPO 2026 // BADGE
                    </span>
                    <h3 className="text-xs font-display font-black text-white tracking-wider uppercase">
                      AI INTERACTIVE WORLD
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span 
                    className="text-[9px] font-mono px-2.5 py-0.5 rounded-full border font-black uppercase tracking-wider shadow-sm"
                    style={{ 
                      borderColor: theme.color, 
                      color: theme.color, 
                      backgroundColor: `${theme.color}15`,
                      boxShadow: `0 0 10px ${theme.color}30`
                    }}
                  >
                    {badgeRank}
                  </span>
                </div>
              </div>
            </div>

            {/* Operative Portrait & Credential Specs */}
            <div className="flex items-center space-x-3.5 my-1 relative z-10">
              <div 
                className="relative w-28 h-32 rounded-2xl overflow-hidden border-2 p-0.5 bg-black shrink-0 shadow-2xl"
                style={{ borderColor: theme.color }}
              >
                <img 
                  src={photoUrl} 
                  alt={data.visitorName} 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/media/synthetic_avatar.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: theme.color }} />
                <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: theme.color }} />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: theme.color }} />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: theme.color }} />

                <div className="absolute bottom-1 inset-x-0 text-center">
                  <span className="text-[8px] font-mono text-emerald-300 font-bold bg-black/90 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    BIO-VERIFIED
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-1 space-y-2 overflow-hidden">
                <div>
                  <span className="text-[8px] font-mono text-slate-400 block uppercase tracking-wider">
                    OPERATIVE CADET
                  </span>
                  <div className="text-base font-display font-black text-white truncate tracking-wide">
                    {data.visitorName || 'Cadet Alex'}
                  </div>
                </div>

                <div>
                  <span className="text-[8px] font-mono text-slate-400 block uppercase tracking-wider">
                    ROLE DESIGNATION
                  </span>
                  <div className="text-[10px] font-mono font-bold truncate leading-tight" style={{ color: theme.color }}>
                    {theme.label}
                  </div>
                </div>

                <div>
                  <span className="text-[8px] font-mono text-slate-400 block uppercase tracking-wider">
                    CLEARANCE SERIAL
                  </span>
                  <div className="text-[10px] font-mono text-slate-300 font-bold tracking-wider">
                    SES-{data.sessionId?.slice(0, 8) || '2026-X1'}
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Master Commendation Badge Insignia */}
            <div 
              className="p-3 rounded-2xl border relative overflow-hidden flex items-center justify-between z-10"
              style={{ 
                backgroundColor: 'rgba(5, 10, 20, 0.85)',
                borderColor: `${theme.color}40`,
                boxShadow: `inset 0 0 15px ${theme.color}15`
              }}
            >
              <div className="flex items-center space-x-2.5">
                <div 
                  className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xl shadow-lg relative bg-gradient-to-br from-slate-900 to-black shrink-0"
                  style={{ 
                    borderColor: theme.color,
                    boxShadow: `0 0 15px ${theme.color}50`
                  }}
                >
                  <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">
                    PRIMARY BADGE EMBLEM
                  </div>
                  <div className="text-xs font-display font-black text-white truncate">
                    {data.badge || theme.insignia}
                  </div>
                  <div className="text-[9px] font-mono text-amber-400 font-bold flex items-center space-x-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <span>MASTER OPERATIVE TIER</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <div className="text-[8px] font-mono text-slate-400 uppercase">SCORE XP</div>
                <div className="text-sm font-display font-black text-emerald-400">
                  {data.score} PTS
                </div>
              </div>
            </div>

            {/* Bottom Badge Footer with QR & Gold Microchip */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-2.5">
                {qrDataUrl ? (
                  <div className="w-11 h-11 bg-white p-1 rounded-xl shadow-md shrink-0 border border-slate-300">
                    <img src={qrDataUrl} alt="Passport QR" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-11 h-11 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-cyan-400" />
                  </div>
                )}
                <div>
                  <span className="text-[8px] font-mono text-slate-400 block">DIGITAL PASSPORT</span>
                  <span className="text-[9px] font-mono text-cyan-300 font-bold">SCAN TO TAKE HOME</span>
                </div>
              </div>

              <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-200/90 p-0.5 shadow-md flex items-center justify-center relative overflow-hidden shrink-0">
                <div className="w-full h-full border border-amber-950/70 rounded grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5 opacity-90">
                  <div className="bg-amber-950/50 rounded-sm" />
                  <div className="bg-amber-950/50 rounded-sm" />
                  <div className="bg-amber-950/50 rounded-sm" />
                  <div className="bg-amber-950/50 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Interactive Flip Instruction */}
            <div className="text-center text-[9px] font-mono text-cyan-400 font-bold tracking-widest uppercase bg-cyan-950/50 py-1 rounded-full border border-cyan-500/30 shadow-sm">
              CLICK / TAP BADGE TO ROTATE ↻
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BACK SIDE: 5-PHASE MISSION TELEMETRY & EMBEDDED COMMENDATION RIBBONS      */}
          {/* ========================================================================= */}
          <div 
            className="badge-3d-face border-2 backdrop-blur-2xl"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              minHeight: '580px',
              borderRadius: '24px',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.25rem',
              overflow: 'hidden',
              borderColor: '#00f2fe90',
              background: `radial-gradient(circle at ${100 - tilt.glareX}% ${tilt.glareY}%, #081a2f 0%, #030812 60%, #010408 100%)`,
            }}
          >
            {/* Lanyard Cutout Slot */}
            <div className="absolute top-2.5 inset-x-0 mx-auto w-14 h-2.5 rounded-full bg-black/90 border border-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center z-10">
              <div className="w-8 h-1 rounded-full bg-slate-950" />
            </div>

            {/* Back Magnetic Stripe */}
            <div className="w-full h-7 bg-gradient-to-r from-black via-slate-900 to-black rounded-lg border-y border-slate-800 -mx-5 px-5 flex items-center justify-between text-[7px] font-mono text-slate-500 mt-2">
              <span>||||||||||||||||||||||||||||||||||||</span>
              <span>MAG-STRIPE // ENC-2026-X</span>
            </div>

            {/* Back Header */}
            <div className="border-b border-slate-800/80 pb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-display font-black text-white uppercase tracking-wider">
                  MISSION PERFORMANCE MATRIX
                </span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50 font-bold">
                5-PHASE CLEARED
              </span>
            </div>

            {/* Behavioral Archetype Chip */}
            <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-0.5">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-400 uppercase">BEHAVIORAL ARCHETYPE:</span>
                <span className="text-amber-400 font-bold">RANK {correlation?.compositeGrade || 'S+'}</span>
              </div>
              <div className="text-xs font-display font-black text-white truncate">
                {correlation?.compositeArchetype || correlation?.compositeTitle || 'Tactical Precision Analyst'}
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                Consistency: <span className="text-cyan-300 font-bold">{correlation?.consistencyRating || 'Flawless Synchrony'}</span>
              </div>
            </div>

            {/* 5-Phase Level Telemetry Strip (300s Standard) */}
            <div className="space-y-1">
              <div className="text-[8px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>5-PHASE PROGRESSION (300S STANDARD)</span>
                <span className="text-cyan-400 font-bold">5 / 5 CLEARED</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const lr = data.levelResults?.find(r => r.level === lvl);
                  return (
                    <div 
                      key={lvl}
                      className="p-1.5 rounded-xl border text-center flex flex-col justify-between bg-slate-950/90 border-slate-800"
                    >
                      <div className="text-[7px] font-mono font-bold text-cyan-400">P{lvl}</div>
                      <CheckCircle2 className="w-3.5 h-3.5 mx-auto my-0.5 text-emerald-400" />
                      <div className="text-[7px] font-mono text-slate-300">{lr?.score || (lvl * 50)}p</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Embedded Commendation Ribbons Rack */}
            <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5">
              <div className="text-[8px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>COMMENDATION RIBBON RACK</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {ribbons.map((rib, idx) => (
                  <div 
                    key={idx} 
                    className="p-1.5 rounded-lg border bg-black/60 flex items-center space-x-2"
                    style={{ borderColor: `${rib.color}40` }}
                  >
                    <div 
                      className="w-2 h-5 rounded-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: rib.color }}
                    />
                    <div className="overflow-hidden">
                      <div className="text-[7px] font-mono text-slate-400 truncate uppercase leading-tight">
                        {rib.label}
                      </div>
                      <div className="text-[8px] font-mono font-black text-white truncate">
                        {rib.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Seal & SHA-256 Authentication Stamp */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[8px] font-mono text-slate-500">
              <div>
                <div>SHA-256: #8A4F-E029-C7B1-99A0</div>
                <div>VERIFIED: SCIENCE EXPOSITION 2026</div>
              </div>
              <div className="w-8 h-8 rounded-full border border-cyan-400/50 bg-cyan-950/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.3)]">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            {/* Interactive Flip Instruction */}
            <div className="text-center text-[9px] font-mono text-cyan-400 font-bold tracking-widest uppercase bg-cyan-950/50 py-1 rounded-full border border-cyan-500/30 shadow-sm">
              CLICK / TAP BADGE TO ROTATE ↻
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Tactile Rotate Control */}
      <div className="mt-3 flex items-center justify-center">
        <button
          onClick={handleFlip}
          className="px-5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 border-2 border-cyan-400 text-cyan-300 font-display font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_25px_rgba(0,242,254,0.35)] transition-all active:scale-95"
        >
          <RotateCw className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>{isFlipped ? 'ROTATE TO BADGE FRONT' : 'ROTATE TO BADGE BACK (FULL VIEW)'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN 3D BADGE INSPECTOR MODAL                                       */}
      {/* ========================================================================= */}
      {isFullScreenView && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono mb-3">
            <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>FULL VIEW 3D OPERATIVE BADGE</span>
            </span>
            <button
              onClick={() => setIsFullScreenView(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
            {/* Same badge rendered with full clarity */}
            <div 
              onClick={handleFlip}
              className="w-full h-[580px] cursor-pointer"
              style={{ perspective: '1600px' }}
            >
              <div 
                className="relative w-full h-full rounded-3xl transition-transform duration-700 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
                  boxShadow: `0 25px 60px -15px rgba(0,0,0,0.95), 0 0 50px ${theme.glow}`
                }}
              >
                {/* Front Side Clone */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-3xl border-2 p-5 flex flex-col justify-between overflow-hidden backdrop-blur-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    borderColor: `${theme.color}90`,
                    background: `radial-gradient(circle at 50% 50%, ${theme.accent} 0%, #060a14 60%, #010307 100%)`,
                  }}
                >
                  <div className="pt-3 border-b border-slate-800/80 pb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl border flex items-center justify-center text-base" style={{ borderColor: theme.color, backgroundColor: `${theme.color}25` }}>
                        <span>{theme.icon}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">EXPO 2026 // BADGE</span>
                        <h3 className="text-xs font-display font-black text-white">AI INTERACTIVE WORLD</h3>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border font-black uppercase" style={{ borderColor: theme.color, color: theme.color }}>
                      {badgeRank}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3.5 my-1">
                    <div className="w-28 h-32 rounded-2xl overflow-hidden border-2 bg-black shrink-0" style={{ borderColor: theme.color }}>
                      <img src={photoUrl} alt={data.visitorName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-[8px] font-mono text-slate-400 block uppercase">OPERATIVE CADET</span>
                        <div className="text-base font-display font-black text-white truncate">{data.visitorName || 'Cadet Alex'}</div>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-slate-400 block uppercase">ROLE DESIGNATION</span>
                        <div className="text-[10px] font-mono font-bold truncate" style={{ color: theme.color }}>{theme.label}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: 'rgba(5, 10, 20, 0.85)', borderColor: `${theme.color}40` }}>
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-[8px] font-mono text-slate-400 uppercase">PRIMARY BADGE EMBLEM</div>
                        <div className="text-xs font-display font-black text-white truncate">{data.badge || theme.insignia}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] font-mono text-slate-400">SCORE XP</div>
                      <div className="text-sm font-display font-black text-emerald-400">{data.score} PTS</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-10 h-10 bg-white p-0.5 rounded-lg" />}
                      <span className="text-[9px] font-mono text-cyan-300 font-bold">SMARTPHONE PASSPORT</span>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>

                {/* Back Side Clone */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-3xl border-2 p-5 flex flex-col justify-between overflow-hidden backdrop-blur-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderColor: '#00f2fe90',
                    background: 'radial-gradient(circle at 50% 50%, #081a2f 0%, #030812 60%, #010408 100%)',
                  }}
                >
                  <div className="border-b border-slate-800/80 pb-2 flex items-center justify-between">
                    <span className="text-xs font-display font-black text-white uppercase">MISSION TELEMETRY</span>
                    <span className="text-[9px] font-mono text-emerald-400">5-PHASE CLEARED</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-0.5">
                    <div className="text-[9px] font-mono text-slate-400">BEHAVIORAL ARCHETYPE:</div>
                    <div className="text-xs font-display font-black text-white">{correlation?.compositeArchetype || correlation?.compositeTitle || 'Tactical Precision Analyst'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[8px] font-mono text-slate-400 uppercase">5-PHASE PROGRESSION</div>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const lr = data.levelResults?.find(r => r.level === lvl);
                        return (
                          <div key={lvl} className="p-1 rounded-xl border text-center bg-slate-950/90 border-slate-800">
                            <div className="text-[7px] font-mono text-cyan-400">P{lvl}</div>
                            <CheckCircle2 className="w-3.5 h-3.5 mx-auto text-emerald-400" />
                            <div className="text-[7px] font-mono text-slate-300">{lr?.score || (lvl * 50)}p</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[8px] font-mono text-slate-400 uppercase mb-1">COMMENDATION RIBBONS</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ribbons.map((rib, idx) => (
                        <div key={idx} className="p-1 rounded-lg border bg-black/60 flex items-center space-x-1.5" style={{ borderColor: `${rib.color}40` }}>
                          <div className="w-1.5 h-4 rounded-sm" style={{ backgroundColor: rib.color }} />
                          <div className="text-[8px] font-mono font-bold text-white truncate">{rib.score}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[8px] font-mono text-slate-500">
                    <span>SHA-256 VERIFIED</span>
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleFlip}
              className="mt-4 px-6 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg"
            >
              <RotateCw className="w-4 h-4" />
              <span>{isFlipped ? 'ROTATE TO FRONT' : 'ROTATE TO BACK'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
