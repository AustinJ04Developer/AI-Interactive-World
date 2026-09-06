import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Download, 
  Clock, 
  Award, 
  TrendingUp, 
  Filter, 
  ArrowUpDown, 
  ChevronRight, 
  X, 
  Eye, 
  AlertTriangle,
  CheckCircle2,
  Home,
  BarChart3
} from 'lucide-react';
import { apiService, resolveAssetUrl } from '../services/apiService';
import { soundFX } from '../services/audioService';
import { LevelCorrelationPanel } from '../components/hud/LevelCorrelationPanel';
import { computeCorrelation, synthesizeDefaultLevelResults } from '../services/correlationEngine';
import type { LevelResult } from '../types';

interface AdminDashboardProps {
  onReturnToExhibit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onReturnToExhibit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [portalFilter, setPortalFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');

  // Drilldown Inspector
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false);

  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    const [statsRes, lbRes] = await Promise.all([
      apiService.fetchAdminStats(),
      apiService.fetchAdminLeaderboard({
        portal: portalFilter !== 'all' ? portalFilter : undefined,
        sortBy,
        order
      })
    ]);

    if (statsRes?.success) setStats(statsRes.stats);
    if (lbRes?.success) setSessions(lbRes.sessions);
    setRefreshing(false);
    setLoading(false);
  }, [portalFilter, sortBy, order]);

  // Handle PIN verification
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    const res = await apiService.verifyAdminPin(pinInput);
    if (res?.success) {
      soundFX.playSuccess();
      setIsAuthenticated(true);
      setPinError(null);
    } else {
      soundFX.playAlert();
      setPinError(res?.error || 'Invalid Staff PIN. Please re-enter.');
    }
  };

  // Poll dashboard data every 15s once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadDashboardData]);

  const handleOpenDrilldown = (session: any) => {
    soundFX.playClick();
    setSelectedSession(session);
    setInspectModalOpen(true);
  };

  // Staff PIN Authentication Modal
  if (!isAuthenticated) {
    return (
      <div className="w-screen h-screen bg-[#020408] text-slate-100 flex items-center justify-center p-4 font-display select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.25)]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1">
            STAFF CONSOLE // INTERNAL TELEMETRY
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Admin Access Portal
          </h2>
          <p className="text-xs font-mono text-slate-400 mb-6 leading-relaxed">
            Please enter your exhibition staff credentials to access the cross-session leaderboard and pacing analytics.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Staff PIN (e.g. 2026)"
                className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white outline-none shadow-inner transition-colors"
                autoFocus
              />
            </div>

            {pinError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-xs font-mono text-rose-300">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-98 font-bold text-black font-mono text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,242,254,0.3)] transition-all"
            >
              AUTHENTICATE STAFF
            </button>
          </form>

          <button
            onClick={onReturnToExhibit}
            className="mt-6 text-xs font-mono text-slate-500 hover:text-slate-300 flex items-center justify-center space-x-1.5 mx-auto transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Visitor Kiosk</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-y-auto bg-[#04060c] text-slate-100 font-display select-none p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>SCIENCE EXHIBITION 2026 • ORGANIZER CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Cross-Session Leaderboard & Pacing Telemetry
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-mono flex items-center space-x-1.5 transition-all"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'SYNCING...' : 'LIVE REFRESH'}</span>
            </button>

            <a
              href={apiService.getAdminExportUrl()}
              download
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </a>

            <button
              onClick={onReturnToExhibit}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>VISITOR MODE</span>
            </button>
          </div>
        </div>

        {/* Aggregate Pacing Telemetry Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">TOTAL SESSIONS LOGGED</div>
              <div className="text-3xl font-black text-white my-2">{stats.totalSessionsToday}</div>
              <div className="text-[10px] font-mono text-cyan-400 flex items-center space-x-1">
                <span>Active exhibition day</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">AVG PACING VS 300S TARGET</div>
              <div className="text-3xl font-black text-amber-400 my-2">{stats.avgCompletionTimeSec}s</div>
              <div className="text-[10px] font-mono text-slate-400">
                Delta: <span className={stats.pacingDeltaSec <= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {stats.pacingDeltaSec > 0 ? `+${stats.pacingDeltaSec}s` : `${stats.pacingDeltaSec}s`}
                </span> vs 5-min standard
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">MOST POPULAR PORTAL</div>
              <div className="text-xl font-black text-cyan-400 my-2 uppercase truncate">{stats.popularPortal}</div>
              <div className="text-[10px] font-mono text-slate-400">
                Highest visitor throughput
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">AVERAGE SESSION SCORE</div>
              <div className="text-3xl font-black text-emerald-400 my-2">872 XP</div>
              <div className="text-[10px] font-mono text-slate-400">
                Optimal difficulty calibration
              </div>
            </div>
          </div>
        )}

        {/* Filter & Sorting Controls */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-mono text-slate-400 font-bold flex items-center space-x-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>PORTAL FILTER:</span>
            </div>
            {['all', 'detective', 'smart-city', 'ai-defense', 'last-signal'].map(p => (
              <button
                key={p}
                onClick={() => setPortalFilter(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  portalFilter === p
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p === 'all' ? 'ALL PORTALS' : p.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="flex items-center space-x-1 text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>SORT BY:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 outline-none cursor-pointer"
            >
              <option value="score">Total Score</option>
              <option value="durationSec">Completion Time</option>
              <option value="createdAt">Date / Time</option>
            </select>
            <button
              onClick={() => setOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-bold"
            >
              {order === 'desc' ? '▼ DESC' : '▲ ASC'}
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">RANK</th>
                  <th className="py-3.5 px-4">VISITOR / CADET</th>
                  <th className="py-3.5 px-4">PORTAL</th>
                  <th className="py-3.5 px-4">TOTAL SCORE</th>
                  <th className="py-3.5 px-4">PACING (300S)</th>
                  <th className="py-3.5 px-4">COMPOSITE ARCHETYPE</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.map((sess, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <tr key={sess.resultId || sess.sessionId} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4 font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] ${
                          idx === 0 ? 'bg-amber-400 text-black font-black' :
                          idx === 1 ? 'bg-slate-300 text-black font-black' :
                          idx === 2 ? 'bg-amber-700 text-white font-black' : 'text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-sans text-sm">{sess.visitorName || 'Cadet Alex'}</div>
                        <div className="text-[10px] text-slate-500">{sess.sessionId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-cyan-300 uppercase">
                          {sess.portal || 'detective'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 font-black text-sm">{sess.score} XP</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300">{sess.durationSec || 280}s</span>
                        <span className="text-slate-500 text-[10px] ml-1">/ 300s</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 truncate max-w-xs">
                        {sess.compositeArchetype || 'Synthesizer Profile'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDrilldown(sess)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-black font-bold text-[11px] transition-all"
                        >
                          DRILL DOWN ➔
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Session Detail Drilldown Modal */}
      {inspectModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none font-display">
          <div className="relative max-w-4xl w-full bg-slate-950 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  SESSION ARCHIVE DRILLDOWN // {selectedSession.sessionId}
                </div>
                <h2 className="text-xl font-black text-white mt-0.5">
                  {selectedSession.visitorName || 'Cadet Alex'} — {selectedSession.portal?.toUpperCase()}
                </h2>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reuse Tier 3A LevelCorrelationPanel */}
            {(() => {
              const portalExp = selectedSession.portal || 'detective';
              const correlation = selectedSession.correlation || computeCorrelation(portalExp, selectedSession.levelResults, selectedSession.score);
              const levelResults = (selectedSession.levelResults && selectedSession.levelResults.length === 5)
                ? selectedSession.levelResults
                : synthesizeDefaultLevelResults(portalExp, selectedSession.score);

              return (
                <LevelCorrelationPanel
                  levelResults={levelResults}
                  correlation={correlation}
                  experienceId={portalExp}
                  themeColor="#00f2fe"
                />
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs font-bold"
              >
                CLOSE DRILLDOWN
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
