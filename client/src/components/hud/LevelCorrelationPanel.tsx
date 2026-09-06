import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Award, 
  Sparkles,
  GitBranch,
  ShieldCheck,
  Target
} from 'lucide-react';
import type { LevelResult, CorrelationAnalysis, ExperienceId } from '../../types';

interface LevelCorrelationPanelProps {
  levelResults: LevelResult[];
  correlation: CorrelationAnalysis;
  experienceId: ExperienceId;
  themeColor?: string;
}

export const LevelCorrelationPanel: React.FC<LevelCorrelationPanelProps> = ({
  levelResults,
  correlation,
  experienceId,
  themeColor = '#00f2fe'
}) => {
  const points = correlation.sparklinePoints;

  // Build SVG polygon/polyline path for sparkline (viewBox 0 0 400 100)
  const sparklineCoords = points.map((val, idx) => {
    const x = 40 + idx * 80;
    const y = 85 - (val * 0.7); // 15 to 85 range
    return { x, y, val };
  });

  const polylineStr = sparklineCoords.map(c => `${c.x},${c.y}`).join(' ');
  const areaPathStr = `M ${sparklineCoords[0].x},95 L ${polylineStr} L ${sparklineCoords[sparklineCoords.length - 1].x},95 Z`;

  return (
    <div className="w-full max-w-full rounded-2xl bg-slate-950/90 border border-slate-800 p-3 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col space-y-4 font-display text-slate-100 overflow-hidden box-border">
      
      {/* Correlation Top Header: Composite Archetype & Consistency */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>CROSS-LEVEL PERFORMANCE CORRELATION</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
            {correlation.compositeTitle}
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">COMPOSITE GRADE</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {correlation.compositeGrade}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-slate-300">
            {correlation.consistencyRating}
          </div>
        </div>
      </div>

      {/* 5-Segment Level Telemetry Strip */}
      <div>
        <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-2">
          5-PHASE PROGRESSION MATRIX (≈300S STANDARD)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {levelResults.map((lr) => (
            <div
              key={lr.level}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                lr.completedBeforeTimeout
                  ? 'bg-slate-900/80 border-slate-700/80 shadow-sm'
                  : 'bg-amber-950/30 border-amber-500/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">
                    PHASE {lr.level}
                  </span>
                  {lr.completedBeforeTimeout ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="text-[11px] font-bold text-slate-100 truncate font-sans">
                  {lr.label.split(':')[1] || lr.label}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] flex items-center justify-between text-slate-400">
                <span className="text-emerald-400 font-bold">+{lr.score} XP</span>
                <span>{lr.timeTakenSec}s / {lr.timeBudgetSec}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sparkline Visualizer + Portal Specific Graphic Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        
        {/* Left: Interactive Trendline Sparkline */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 font-bold uppercase">
              {correlation.trend === 'improving' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : correlation.trend === 'declining' ? (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              ) : (
                <Activity className="w-4 h-4 text-cyan-400" />
              )}
              <span>PERFORMANCE TRAJECTORY ({correlation.trend.toUpperCase()})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">LEVELS 1 ➔ 5</span>
          </div>

          <div className="relative w-full h-28 my-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={themeColor} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={themeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Subtle Grid Guidelines */}
              <line x1="20" y1="30" x2="380" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="20" y1="65" x2="380" y2="65" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Area Gradient Fill */}
              <path d={areaPathStr} fill="url(#sparklineGrad)" />

              {/* Sparkline Line */}
              <polyline
                fill="none"
                stroke={themeColor}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />

              {/* Data Nodes */}
              {sparklineCoords.map((c, i) => (
                <g key={i}>
                  <circle cx={c.x} cy={c.y} r="4.5" fill="#020617" stroke={themeColor} strokeWidth="2" />
                  <text x={c.x} y={c.y - 8} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    L{i + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <p className="text-[11px] font-mono text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2 mt-1">
            {correlation.trendLabel}
          </p>
        </div>

        {/* Right: Standout Level & Portal-Specific Synthesis */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between space-y-3">
          {/* Standout Callout */}
          {correlation.standoutLevel && (
            <div>
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>STANDOUT OPERATIONAL PHASE</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                {correlation.standoutLevel.label}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {correlation.standoutLevel.reason}
              </p>
            </div>
          )}

          {/* Portal-Specific Visual Artifact Summary */}
          {correlation.portalSpecificGraphic && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1.5">
              <div className="text-[10px] text-cyan-300 font-bold uppercase flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>{correlation.portalSpecificGraphic.summary}</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed">
                {experienceId === 'detective' && 'Cross-referenced red yarn evidence nodes established incontrovertible physical presence.'}
                {experienceId === 'last-signal' && 'Multi-chapter decision weights forged an immutable harmonic diplomatic beacon.'}
                {experienceId === 'ai-defense' && 'Sub-400ms defensive reaction clusters successfully suppressed all zero-day quantum trojans.'}
                {experienceId === 'smart-city' && 'Sequential sector navigation logged optimal net-zero civic power efficiency.'}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
