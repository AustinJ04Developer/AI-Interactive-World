import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, ShieldCheck, CheckCircle2, ArrowRight, VideoOff, Sparkles, User } from 'lucide-react';
import type { HardwareStatus } from '../types';
import { cameraService } from '../services/cameraService';
import { soundFX } from '../services/audioService';
import { NovaGuide } from '../components/nova/NovaGuide';

interface WelcomeViewProps {
  hardware: HardwareStatus;
  onUpdateHardware: (status: Partial<HardwareStatus>) => void;
  onProceed: (photoUrl: string | null, userName: string) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  hardware,
  onUpdateHardware,
  onProceed
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visitorName, setVisitorName] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      const stream = cameraService.getStream();
      if (stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [cameraActive]);

  const handleAllowCamera = async () => {
    soundFX.playScan();
    setIsCalibrating(true);
    const success = await cameraService.requestCamera();
    setIsCalibrating(false);

    if (success) {
      soundFX.playSuccess();
      setCameraActive(true);
      onUpdateHardware({ camera: 'granted' });
      setTimeout(() => {
        if (videoRef.current) {
          const snap = cameraService.captureSnapshot(videoRef.current);
          setCapturedPreview(snap);
        }
      }, 700);
    } else {
      soundFX.playWarning();
      onUpdateHardware({ camera: 'denied' });
    }
  };

  const handleContinueWithoutCamera = () => {
    soundFX.playClick();
    const syntheticAvatar = cameraService.generateSyntheticAvatar();
    setCapturedPreview(syntheticAvatar);
    onUpdateHardware({ camera: 'denied' });
    onProceed(syntheticAvatar, visitorName.trim() || 'Cadet Alex');
  };

  const handleCompleteCalibration = () => {
    soundFX.playWarp();
    let photo: string | null = capturedPreview;
    if (cameraActive && videoRef.current) {
      photo = cameraService.captureSnapshot(videoRef.current);
    }
    if (!photo) {
      photo = cameraService.generateSyntheticAvatar();
    }
    onProceed(photo, visitorName.trim() || 'Cadet Alex');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 space-bg">
      <div className="scanlines absolute inset-0 z-10 pointer-events-none" />

      {/* Main Terminal Container */}
      <div className="relative z-20 w-full max-w-4xl rounded-2xl hologram-panel p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Left: Viewfinder */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.3)] flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                <VideoOff className="w-10 h-10 text-slate-600" />
                <div className="text-xs font-mono text-cyan-300 font-bold">
                  CAMERA STANDBY
                </div>
                <div className="text-[11px] text-slate-400 max-w-xs">
                  Turn on your camera to get your hero photo on your official Science Expo poster!
                </div>
              </div>
            )}

            {/* Overlays */}
            <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 bg-slate-950/70 px-2.5 py-1 rounded-full backdrop-blur-md">
                <span>{cameraActive ? 'CAMERA ONLINE' : 'OPTIONAL CAMERA'}</span>
                <span>SAFE LOCAL MEMORY</span>
              </div>
              <div className="self-center w-20 h-20 border-2 border-dashed border-cyan-400/50 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
              <div className="text-[9px] font-mono text-slate-400 text-center bg-slate-950/70 py-0.5 rounded-full">
                NO FACIAL RECOGNITION • STRICT PRIVACY
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacy Guaranteed: Photos are strictly stored locally.</span>
          </div>
        </div>

        {/* Right: NOVA Instructions & One-Tap Controls */}
        <div className="w-full md:w-1/2 flex flex-col space-y-4">
          <NovaGuide
            message="Ready for your Hero Shot? 📸"
            subMessage="Enable your camera for your personalized souvenir poster, or jump straight into the adventure!"
            mood="happy"
          />

          <div className="space-y-2.5 pt-1 font-mono text-xs">
            {/* Explorer / Student Name Input Box */}
            <div className="p-3 rounded-xl bg-slate-900/90 border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(0,242,254,0.25)] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-cyan-300 flex items-center space-x-1.5 uppercase">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>WHAT IS YOUR NAME?</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  ★ PRINTED ON POSTER
                </span>
              </div>
              <input
                type="text"
                maxLength={24}
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Enter your name (e.g. Austin J)"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-xs font-mono text-white outline-none placeholder-slate-500"
              />
            </div>

            {/* Camera Check Box */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white">CAMERA (OPTIONAL)</div>
                  <div className="text-[10px] text-slate-400">Used for your souvenir poster</div>
                </div>
              </div>
              {hardware.camera === 'granted' ? (
                <div className="flex items-center text-emerald-400 space-x-1 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>READY</span>
                </div>
              ) : (
                <button
                  onClick={handleAllowCamera}
                  disabled={isCalibrating}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all text-xs"
                >
                  {isCalibrating ? 'CONNECTING...' : 'ALLOW CAMERA'}
                </button>
              )}
            </div>

            {/* AI Core Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-500/40 text-violet-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white">AI CHALLENGE ENGINE</div>
                  <div className="text-[10px] text-slate-400">40+ dynamic scenarios active</div>
                </div>
              </div>
              <div className="flex items-center text-emerald-400 space-x-1 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>ONLINE</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCompleteCalibration}
              className="w-full sm:w-auto flex-1 cyber-btn text-xs py-3.5 flex items-center justify-center space-x-2"
            >
              <span>ENTER THE WORLDS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {hardware.camera !== 'granted' && (
              <button
                onClick={handleContinueWithoutCamera}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono"
              >
                PLAY WITHOUT CAMERA
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
