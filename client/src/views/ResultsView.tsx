import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Download, 
  Mail, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  ShieldCheck,
  Camera,
  User,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  FileText,
  Award,
  Share2
} from 'lucide-react';
import type { SouvenirData } from '../types';
import QRCode from 'qrcode';
import { generateSouvenirPoster } from '../services/souvenirService';
import { soundFX } from '../services/audioService';
import { apiService, resolveAssetUrl } from '../services/apiService';
import { NovaGuide } from '../components/nova/NovaGuide';

interface ResultsViewProps {
  data: SouvenirData;
  onNextExperience: () => void;
  onExitToWorld: () => void;
  onRetakePhoto: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  data,
  onNextExperience,
  onExitToWorld,
  onRetakePhoto
}) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [generationStep, setGenerationStep] = useState<string>('SYNTHESIZING HERO SHOT...');
  const [displayMode, setDisplayMode] = useState<'poster' | 'certificate'>('poster');
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showZoomModal, setShowZoomModal] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [emailInput, setEmailInput] = useState<string>('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailMsg, setEmailMsg] = useState<string>('');

  const [backendResult, setBackendResult] = useState<any>(null);
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    soundFX.playSuccess();

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#00f2fe', '#7928ca', '#ff007f', '#00ff88', '#ffffff']
      });
    } catch {
      // ignore
    }

    const steps = [
      'CAPTURING HERO POSTURE...',
      'RENDERING HOLOGRAPHIC BORDER...',
      'CALCULATING MISSION XP...',
      'GENERATING SMARTPHONE QR CODE...'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setGenerationStep(step);
      }, (idx + 1) * 300);
    });

    let isMounted = true;

    const initPosterWorkflow = async () => {
      // Step A: Immediately construct a guaranteed fallback QR URL using current origin
      const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:5173';
      const fallbackTargetUrl = `${origin}/results/${data.sessionId}?exp=${data.experienceId}&score=${data.score}`;
      let immediateQrDataUrl = '';
      try {
        immediateQrDataUrl = await QRCode.toDataURL(fallbackTargetUrl, {
          margin: 1,
          width: 320,
          color: { dark: '#040915', light: '#ffffff' }
        });
        if (isMounted) {
          setLocalQrDataUrl(immediateQrDataUrl);
        }
      } catch (err) {
        console.warn('Fallback QR code generation warning:', err);
      }

      // Step B: Call backend to record result and generate authoritative QR token
      let authoritativeResult: any = null;
      try {
        authoritativeResult = await apiService.completeExperience({
          portal: data.experienceId,
          sessionId: data.sessionId,
          scenarioId: data.badge || 'EXP-001',
          score: data.score,
          xpEarned: 500,
          achievements: data.achievements,
          metrics: data.metrics,
          aiSummary: data.aiAnalysis
        });

        if (authoritativeResult && isMounted) {
          setBackendResult(authoritativeResult);
        }
      } catch (err) {
        console.warn('Backend result recording notice:', err);
      }

      // Step C: Generate Hero Poster with REAL working QR (authoritative or fallback)
      try {
        const qrToDraw = authoritativeResult?.qrDataUrl || authoritativeResult?.resultWebUrl || immediateQrDataUrl || fallbackTargetUrl;
        const url = await generateSouvenirPoster(data, qrToDraw);

        if (isMounted) {
          setPosterUrl(url);
          setIsGenerating(false);
          soundFX.playSuccess();
        }
      } catch (err) {
        console.error('Poster generation failed, using emergency fallback:', err);
        try {
          const fallbackPoster = await generateSouvenirPoster(data);
          if (isMounted) {
            setPosterUrl(fallbackPoster);
          }
        } catch {
          // ignore
        }
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    initPosterWorkflow();

    return () => {
      isMounted = false;
    };
  }, [data]);

  const handleDownload = () => {
    if (!posterUrl) {
      console.warn('Download unavailable: poster is not ready');
      return;
    }
    soundFX.playClick();

    try {
      const fileName = `AI-WORLD-HERO-${data.experienceId.toUpperCase()}-${data.sessionId}.png`;

      // Use Blob + ObjectURL to guarantee download across all browsers
      if (posterUrl.startsWith('data:')) {
        const parts = posterUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ia], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setDownloadSuccess(true);
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          setDownloadSuccess(false);
        }, 2000);
      } else {
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = posterUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setDownloadSuccess(true);
        setTimeout(() => {
          document.body.removeChild(link);
          setDownloadSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.warn('Direct Blob download failed, attempting window open fallback:', err);
      const win = window.open();
      if (win) {
        win.document.write(`<title>AI World Souvenir</title><img src="${posterUrl}" style="max-width:100%;height:auto;display:block;margin:auto;" />`);
      }
    }
  };

  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;

    soundFX.playScan();
    setEmailStatus('sending');

    const outcome = await apiService.sendEmail({
      resultId: backendResult?.resultId || data.sessionId,
      recipientEmail: emailInput.trim(),
      experienceTitle: data.experienceTitle,
      score: data.score,
      xpEarned: 500,
      achievements: data.achievements,
      token: backendResult?.token
    });

    if (outcome.success) {
      soundFX.playSuccess();
      setEmailStatus('sent');
      setEmailMsg(outcome.message);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailStatus('idle');
      }, 2500);
    } else {
      soundFX.playWarning();
      setEmailStatus('error');
      setEmailMsg(outcome.message);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-y-auto flex flex-col pt-20 pb-6 px-4 sm:px-8 space-bg select-none">
      <div className="scanlines absolute inset-0 z-10 pointer-events-none" />

      {/* Hidden container dedicated solely for crisp window.print() output */}
      {posterUrl && (
        <div id="printable-hero-poster" style={{ display: 'none' }}>
          <img src={posterUrl} alt="Hero Souvenir Poster Print" />
        </div>
      )}

      {/* Top Header with Completion Ribbon & Mascot */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-xs font-mono text-emerald-300 mb-1 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>MISSION ACCOMPLISHED! +500 XP EARNED</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wider">
            YOUR OFFICIAL <span className="text-cyan-400">HERO POSTER & CERTIFICATE</span>
          </h2>
        </div>

        <NovaGuide
          message="Sensational job, Explorer! 🎉"
          subMessage="Your custom poster is ready to inspect, print, or take home via smartphone QR code!"
          mood="hero"
        />
      </div>

      {/* View Mode Toggle: Exhibition Poster vs Certificate Dossier */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { soundFX.playClick(); setDisplayMode('poster'); }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              displayMode === 'poster' 
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,242,254,0.4)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🎨 HERO POSTER SHOWCASE</span>
          </button>
          <button
            onClick={() => { soundFX.playClick(); setDisplayMode('certificate'); }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              displayMode === 'certificate' 
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,242,254,0.4)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>📜 OFFICIAL DOSSIER CERTIFICATE</span>
          </button>
        </div>

        {/* Quick Print & Zoom Actions on Top Right */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => { soundFX.playClick(); setShowZoomModal(true); }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-mono transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>FULLSCREEN INSPECTOR</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-emerald-300 text-xs font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>PRINT SOUVENIR</span>
          </button>
        </div>
      </div>

      {/* FALSE ARREST REASONING BANNER IF WRONG SUSPECT WAS CHOSEN */}
      {(data.experienceSubtitle?.includes('TRUE CULPRIT') || data.score < 500) && (
        <div className="relative z-20 max-w-7xl mx-auto w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-pink-950/90 via-slate-950 to-slate-950 border-2 border-pink-500 shadow-[0_0_25px_rgba(255,0,127,0.3)] animate-in fade-in duration-300">
          <div className="flex items-center space-x-2 text-pink-400 font-mono font-bold text-xs mb-1">
            <span className="p-1 rounded bg-pink-950 border border-pink-500 text-pink-300">⚠ FORENSIC DEBRIEF</span>
            <span>WHY YOUR ACCUSED SUSPECT WAS INNOCENT:</span>
          </div>
          <p className="text-white font-sans text-xs sm:text-sm leading-relaxed">
            {data.aiAnalysis}
          </p>
        </div>
      )}

      {/* Main Content Showcase Setup */}
      <div className="relative z-20 flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left / Center: Redesigned Poster Exhibition Viewport (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          {isGenerating ? (
            <div className="w-full max-w-md aspect-[4/5] rounded-2xl hologram-panel border-2 border-cyan-400 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl bg-slate-950/80">
              <div className="w-16 h-16 rounded-full border-3 border-cyan-400 border-t-transparent animate-spin" />
              <div className="text-sm font-mono text-cyan-400 font-bold tracking-wider">
                COMPOSITING HERO POSTER
              </div>
              <div className="text-xs font-mono text-slate-400">
                {generationStep}
              </div>
            </div>
          ) : displayMode === 'poster' ? (
            posterUrl && (
              <div className="relative group w-full max-w-lg rounded-2xl p-2.5 bg-gradient-to-b from-cyan-500/20 via-slate-900/90 to-slate-950 border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(0,242,254,0.3)] transition-all">
                
                {/* Poster Hologram Frame Corner Brackets */}
                <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-300 pointer-events-none" />
                <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-300 pointer-events-none" />
                <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-300 pointer-events-none" />
                <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-300 pointer-events-none" />

                {/* Clickable Poster for 1:1 Inspector */}
                <div 
                  onClick={() => { soundFX.playClick(); setShowZoomModal(true); }}
                  className="cursor-zoom-in relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center"
                  title="Click to open Fullscreen 1:1 Zoom Inspector"
                >
                  <img
                    src={posterUrl}
                    alt="Personalized Science Expo Poster"
                    className="w-full h-auto max-h-[68vh] object-contain rounded-lg shadow-2xl"
                  />

                  {/* Hover Overlay Hint */}
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-display font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-2xl">
                      <Maximize2 className="w-4 h-4" />
                      <span>CLICK TO INSPECT FULL RESOLUTION (1200x1500)</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Poster Bar with Quick Actions */}
                <div className="mt-2.5 flex items-center justify-between px-2 text-[11px] font-mono">
                  <span className="text-cyan-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PRINT-READY 1200x1500 • 300 DPI</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => { soundFX.playClick(); setShowZoomModal(true); }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center space-x-1"
                      title="Inspect resolution"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>INSPECT</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 flex items-center space-x-1"
                      title="Print A4 souvenir"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PRINT</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className={`px-3 py-1 rounded font-bold flex items-center space-x-1 transition-all ${
                        downloadSuccess ? 'bg-emerald-400 text-black' : 'bg-cyan-400 text-black hover:bg-cyan-300'
                      }`}
                    >
                      {downloadSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                          <span>SAVED!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>SAVE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* OFFICIAL CERTIFICATE DOSSIER VIEW */
            <div className="w-full max-w-lg rounded-2xl p-6 bg-slate-950/90 border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(0,242,254,0.25)] space-y-4 font-mono">
              <div className="text-center pb-3 border-b border-cyan-500/30">
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest">
                  AI INTERACTIVE WORLD • {import.meta.env.VITE_EXHIBITION_NAME?.toUpperCase() || 'SCIENCE EXHIBITION 2026'}
                </div>
                <h3 className="text-xl font-display font-black text-white uppercase mt-1">
                  OFFICIAL EXPLORER COMMENDATION
                </h3>
                <div className="text-sm font-display font-bold text-cyan-400 mt-1 uppercase tracking-wider">
                  AWARDED TO: {data.visitorName?.toUpperCase() || 'CADET ALEX'}
                </div>
                <div className="text-xs text-emerald-400 mt-1">
                  CREDENTIAL VERIFIED • SESSION #{data.sessionId}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-cyan-400 bg-black shrink-0">
                  {data.visitorPhotoUrl ? (
                    <img
                      src={resolveAssetUrl(data.visitorPhotoUrl)}
                      alt="Student Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cyan-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase">{data.badge || 'EXPEDITION HERO'}</div>
                  <div className="text-[11px] text-cyan-300">{data.experienceTitle}</div>
                  <div className="text-[10px] text-slate-400">Awarded: {data.dateStr}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">MISSION TELEMETRY:</div>
                <div className="grid grid-cols-2 gap-2">
                  {data.metrics.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
                      <div className="text-[10px] text-slate-400 uppercase">{m.label}</div>
                      <div className="font-bold text-cyan-300">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-sans text-slate-200">
                <span className="font-mono text-cyan-400 font-bold block mb-1">AI CORE EVALUATION:</span>
                "{data.aiAnalysis}"
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PERMANENT BLOCKCHAIN RECORD</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 rounded bg-emerald-500 text-black font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT CERTIFICATE</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Delivery, Phone QR Scan, & Navigation Actions (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3.5">
          
          {/* Participant Profile Hologram Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-lg flex items-center space-x-3.5 backdrop-blur-md">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-cyan-400 shrink-0 bg-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
              {data.visitorPhotoUrl ? (
                <img
                  src={resolveAssetUrl(data.visitorPhotoUrl)}
                  alt="Participant"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cyan-950/80 text-cyan-400">
                  <User className="w-7 h-7" />
                </div>
              )}
              <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff88]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>PARTICIPANT PROFILE VERIFIED</span>
              </div>
              <div className="text-sm font-display font-black text-cyan-300 truncate uppercase">
                {data.visitorName || 'CADET ALEX'}
              </div>
              <div className="text-[10px] font-mono text-white font-bold truncate">
                RANK: {data.badge || 'EXPEDITION HERO'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                SESSION: {data.sessionId}
              </div>
            </div>
            <button
              onClick={() => { soundFX.playClick(); onRetakePhoto(); }}
              title="Retake photo"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors shrink-0"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Scan Smartphone QR Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-slate-950 border-2 border-cyan-400/50 shadow-xl flex items-center space-x-4">
            {(backendResult?.qrDataUrl || localQrDataUrl) ? (
              <img
                src={backendResult?.qrDataUrl || localQrDataUrl!}
                alt="Scan with phone"
                className="w-20 h-20 rounded-lg bg-white p-1 shrink-0 shadow-md cursor-pointer hover:scale-105 transition-transform"
                onClick={() => { soundFX.playClick(); setShowQrModal(true); }}
              />
            ) : (
              <div 
                className="w-20 h-20 rounded-lg bg-white p-2 flex items-center justify-center shrink-0 cursor-pointer"
                onClick={() => { soundFX.playClick(); setShowQrModal(true); }}
              >
                <QrCode className="w-16 h-16 text-black" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-display font-black text-cyan-300 uppercase tracking-wider">
                SCAN WITH YOUR PHONE!
              </div>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
                Scan with your smartphone camera to save the full poster, unlock mobile badges, and share with friends!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => { soundFX.playClick(); setShowQrModal(true); }}
              className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-transform active:scale-98"
            >
              <QrCode className="w-4 h-4" />
              <span>SHOW FULL-SCREEN SMARTPHONE QR</span>
            </button>

            <button
              onClick={() => { soundFX.playClick(); setShowEmailModal(true); }}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>SEND POSTER TO EMAIL</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>PRINT (A4 / PHOTO)</span>
              </button>

              <button
                onClick={handleDownload}
                className={`py-2.5 rounded-xl border text-xs font-mono flex items-center justify-center space-x-1.5 transition-colors ${
                  downloadSuccess 
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300' 
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'
                }`}
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>SAVED FILE ✓</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>DOWNLOAD FILE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Next World & Reset Navigation */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => { soundFX.playClick(); onNextExperience(); }}
              className="w-full cyber-btn cyber-btn-violet text-xs py-3.5 flex items-center justify-center space-x-2 shadow-xl"
            >
              <span>EXPLORE ANOTHER WORLD</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { soundFX.playClick(); onExitToWorld(); }}
              className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs font-mono hover:text-slate-200 transition-colors"
            >
              RESET FOR NEXT VISITOR
            </button>
          </div>

        </div>

      </div>

      {/* FULLSCREEN 1:1 ZOOM INSPECTOR LIGHTBOX MODAL */}
      {showZoomModal && posterUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-2xl p-4 select-none">
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/40 text-xs font-mono">
            <div className="flex items-center space-x-3 text-cyan-300 font-bold">
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span>ULTRA HD HERO POSTER INSPECTOR (1200x1500 @ 300 DPI)</span>
            </div>

            {/* Zoom Controls & Close */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.2))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-slate-400 min-w-[50px] text-center font-mono">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                RESET
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PRINT</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-cyan-400 text-black font-bold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD</span>
              </button>
              <button
                onClick={() => setShowZoomModal(false)}
                className="p-2 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 hover:bg-red-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Zoom / Scroll Pan Viewport */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <div 
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
              className="origin-center shadow-[0_0_60px_rgba(0,242,254,0.4)] rounded-xl border border-cyan-400/40 overflow-hidden"
            >
              <img
                src={posterUrl}
                alt="Full resolution hero poster"
                className="max-h-[85vh] w-auto object-contain block"
              />
            </div>
          </div>
        </div>
      )}

      {/* QR Code Full Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl hologram-panel border-2 border-cyan-400 text-center space-y-4 shadow-2xl bg-slate-950">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase">SCAN ON YOUR PHONE</span>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white font-mono text-sm">✕</button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-2xl">
              {(backendResult?.qrDataUrl || localQrDataUrl) ? (
                <img src={backendResult?.qrDataUrl || localQrDataUrl!} alt="QR Code" className="w-56 h-56" />
              ) : (
                <QrCode className="w-56 h-56 text-black" />
              )}
            </div>

            <div className="text-xs font-mono text-slate-300">
              Point your smartphone camera at the code to view, download, and share your official souvenir!
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono hover:text-white"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-6 rounded-2xl hologram-panel border-2 border-cyan-400 space-y-4 shadow-2xl bg-slate-950">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300">
                <Mail className="w-4 h-4" />
                <span>TAKE YOUR EXPERIENCE HOME</span>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-white font-mono text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Enter your email to receive your personalized high-resolution Science Expo poster, AI commendation, and verified achievements!
            </p>

            {emailStatus === 'sent' ? (
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-center font-mono text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <div className="font-bold">EMAIL DISPATCHED!</div>
                <div>{emailMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-3">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="explorer@school.edu"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-3 text-xs text-white font-mono outline-none"
                />
                <button
                  type="submit"
                  disabled={emailStatus === 'sending'}
                  className="w-full py-3 rounded-xl bg-cyan-400 text-black font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{emailStatus === 'sending' ? 'TRANSMITTING SOUVENIR...' : 'SEND TO MY EMAIL'}</span>
                </button>
                {emailStatus === 'error' && (
                  <div className="text-[11px] text-red-400 font-mono text-center">{emailMsg}</div>
                )}
              </form>
            )}

            <div className="text-[10px] font-mono text-slate-500 text-center flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Strict Privacy: Email discarded after delivery.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
