import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  Share2, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Smartphone, 
  Eye, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  CreditCard, 
  Printer, 
  RotateCw, 
  Activity, 
  Mail, 
  Send, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiService, resolveAssetUrl } from '../services/apiService';
import { soundFX } from '../services/audioService';
import { LevelCorrelationPanel } from '../components/hud/LevelCorrelationPanel';
import { OperativeCard3D } from '../components/souvenir/OperativeCard3D';
import { computeCorrelation, synthesizeDefaultLevelResults } from '../services/correlationEngine';
import { 
  generateSouvenirPoster, 
  generateCardFrontCanvas, 
  generateCardBackCanvas, 
  generateDualCardPrintCanvas 
} from '../services/souvenirService';
import type { SouvenirData, ExperienceId } from '../types';

interface MobileResultViewProps {
  token: string;
  onReturnToHome: () => void;
}

export const MobileResultView: React.FC<MobileResultViewProps> = ({ token, onReturnToHome }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Generated High-Res Media Assets
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [cardFrontUrl, setCardFrontUrl] = useState<string | null>(null);
  const [cardBackUrl, setCardBackUrl] = useState<string | null>(null);
  const [dualPrintUrl, setDualPrintUrl] = useState<string | null>(null);

  const [isGeneratingMedia, setIsGeneratingMedia] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Download & Modal states
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [photoModalImage, setPhotoModalImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Direct Email Delivery states
  const [emailInput, setEmailInput] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Collapsible Poster Toggle
  const [showPosterSection, setShowPosterSection] = useState<boolean>(false);

  // Guarantee responsive scrolling on mobile devices
  useEffect(() => {
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.height = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
    document.body.style.height = 'auto';
    document.body.style.touchAction = 'pan-y';

    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.height = 'auto';
      rootEl.style.minHeight = '100%';
      rootEl.style.overflowY = 'visible';
      rootEl.style.overflowX = 'hidden';
    }

    return () => {
      document.documentElement.style.overflowY = '';
      document.documentElement.style.overflowX = '';
      document.documentElement.style.height = '';
      document.body.style.overflowY = '';
      document.body.style.overflowX = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
      if (rootEl) {
        rootEl.style.height = '';
        rootEl.style.minHeight = '';
        rootEl.style.overflowY = '';
        rootEl.style.overflowX = '';
      }
    };
  }, []);

  // Fetch record on mount
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

  // Helper to convert base64 dataUrl to Blob
  const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mime });
  };

  // Synthesize and cache all high-res canvases
  const prepareAllMedia = useCallback(async (data: any) => {
    if (posterUrl && cardFrontUrl && cardBackUrl && dualPrintUrl) {
      return { posterUrl, cardFrontUrl, cardBackUrl, dualPrintUrl };
    }

    setIsGeneratingMedia(true);
    setMediaError(null);

    try {
      const portalExpId: ExperienceId = (data.portal || data.experienceId || 'detective') as ExperienceId;
      const resolvedLevels = (data.levelResults && data.levelResults.length === 5)
        ? data.levelResults
        : synthesizeDefaultLevelResults(portalExpId, data.score || 850);

      const souvenirPayload: SouvenirData = {
        experienceId: portalExpId,
        experienceTitle: `${portalExpId.toUpperCase()} EXPEDITION`,
        experienceSubtitle: 'OFFICIAL OPERATIVE DOSSIER',
        visitorName: data.visitorName || 'Cadet Alex',
        visitorPhotoUrl: data.visitorPhotoUrl || '',
        score: data.score || 850,
        achievements: data.achievements || ['Expedition Completed', 'Quantum Pioneer'],
        metrics: [
          { label: 'SCORE RECORDED', value: `${data.score || 850} PTS` },
          { label: 'XP EARNED', value: `+${data.xpEarned || 500} XP` },
          { label: 'LEVELS CLEARED', value: '5 / 5 PHASES' },
          { label: 'STATUS', value: 'VERIFIED' }
        ],
        aiAnalysis: data.aiSummary || 'Outstanding cognitive and strategic execution recorded.',
        dateStr: new Date(data.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        sessionId: data.sessionId || `SES-${token.slice(0, 6)}`,
        badge: data.badge || (data.score >= 850 ? 'COMMANDER RANK' : data.score >= 600 ? 'SPECIALIST RANK' : 'OPERATIVE CADET'),
        themeColor: portalExpId === 'ai-defense' ? '#ff007f' : portalExpId === 'smart-city' ? '#00ff88' : portalExpId === 'last-signal' ? '#ffaa00' : '#00f2fe',
        levelResults: resolvedLevels
      };

      const qrTarget = data.qrDataUrl || data.resultWebUrl || window.location.href;

      const [posterDataUrl, frontDataUrl, backDataUrl, dualDataUrl] = await Promise.all([
        data.snapshotUrl ? Promise.resolve(resolveAssetUrl(data.snapshotUrl)) : generateSouvenirPoster(souvenirPayload, qrTarget),
        generateCardFrontCanvas(souvenirPayload, qrTarget),
        generateCardBackCanvas(souvenirPayload),
        generateDualCardPrintCanvas(souvenirPayload, qrTarget)
      ]);

      setPosterUrl(posterDataUrl);
      setCardFrontUrl(frontDataUrl);
      setCardBackUrl(backDataUrl);
      setDualPrintUrl(dualDataUrl);

      setIsGeneratingMedia(false);
      return { posterUrl: posterDataUrl, cardFrontUrl: frontDataUrl, cardBackUrl: backDataUrl, dualPrintUrl: dualDataUrl };
    } catch (err: any) {
      console.error('Failed to prepare souvenir media:', err);
      setMediaError('Unable to synthesize high-res cards.');
      setIsGeneratingMedia(false);
      throw err;
    }
  }, [posterUrl, cardFrontUrl, cardBackUrl, dualPrintUrl, token]);

  // Preload media on data arrival
  useEffect(() => {
    if (resultData) {
      prepareAllMedia(resultData).catch(() => {});
    }
  }, [resultData, prepareAllMedia]);

  // Download Trigger
  const triggerDownload = (dataUrl: string, fileName: string, label: string) => {
    soundFX.playClick();
    setIsDownloading(true);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setPhotoModalImage(dataUrl);
      setIsPhotoModalOpen(true);
      setIsDownloading(false);
      return;
    }

    try {
      const blob = dataUrlToBlob(dataUrl);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        setDownloadSuccess(label);
        setIsDownloading(false);
        setTimeout(() => setDownloadSuccess(null), 3000);
      }, 500);
    } catch (err) {
      console.error('Download error:', err);
      setMediaError('Download failed. Use the Photo Save option instead.');
      setIsDownloading(false);
    }
  };

  const handlePrintBadge = () => {
    soundFX.playClick();
    window.print();
  };

  const handleDownloadPrintSheet = () => {
    if (!dualPrintUrl) return;
    triggerDownload(dualPrintUrl, `AI-World-Operative-Badge-${token.slice(0, 6)}.png`, 'Badge');
  };

  const handleDownloadPoster = () => {
    if (!posterUrl) return;
    triggerDownload(posterUrl, `AI-World-Poster-${token.slice(0, 6)}.png`, 'Poster');
  };

  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  // Direct Email Dispatch
  const handleSendEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    soundFX.playClick();
    setIsSendingEmail(true);
    setEmailError(null);

    try {
      const portalExpId: ExperienceId = (resultData.portal || resultData.experienceId || 'detective') as ExperienceId;
      const res = await apiService.sendEmail({
        resultId: resultData.resultId || resultData.sessionId || token,
        recipientEmail: emailInput.trim(),
        experienceTitle: `${portalExpId.toUpperCase()} EXPEDITION`,
        visitorName: resultData.visitorName,
        score: resultData.score || 850,
        xpEarned: resultData.xpEarned || 500,
        achievements: resultData.achievements || ['Mission Cleared'],
        badges: [
          { name: resultData.badge || 'MASTER OPERATIVE', tier: 'Diamond', description: 'Primary badge awarded for operational completion.' },
          ...(resultData.achievements || []).map((ach: string) => ({
            name: ach,
            tier: 'Gold',
            description: 'Mission achievement unlocked at Science Exhibition 2026.'
          }))
        ],
        cardFrontUrl: cardFrontUrl || undefined,
        cardBackUrl: cardBackUrl || undefined,
        badgePrintUrl: dualPrintUrl || cardFrontUrl || undefined,
        posterUrl: posterUrl || undefined,
        token: token
      });
      if (res.success) {
        setEmailSuccess(true);
        soundFX.playSuccess();
        setTimeout(() => setEmailSuccess(false), 5000);
      } else {
        setEmailError(res.message || 'Failed to dispatch email.');
      }
      setIsSendingEmail(false);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to dispatch email.');
      setIsSendingEmail(false);
    }
  };

  // Native Share Handler
  const handleShare = async () => {
    if (!resultData) return;
    soundFX.playClick();
    setIsSharing(true);

    try {
      const shareUrl = window.location.href;
      if (dualPrintUrl || posterUrl) {
        const sourceUrl = dualPrintUrl || posterUrl!;
        const blob = dataUrlToBlob(sourceUrl);
        const fileName = `AI-World-Card-${token.slice(0, 6)}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Science Exhibition 2026 Operative Pass',
            text: `I completed the ${resultData.portal?.toUpperCase()} expedition at AI Interactive World with ${resultData.score} XP! Check out my official operative pass & badges:`,
            files: [file]
          });
          setIsSharing(false);
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: 'My Science Exhibition 2026 Operative Pass',
          text: `I scored ${resultData?.score || 500} XP in AI Interactive World! Check out my official operative pass & badges:`,
          url: shareUrl
        });
        setIsSharing(false);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      setIsSharing(false);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // ignore
        }
      }
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] text-white flex flex-col items-center justify-center p-4 text-center font-display space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <div className="text-cyan-400 font-bold text-sm tracking-wider">
          AUTHENTICATING OPERATIVE CREDENTIALS...
        </div>
        <p className="text-xs text-slate-400 font-mono">Verifying cryptographic token #{token.slice(0, 8)}</p>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-[#020408] text-white flex flex-col items-center justify-center p-6 text-center font-display space-y-4">
        <div className="p-4 rounded-full bg-red-950/60 border border-red-500 text-red-400">
          ✕
        </div>
        <h2 className="text-xl font-bold">RECORD NOT FOUND</h2>
        <p className="text-xs text-slate-400 max-w-xs font-sans leading-relaxed">
          {error || 'This QR token may have expired or was typed incorrectly.'}
        </p>
        <button
          onClick={onReturnToHome}
          className="cyber-btn text-xs py-2.5 px-6 mt-2"
        >
          GO TO HOME
        </button>
      </div>
    );
  }

  const portalExpId: ExperienceId = (resultData.portal || resultData.experienceId || 'detective') as ExperienceId;
  const resolvedCorrelation = resultData.correlation || computeCorrelation(portalExpId, resultData.levelResults, resultData.score);
  const resolvedLevels = (resultData.levelResults && resultData.levelResults.length === 5)
    ? resultData.levelResults
    : synthesizeDefaultLevelResults(portalExpId, resultData.score);

  const souvenirPayload: SouvenirData = {
    experienceId: portalExpId,
    experienceTitle: `${portalExpId.toUpperCase()} EXPEDITION`,
    experienceSubtitle: 'OFFICIAL OPERATIVE DOSSIER',
    visitorName: resultData.visitorName || 'Cadet Alex',
    visitorPhotoUrl: resultData.visitorPhotoUrl || '',
    score: resultData.score || 850,
    achievements: resultData.achievements || ['Expedition Completed', 'Quantum Pioneer'],
    metrics: [
      { label: 'SCORE RECORDED', value: `${resultData.score || 850} PTS` },
      { label: 'XP EARNED', value: `+${resultData.xpEarned || 500} XP` },
      { label: 'LEVELS CLEARED', value: '5 / 5 PHASES' },
      { label: 'STATUS', value: 'VERIFIED' }
    ],
    aiAnalysis: resultData.aiSummary || 'Outstanding cognitive and strategic execution recorded.',
    dateStr: new Date(resultData.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    sessionId: resultData.sessionId || `SES-${token.slice(0, 6)}`,
    badge: resultData.badge || (resultData.score >= 850 ? 'COMMANDER RANK' : resultData.score >= 600 ? 'SPECIALIST RANK' : 'OPERATIVE CADET'),
    themeColor: portalExpId === 'ai-defense' ? '#ff007f' : portalExpId === 'smart-city' ? '#00ff88' : portalExpId === 'last-signal' ? '#ffaa00' : '#00f2fe',
    levelResults: resolvedLevels
  };

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-b from-[#060b18] via-[#020408] to-black text-white px-3 sm:px-6 py-4 font-sans flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden pb-36 select-text"
      style={{
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        overscrollBehaviorY: 'contain'
      }}
    >
      <div className="scanlines fixed inset-0 pointer-events-none opacity-20" />

      {/* Main Responsive Container */}
      <div className="w-full max-w-lg mx-auto flex flex-col space-y-4 relative z-10 box-border">

        {/* Top Header Bar */}
        <header className="w-full flex items-center justify-between py-2 border-b border-slate-800/80 font-display">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs tracking-widest text-cyan-400 font-bold truncate">
              AI INTERACTIVE WORLD
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/50 flex items-center space-x-1 shrink-0">
            <ShieldCheck className="w-3 h-3" />
            <span>AUTHENTICATED 2026</span>
          </span>
        </header>

        {/* Operative Identity & Rank Callout */}
        <div className="text-center pt-1 space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-950/60 to-violet-950/60 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>OFFICIAL SCIENCE EXPO OPERATIVE CREDENTIALS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wider mt-1">
            {resultData.visitorName || 'CADET ALEX'}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            PORTAL: <span className="text-cyan-400 font-bold uppercase">{portalExpId}</span> • RANK: <span className="text-amber-400 font-bold uppercase">{souvenirPayload.badge}</span>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* HERO: 3D INTERACTIVE OPERATIVE ACCESS PASS (FRONT & BACK ROTATION)        */}
        {/* ========================================================================= */}
        <div className="w-full flex flex-col items-center">
          <OperativeCard3D
            data={souvenirPayload}
            qrDataUrl={resultData.qrDataUrl || resultData.resultWebUrl}
            correlation={resolvedCorrelation}
          />
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED ACCESSING & DELIVERY DECK (PRINT, EXPORT, EMAIL, SAVE)             */}
        {/* ========================================================================= */}
        <div className="w-full p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black border border-cyan-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>ACCESS & EXPORT CREDENTIALS</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">
              300 DPI // HD
            </span>
          </div>

          {/* Single Primary Action: Print Badge */}
          <div className="w-full">
            <button
              onClick={handlePrintBadge}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-95"
            >
              <Printer className="w-5 h-5" />
              <span>PRINT BADGE (2-SIDED LANYARD FORMAT)</span>
            </button>
          </div>

          {/* Quick Lanyard Badge Print Sheet Save */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <span className="text-slate-300">Save badge image file instead?</span>
            <button
              onClick={handleDownloadPrintSheet}
              disabled={!dualPrintUrl || isDownloading}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Printable Badge (.PNG)</span>
            </button>
          </div>

          {/* Direct Email Delivery Option */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>SEND PASS & BADGES TO EMAIL</span>
              </span>
              <span className="text-[10px] text-slate-500">Includes 3D Card & Badges</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="operative@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 bg-black/80 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 outline-none transition-colors"
              />
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-display font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-95 transition-all shrink-0"
              >
                {isSendingEmail ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SENDING...</span>
                  </>
                ) : emailSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>SENT!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND</span>
                  </>
                )}
              </button>
            </div>

            {emailSuccess && (
              <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pass & all badges dispatched to your inbox! Check promotions/spam if needed.</span>
              </div>
            )}
            {emailError && (
              <div className="text-[11px] font-mono text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          {/* Quick Touch-and-Hold for iPhone Users */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <Smartphone className="w-3 h-3 text-cyan-400" />
              <span>iPhone user?</span>
            </span>
            <button
              onClick={() => {
                if (dualPrintUrl || cardFrontUrl) {
                  setPhotoModalImage(dualPrintUrl || cardFrontUrl);
                  setIsPhotoModalOpen(true);
                }
              }}
              className="text-cyan-400 underline hover:text-cyan-300 font-bold flex items-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>View & Touch-Hold to Save to Photos</span>
            </button>
          </div>
        </div>

        {/* Global Media Synthesis Error Banner */}
        {mediaError && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center justify-between text-xs text-red-300 font-mono">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{mediaError}</span>
            </div>
            <button
              onClick={() => prepareAllMedia(resultData)}
              className="px-2.5 py-1 rounded bg-red-900 text-white text-[10px] font-bold hover:bg-red-800"
            >
              RETRY
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5-PHASE MISSION TELEMETRY & BEHAVIORAL ARCHETYPE (NO TABS, SEAMLESS)       */}
        {/* ========================================================================= */}
        <div className="w-full space-y-3">
          <div className="flex items-center space-x-2 px-1">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-display font-black text-white uppercase tracking-wider">
              5-PHASE PERFORMANCE MATRIX & AI COMMENDATION
            </h2>
          </div>

          <LevelCorrelationPanel
            levelResults={resolvedLevels}
            correlation={resolvedCorrelation}
            experienceId={portalExpId}
            themeColor={souvenirPayload.themeColor}
          />

          {/* AI Commendation Box */}
          {resultData.aiSummary && (
            <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 to-slate-950/80 border border-cyan-500/30 text-xs font-sans text-slate-200 leading-relaxed">
              <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NOVA AI EXPEDITION EVALUATION:</span>
              </div>
              <p className="italic">"{resultData.aiSummary}"</p>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* COMMEMORATIVE SOUVENIR POSTER SHOWCASE (COLLAPSIBLE / EXPANDABLE)         */}
        {/* ========================================================================= */}
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden">
          <button
            onClick={() => setShowPosterSection(!showPosterSection)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-display font-black text-white uppercase tracking-wider">
                  COMMEMORATIVE HERO POSTER (1200×1500 HD)
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {showPosterSection ? 'Click to minimize preview' : 'Click to preview and download full exhibition poster'}
                </div>
              </div>
            </div>
            {showPosterSection ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showPosterSection && (
            <div className="p-4 border-t border-slate-800 space-y-3">
              <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-slate-900 to-black rounded-xl overflow-hidden border border-cyan-500/30 flex items-center justify-center">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt="Official Poster"
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => {
                      setPhotoModalImage(posterUrl);
                      setIsPhotoModalOpen(true);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <span className="text-xs font-mono text-slate-400">Synthesizing poster...</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownloadPoster}
                disabled={!posterUrl || isDownloading}
                className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD 1200×1500 POSTER (.PNG)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="w-full text-center text-[10px] font-mono text-slate-500 pt-4 space-y-1 border-t border-slate-800/80 mb-6">
          <div>SCIENCE EXPOSITION 2026 • AI INTERACTIVE WORLD</div>
          <div className="text-slate-400">TOKEN: {token.slice(0, 16)}... (OPERATIVE CREDENTIALS ACTIVE)</div>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* STICKY BOTTOM ACCESS DOCK (PRINT, SAVE, SHARE)                            */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-cyan-500/30 p-2.5 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto shadow-[0_-5px_25px_rgba(0,0,0,0.85)]">
        <button
          onClick={handlePrintBadge}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-transform"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>PRINT BADGE</span>
        </button>

        <button
          onClick={handleDownloadPrintSheet}
          disabled={!dualPrintUrl || isDownloading}
          className="py-2.5 px-3 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 active:scale-95 transition-transform"
          title="Save High-Res Badge"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{downloadSuccess ? `${downloadSuccess} SAVED!` : 'SAVE BADGE'}</span>
        </button>

        <button
          onClick={handleShare}
          className="py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 active:scale-95 transition-transform"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-violet-400" />
              <span>SHARE</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TOUCH-AND-HOLD PREVIEW MODAL (FOR IPHONE / MOBILE BROWSERS)                */}
      {/* ========================================================================= */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg mx-auto flex items-center justify-between pb-3 border-b border-slate-800 font-mono text-xs">
            <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4" />
              <span>SAVE TO PHOTOS GUIDE</span>
            </span>
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full max-w-lg mx-auto my-3 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-sans text-cyan-200 leading-relaxed flex items-start space-x-2.5">
            <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-display uppercase tracking-wider text-[11px] mb-0.5">
                Save directly to your camera roll:
              </strong>
              Press and hold (long-touch) the image below, then select <strong className="text-white">"Save to Photos"</strong> or <strong className="text-white">"Save Image"</strong>.
            </div>
          </div>

          <div className="w-full max-w-lg mx-auto flex-1 flex flex-col items-center justify-center my-2">
            {photoModalImage ? (
              <img
                src={photoModalImage}
                alt="Full Quality Preview"
                className="w-full max-w-md h-auto rounded-xl shadow-[0_0_30px_rgba(0,242,254,0.3)] border border-cyan-500/50"
              />
            ) : (
              <div className="text-slate-400 font-mono text-xs">Loading preview...</div>
            )}
          </div>

          <div className="w-full max-w-lg mx-auto pt-3 space-y-2">
            <button
              onClick={() => {
                if (photoModalImage) {
                  triggerDownload(photoModalImage, `AI-World-Souvenir-${token.slice(0, 6)}.png`, 'Image');
                  setIsPhotoModalOpen(false);
                }
              }}
              className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>DIRECT DOWNLOAD FILE</span>
            </button>
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs hover:text-white"
            >
              CLOSE PREVIEW
            </button>
          </div>
        </div>
      )}

      {/* Hidden container dedicated to physical print dialog (2-Sided Lanyard Badge format) */}
      <div id="printable-mobile-card" className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999]">
        {dualPrintUrl && (
          <img 
            src={dualPrintUrl} 
            alt="Printable Dual-Sided Operative Badge Sheet" 
            className="w-full h-auto object-contain max-h-screen m-auto" 
          />
        )}
      </div>
    </div>
  );
};
