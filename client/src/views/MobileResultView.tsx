import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Share2, 
  CheckCircle2, 
  Award, 
  ArrowLeft,
  Calendar,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { apiService, resolveAssetUrl } from '../services/apiService';
import { soundFX } from '../services/audioService';

interface MobileResultViewProps {
  token: string;
  onReturnToHome: () => void;
}

export const MobileResultView: React.FC<MobileResultViewProps> = ({ token, onReturnToHome }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    soundFX.playSuccess();
    apiService.fetchMobileResult(token)
      .then((data) => {
        if (data.success && data.result) {
          setResultData(data.result);
        } else {
          setError('Souvenir record not found or expired.');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load souvenir result.');
        setLoading(false);
      });
  }, [token]);

  const handleShare = async () => {
    soundFX.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AI Interactive World Souvenir',
          text: `I scored ${resultData?.score || 500} XP in AI Interactive World! Check out my official souvenir:`,
          url: window.location.href
        });
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    soundFX.playClick();
    if (!resultData?.snapshotUrl) return;
    const link = document.createElement('a');
    link.download = `AI-World-Souvenir-${token.slice(0, 6)}.png`;
    link.href = resolveAssetUrl(resultData.snapshotUrl);
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] text-white flex flex-col items-center justify-center p-6 text-center font-display space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <div className="text-cyan-400 font-bold text-sm tracking-wider">
          FETCHING YOUR EXPEDITION RECORD...
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-[#020408] text-white flex flex-col items-center justify-center p-6 text-center font-display space-y-4">
        <div className="p-4 rounded-full bg-red-950/60 border border-red-500 text-red-400">
          ✕
        </div>
        <h2 className="text-xl font-bold">EXPERIENCE NOT FOUND</h2>
        <p className="text-xs text-slate-400 max-w-xs font-sans">
          {error || 'This QR token may have expired or was typed incorrectly.'}
        </p>
        <button
          onClick={onReturnToHome}
          className="cyber-btn text-xs py-2 px-6"
        >
          GO TO HOME
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060b18] via-[#020408] to-black text-white p-4 sm:p-8 font-sans flex flex-col items-center justify-start pb-16">
      <div className="scanlines fixed inset-0 pointer-events-none opacity-30" />

      {/* Top Banner */}
      <div className="w-full max-w-md flex items-center justify-between py-3 border-b border-slate-800 font-display">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs tracking-widest text-cyan-400 font-bold">
            AI INTERACTIVE WORLD
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
          OFFICIAL VERIFIED
        </span>
      </div>

      {/* Header Celebration */}
      <div className="text-center my-4 space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-950/60 to-violet-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>YOUR SCIENCE EXPO SOUVENIR</span>
        </div>
        <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider mt-2">
          MISSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">ACCOMPLISHED!</span>
        </h1>
        <p className="text-xs text-slate-400">
          Experience: <span className="text-white font-bold">{resultData.portal?.toUpperCase()}</span>
        </p>
      </div>

      {/* Poster Display Card */}
      <div className="w-full max-w-md rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(0,242,254,0.3)] bg-slate-950 relative my-2">
        {resultData.snapshotUrl ? (
          <img
            src={resolveAssetUrl(resultData.snapshotUrl)}
            alt="Personalized Poster"
            className="w-full h-auto object-cover"
          />
        ) : (
          <div className="aspect-[4/5] bg-gradient-to-b from-slate-900 to-black flex flex-col items-center justify-center p-6 text-center space-y-3 font-display">
            <Award className="w-16 h-16 text-cyan-400" />
            <div className="text-lg font-bold text-white uppercase">
              {resultData.portal} EXPLORER
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {resultData.score} XP
            </div>
          </div>
        )}

        {/* Score Stamp Badge */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 backdrop-blur-md flex items-center justify-between font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-400">SCORE RECORDED</div>
            <div className="text-base font-bold text-cyan-400">{resultData.score} PTS</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">XP EARNED</div>
            <div className="text-base font-bold text-emerald-400">+{resultData.xpEarned || 500} XP</div>
          </div>
        </div>
      </div>

      {/* Badges Earned */}
      {resultData.achievements && resultData.achievements.length > 0 && (
        <div className="w-full max-w-md my-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            ACHIEVEMENT BADGES UNLOCKED
          </div>
          <div className="flex flex-wrap gap-1.5">
            {resultData.achievements.map((ach: string, i: number) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full bg-violet-950/60 border border-violet-500/40 text-violet-200 text-xs font-mono font-bold"
              >
                ★ {ach}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Intelligence Commendation */}
      {resultData.aiSummary && (
        <div className="w-full max-w-md my-2 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-sans text-slate-200 leading-relaxed">
          <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1">
            ◈ NOVA AI COMMENDATION:
          </div>
          "{resultData.aiSummary}"
        </div>
      )}

      {/* Action Buttons: DOWNLOAD & SHARE */}
      <div className="w-full max-w-md space-y-2.5 mt-4">
        {resultData.snapshotUrl && (
          <button
            onClick={handleDownloadImage}
            className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-transform active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD HIGH-RES SOUVENIR</span>
          </button>
        )}

        <button
          onClick={handleShare}
          className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-violet-400 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
        >
          <Share2 className="w-4 h-4 text-violet-400" />
          <span>{copied ? 'LINK COPIED TO CLIPBOARD!' : 'SHARE WITH FRIENDS'}</span>
        </button>
      </div>

      {/* Footer info */}
      <div className="w-full max-w-md text-center text-[10px] font-mono text-slate-500 mt-8 space-y-1">
        <div>SCIENCE EXPOSITION 2026 • AI INTERACTIVE WORLD</div>
        <div>TOKEN: {token.slice(0, 12)}... (VALID FOR 7 DAYS)</div>
      </div>
    </div>
  );
};
