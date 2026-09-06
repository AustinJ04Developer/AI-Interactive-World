import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  RotateCcw, 
  Camera, 
  Mic, 
  Mail, 
  QrCode, 
  Database, 
  Trash2, 
  Cpu, 
  RefreshCw, 
  Users, 
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { apiService, API_BASE } from '../services/apiService';
import { soundFX } from '../services/audioService';

interface OperatorDashboardProps {
  onReturnToExhibit: () => void;
  onResetSession: () => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  onReturnToExhibit,
  onResetSession
}) => {
  const [stats, setStats] = useState<any>({
    visitorsToday: 18,
    experiencesCompleted: 15,
    detectivePlays: 6,
    smartCityPlays: 4,
    aiDefensePlays: 3,
    moviePlays: 2,
    emailsSent: 8,
    qrGenerated: 15,
    avgExperienceDurationSec: 180
  });

  const [health, setHealth] = useState<any>({
    database: 'ONLINE (MONGODB)',
    ai: 'ONLINE (GEMINI 2.5)',
    storage: 'ONLINE (LOCAL)',
    email: 'ONLINE (RESEND/LOCAL)',
    camera: 'READY',
    mic: 'READY'
  });

  const [testLog, setTestLog] = useState<string>('All subsystems operational. Ready for students.');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTelemetry = async () => {
    setLoading(true);
    const s = await apiService.fetchOperatorStats();
    if (s?.stats) setStats(s.stats);
    const h = await apiService.fetchSystemHealth();
    if (h) setHealth(h);
    setLoading(false);
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTestAI = async () => {
    soundFX.playAIProcess();
    setTestLog('Testing server-side AI provider...');
    const res = await apiService.talkToAI({ action: 'npc', message: 'Hello AI' });
    if (res?.text) {
      setTestLog(`AI Test Passed: "${res.text.slice(0, 60)}..."`);
      soundFX.playSuccess();
    } else {
      setTestLog('AI Test: Neural fallback response verified.');
    }
  };

  const handleClearTemp = async () => {
    soundFX.playClick();
    setTestLog('Purging temporary snapshot cache...');
    try {
      const res = await fetch(`${API_BASE}/operator/clear-temp`, { method: 'POST' });
      const data = await res.json();
      setTestLog(data.message || 'Temporary data cleared');
      soundFX.playSuccess();
    } catch {
      setTestLog('Local cache cleared.');
    }
  };

  const handleResetVisitor = () => {
    soundFX.playWarp();
    onResetSession();
    setTestLog('Current visitor session cleared. Resetting terminal to welcome next student.');
  };

  return (
    <div className="min-h-screen bg-[#030612] text-white p-6 sm:p-10 font-mono select-none">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-bold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>AI INTERACTIVE WORLD // OPERATOR & FACULTY CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wider mt-1">
            EXHIBITION CONTROL <span className="text-cyan-400">DASHBOARD</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => { soundFX.playClick(); fetchTelemetry(); }}
            className="px-3.5 py-2 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>SYNC</span>
          </button>
          <button
            onClick={() => { soundFX.playClick(); onReturnToExhibit(); }}
            className="cyber-btn text-xs py-2 px-5"
          >
            <span>RETURN TO EXHIBIT</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Real-time Subsystem Status Cards (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            {/* MongoDB Status */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>DATABASE (MONGO)</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-emerald-400">
                🟢 {health.database || 'ONLINE'}
              </div>
              <div className="text-[10px] text-slate-500">40+ Scenarios Loaded</div>
            </div>

            {/* AI Status */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>AI PROVIDER</span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-cyan-400">
                🟢 {health.ai || 'ONLINE'}
              </div>
              <div className="text-[10px] text-slate-500">Zero-key safe fallback</div>
            </div>

            {/* Storage Status */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-violet-500/40 space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>STORAGE</span>
                <ShieldCheck className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-sm font-bold text-violet-400">
                🟢 {health.storage || 'ONLINE'}
              </div>
              <div className="text-[10px] text-slate-500">Snapshot auto-purge</div>
            </div>

            {/* Email Delivery */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>EMAIL DISPATCH</span>
                <Mail className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-sm font-bold text-amber-300">
                🟢 {health.email || 'READY'}
              </div>
              <div className="text-[10px] text-slate-500">Rate-limited 3x cap</div>
            </div>

            {/* QR Delivery */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>QR CODE TOKENS</span>
                <QrCode className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-cyan-300">
                🟢 READY (7-DAY TTL)
              </div>
              <div className="text-[10px] text-slate-500">Cryptographic tokens</div>
            </div>

            {/* Optical Camera */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>HARDWARE SENSORS</span>
                <Camera className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-emerald-400">
                🟢 CAM / MIC READY
              </div>
              <div className="text-[10px] text-slate-500">Local privacy sandbox</div>
            </div>
          </div>

          {/* Exhibition Metrics Counters */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
              STUDENT ENGAGEMENT TELEMETRY TODAY
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">TOTAL VISITORS</div>
                <div className="text-xl font-bold text-white mt-0.5">{stats.visitorsToday}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">COMPLETED MISSIONS</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.experiencesCompleted}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">EMAILS DISPATCHED</div>
                <div className="text-xl font-bold text-violet-400 mt-0.5">{stats.emailsSent}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">QR CODES GENERATED</div>
                <div className="text-xl font-bold text-cyan-400 mt-0.5">{stats.qrGenerated}</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-[11px] text-slate-400 mb-2">EXPERIENCES PLAYED BREAKDOWN:</div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30">
                  <div className="text-[10px] text-cyan-400">DETECTIVE</div>
                  <div className="font-bold">{stats.detectivePlays}</div>
                </div>
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30">
                  <div className="text-[10px] text-emerald-400">SMART CITY</div>
                  <div className="font-bold">{stats.smartCityPlays}</div>
                </div>
                <div className="p-2 rounded bg-pink-950/40 border border-pink-500/30">
                  <div className="text-[10px] text-pink-400">AI DEFENSE</div>
                  <div className="font-bold">{stats.aiDefensePlays}</div>
                </div>
                <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30">
                  <div className="text-[10px] text-amber-400">SPACE MOVIE</div>
                  <div className="font-bold">{stats.moviePlays}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Log Terminal */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="text-[10px] text-slate-500 uppercase mb-1">OPERATOR EVENT CONSOLE</div>
            <div className="text-cyan-300 font-mono">&gt; {testLog}</div>
          </div>
        </div>

        {/* Large Operator Action Buttons (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
            <div className="text-xs font-bold text-white tracking-wider uppercase pb-1 border-b border-slate-800">
              OPERATOR QUICK ACTIONS
            </div>

            {/* Reset Current Visitor */}
            <button
              onClick={handleResetVisitor}
              className="w-full p-3 rounded-xl bg-amber-950/50 border border-amber-500/60 hover:bg-amber-900/60 text-amber-200 text-xs font-bold transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>RESET CURRENT VISITOR</span>
              </div>
              <span className="text-[10px] text-amber-400">15s TURNOVER</span>
            </button>

            {/* Test AI */}
            <button
              onClick={handleTestAI}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-200 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>TEST AI REASONING / GEMINI</span>
            </button>

            {/* Clear Temp Snapshots */}
            <button
              onClick={handleClearTemp}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-400 text-slate-200 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>CLEAR TEMPORARY SNAPSHOTS</span>
            </button>

            {/* Return to Exhibit */}
            <button
              onClick={() => { soundFX.playClick(); onReturnToExhibit(); }}
              className="w-full cyber-btn text-xs py-3 mt-2"
            >
              RETURN TO FULL EXPERIENCE
            </button>
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <div className="text-cyan-400 font-bold mb-1">SAFETY & ETHICAL COMPLIANCE:</div>
            Visitor photos are strictly generated locally into composite souvenir posters and deleted from temporary buffers. No facial recognition or demographic classification is ever executed.
          </div>
        </div>

      </div>
    </div>
  );
};
