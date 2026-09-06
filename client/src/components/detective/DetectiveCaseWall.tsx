import React, { useMemo } from 'react';
import { Pin, Video, FileText, Mic, Fingerprint, Sparkles, AlertCircle } from 'lucide-react';
import type { ClueEvidence, Suspect } from '../../types';

interface DetectiveCaseWallProps {
  clues: ClueEvidence[];
  suspects: Suspect[];
  pinnedClueIds: string[];
  selectedSuspectId: string | null;
  onTogglePinClue: (clueId: string) => void;
  onSelectClue: (clue: ClueEvidence) => void;
  onSelectSuspect: (suspect: Suspect) => void;
}

export const DetectiveCaseWall: React.FC<DetectiveCaseWallProps> = ({
  clues,
  suspects,
  pinnedClueIds,
  selectedSuspectId,
  onTogglePinClue,
  onSelectClue,
  onSelectSuspect
}) => {
  // Default corkboard coordinates for suspects if not explicitly provided
  const suspectPositions: Record<string, { x: number; y: number }> = useMemo(() => {
    return {
      'suspect-1': { x: 18, y: 14 },
      'suspect-2': { x: 50, y: 12 },
      'suspect-3': { x: 82, y: 14 }
    };
  }, []);

  // Default corkboard coordinates for clues (accumulating across levels 1-5)
  const cluePositions: Record<string, { x: number; y: number }> = useMemo(() => ({
    c1: { x: 15, y: 55 },
    c2: { x: 38, y: 62 },
    c3: { x: 62, y: 58 },
    c4: { x: 85, y: 65 },
    c5: { x: 50, y: 82 }
  }), []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CCTV': return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'DOCUMENT': return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
      case 'AUDIO': return <Mic className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getSuspectPhoto = (name: string): string => {
    if (name.includes('Thorne') || name.includes('Silas') || name.includes('Vance')) return '/media/suspect_thorne.jpg';
    if (name.includes('Elena') || name.includes('Rostova') || name.includes('Ava') || name.includes('Evelyn')) return '/media/suspect_elena.jpg';
    if (name.includes('Finnick') || name.includes('Troy') || name.includes('Drake') || name.includes('Marcus')) return '/media/suspect_finnick.jpg';
    return '/media/suspect_maya.jpg';
  };

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden bg-[#120f0d] border border-amber-900/40 shadow-2xl p-4 select-none">
      {/* Corkboard texture background with vintage tactical grid overlay */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(217, 119, 6, 0.15) 1px, transparent 1px),
            linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.8))
          `,
          backgroundSize: '24px 24px, 100% 100%'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

      {/* Case Wall Header Badge */}
      <div className="relative z-10 flex items-center justify-between pb-3 mb-2 border-b border-amber-800/40 font-mono text-xs text-amber-200">
        <div className="flex items-center space-x-2">
          <Pin className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-amber-300">
            EVIDENCE CORKBOARD // RED YARN CORRELATION MATRIX
          </span>
        </div>
        <div className="text-[11px] text-amber-400/80">
          PINNED EVIDENCE: <span className="font-bold text-rose-400">{pinnedClueIds.length}</span> / {clues.length}
        </div>
      </div>

      {/* SVG Canvas for Dynamic Red Yarn Strings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {/* Draw red yarn string lines between pinned clues and active suspect */}
        {pinnedClueIds.map((clueId, idx) => {
          const cluePos = cluePositions[clueId] || { x: 20 + (idx * 18), y: 65 };
          const activeSuspectPos = selectedSuspectId && suspectPositions[selectedSuspectId]
            ? suspectPositions[selectedSuspectId]
            : suspectPositions['suspect-2'] || { x: 50, y: 15 };

          return (
            <g key={clueId}>
              {/* Drop shadow string */}
              <line
                x1={`${cluePos.x}%`}
                y1={`${cluePos.y}%`}
                x2={`${activeSuspectPos.x}%`}
                y2={`${activeSuspectPos.y + 8}%`}
                stroke="rgba(0, 0, 0, 0.8)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* High-tension red yarn string */}
              <line
                x1={`${cluePos.x}%`}
                y1={`${cluePos.y}%`}
                x2={`${activeSuspectPos.x}%`}
                y2={`${activeSuspectPos.y + 8}%`}
                stroke="#ef4444"
                strokeWidth="2.2"
                strokeDasharray={idx % 2 === 1 ? '4 2' : 'none'}
                className="animate-pulse"
                style={{ animationDuration: `${2.5 + idx * 0.4}s` }}
              />
            </g>
          );
        })}
      </svg>

      {/* Suspect Polaroid Cards Row (Top Zone) */}
      <div className="relative z-20 w-full h-full">
        {suspects.map((suspect, sIdx) => {
          const pos = suspectPositions[suspect.id] || { x: 18 + sIdx * 32, y: 14 };
          const isSelected = selectedSuspectId === suspect.id;

          return (
            <div
              key={suspect.id}
              onClick={() => onSelectSuspect(suspect)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={`absolute -translate-x-1/2 cursor-pointer transition-all duration-300 group ${
                isSelected
                  ? 'scale-105 z-30'
                  : 'scale-95 opacity-85 hover:opacity-100 hover:scale-100'
              }`}
            >
              {/* Push Pin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-4 h-4 rounded-full bg-rose-600 shadow-[0_2px_8px_rgba(239,68,68,0.8)] border border-rose-300 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white" />
              </div>

              {/* Polaroid Card */}
              <div className={`p-2.5 rounded-lg bg-[#f8fafc] text-slate-950 shadow-2xl transition-all ${
                isSelected ? 'ring-4 ring-rose-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] rotate-1' : '-rotate-1 hover:rotate-0'
              }`}>
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded overflow-hidden bg-slate-900 mb-1.5 border border-slate-300 relative">
                  <img
                    src={getSuspectPhoto(suspect.name)}
                    alt={suspect.name}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-rose-500/20 mix-blend-overlay" />
                  )}
                </div>
                <div className="text-[11px] font-bold font-sans truncate max-w-[110px] text-slate-900 leading-tight">
                  {suspect.name}
                </div>
                <div className="text-[9px] font-mono text-slate-600 truncate max-w-[110px]">
                  {suspect.role}
                </div>
                {isSelected && (
                  <div className="mt-1 inline-flex items-center text-[8px] font-mono font-bold text-rose-600 uppercase tracking-tighter">
                    TARGET LINKED
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Pinned Evidence Cards Across Board (Bottom Zone) */}
        {clues.map((clue, cIdx) => {
          const pos = cluePositions[clue.id] || { x: 15 + cIdx * 19, y: 60 };
          const isPinned = pinnedClueIds.includes(clue.id);

          return (
            <div
              key={clue.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={`absolute -translate-x-1/2 cursor-pointer transition-all duration-300 group ${
                isPinned ? 'scale-100 z-20' : 'scale-90 opacity-70 hover:opacity-100 hover:scale-95'
              }`}
              onClick={() => onSelectClue(clue)}
            >
              {/* Push Pin */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePinClue(clue.id);
                }}
                className={`absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-5 h-5 rounded-full border shadow-md flex items-center justify-center transition-all ${
                  isPinned 
                    ? 'bg-amber-400 border-amber-200 text-black shadow-[0_0_10px_#f59e0b]' 
                    : 'bg-slate-700 border-slate-500 text-slate-300 hover:bg-amber-400 hover:text-black'
                }`}
                title={isPinned ? 'Unpin from case-wall' : 'Pin to case-wall'}
              >
                <Pin className="w-2.5 h-2.5 fill-current" />
              </button>

              {/* Evidence Polaroid / Note */}
              <div className={`w-32 sm:w-36 p-2 rounded-lg backdrop-blur-md border shadow-xl transition-all ${
                isPinned 
                  ? 'bg-slate-900/95 border-amber-500/70 text-slate-100 rotate-1 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 -rotate-2 hover:rotate-0'
              }`}>
                <div className="flex items-center justify-between mb-1 text-[9px] font-mono text-amber-400 font-bold border-b border-slate-800 pb-1">
                  <div className="flex items-center space-x-1">
                    {getCategoryIcon(clue.category)}
                    <span>{clue.category}</span>
                  </div>
                  <span className="text-slate-400">{clue.timestamp}</span>
                </div>
                <div className="text-[10px] font-bold font-sans text-slate-100 leading-tight mb-1 truncate">
                  {clue.title}
                </div>
                <div className="text-[9px] font-mono text-slate-400 line-clamp-2 leading-relaxed">
                  {clue.details}
                </div>
                <div className="mt-1.5 flex items-center justify-between pt-1 border-t border-slate-800/80 text-[8px] font-mono">
                  <span className={isPinned ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                    {isPinned ? '✓ PINNED' : 'CLICK TO PIN'}
                  </span>
                  <span className="text-cyan-400 font-bold">L{clue.level || 1}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
