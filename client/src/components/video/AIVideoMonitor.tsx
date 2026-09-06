import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  Eye, 
  Flame, 
  Sparkles, 
  Camera, 
  Video, 
  Sliders, 
  CheckCircle2,
  Scan,
  RefreshCw
} from 'lucide-react';
import { soundFX } from '../../services/audioService';

export interface AIVideoMonitorProps {
  title: string;
  cameraTag: string;
  sourceImage: string;
  aspectRatio?: 'video' | 'square' | 'wide';
  showAiDetection?: boolean;
  boundingBoxes?: {
    id: string;
    label: string;
    confidence: number;
    x: number; // percentage
    y: number;
    w: number;
    h: number;
    color?: string;
  }[];
  onSnapshotTaken?: (dataUrl: string) => void;
}

export const AIVideoMonitor: React.FC<AIVideoMonitorProps> = ({
  title,
  cameraTag,
  sourceImage,
  aspectRatio = 'video',
  showAiDetection = true,
  boundingBoxes = [
    { id: 'OBJ-1', label: 'SUSPECT VECTOR', confidence: 98.4, x: 25, y: 35, w: 20, h: 48, color: '#00f2fe' },
    { id: 'OBJ-2', label: 'CONTAINMENT FRACTURE', confidence: 99.1, x: 62, y: 28, w: 26, h: 54, color: '#ff007f' }
  ],
  onSnapshotTaken
}) => {
  const [visionMode, setVisionMode] = useState<'rgb' | 'thermal' | 'night' | 'wireframe'>('rgb');
  const [isAiEnhancing, setIsAiEnhancing] = useState<boolean>(false);
  const [enhanceProgress, setEnhanceProgress] = useState<number>(0);
  const [isEnhanced, setIsEnhanced] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<string>('');
  const [timecodeMs, setTimecodeMs] = useState<number>(104);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [trackingActive, setTrackingActive] = useState<boolean>(showAiDetection);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live CCTV millisecond timecode clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
      const ms = Math.floor(Math.random() * 900) + 100;
      setTimestamp(dateStr);
      setTimecodeMs(ms);
    };
    updateTime();
    const interval = setInterval(updateTime, 250);
    return () => clearInterval(interval);
  }, []);

  // AI Super-Resolution Enhancer routine
  const handleTriggerEnhance = () => {
    if (isAiEnhancing) return;
    soundFX.playScan();
    setIsAiEnhancing(true);
    setEnhanceProgress(0);

    const startTime = Date.now();
    const duration = 1200;

    const animInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setEnhanceProgress(progress);

      if (progress >= 100) {
        clearInterval(animInterval);
        setIsAiEnhancing(false);
        setIsEnhanced(true);
        soundFX.playSuccess();
      }
    }, 60);
  };

  const handleCaptureSnapshot = () => {
    soundFX.playShutter();
    if (onSnapshotTaken) {
      onSnapshotTaken(sourceImage);
    }
  };

  const toggleZoom = () => {
    soundFX.playClick();
    setZoomLevel(prev => (prev === 1 ? 1.4 : prev === 1.4 ? 1.8 : 1));
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-slate-950 shadow-[0_0_35px_rgba(0,242,254,0.25)] select-none flex flex-col ${
        aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'wide' ? 'aspect-[21/9]' : 'aspect-square'
      }`}
    >
      {/* 1. Base Video Feed with Interactive Vision Filters */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <img 
          src={sourceImage} 
          alt={title}
          style={{
            transform: `scale(${zoomLevel})`,
            filter: 
              visionMode === 'thermal' 
                ? 'hue-rotate(240deg) saturate(3.5) contrast(1.8) invert(0.15)' 
                : visionMode === 'night' 
                ? 'sepia(1) hue-rotate(85deg) saturate(4) brightness(0.9) contrast(1.4)'
                : visionMode === 'wireframe'
                ? 'invert(1) contrast(3) grayscale(1)'
                : isEnhanced 
                ? 'contrast(1.15) saturate(1.1) brightness(1.05)'
                : 'blur(0.4px) contrast(1.05)'
          }}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* 2. Authentic CCTV Scanlines & Dynamic Noise */}
        <div className="absolute inset-0 pointer-events-none scanlines opacity-60" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60" />

        {/* 3. AI Neural Super-Resolution Sweep Scan */}
        {isAiEnhancing && (
          <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-center items-center bg-cyan-950/40 backdrop-blur-[1px]">
            {/* Horizontal laser scan beam */}
            <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_20px_#00f2fe] animate-bounce" />
            <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-400 text-center font-mono text-xs space-y-2 shadow-2xl">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>AI SUPER-RESOLUTION NEURAL DEBLUR</span>
              </div>
              <div className="w-56 h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/40">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-75"
                  style={{ width: `${enhanceProgress}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400">
                RECONSTRUCTING HIGH-FREQUENCY EDGES: {enhanceProgress}%
              </div>
            </div>
          </div>
        )}

        {/* 4. Real-time AI Object Detection Bounding Boxes */}
        {trackingActive && !isAiEnhancing && boundingBoxes.map((box) => (
          <div
            key={box.id}
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.w}%`,
              height: `${box.h}%`,
              borderColor: box.color || '#00f2fe'
            }}
            className="absolute border-2 pointer-events-none transition-all duration-200"
          >
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

            {/* Target telemetry label */}
            <div 
              style={{ backgroundColor: box.color || '#00f2fe' }}
              className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-black text-black tracking-wider flex items-center space-x-1 whitespace-nowrap"
            >
              <span>{box.label}</span>
              <span className="opacity-80 font-normal">{box.confidence}%</span>
            </div>

            {/* Sub-telemetry */}
            <div className="absolute -bottom-5 right-0 text-[8px] font-mono text-cyan-300 bg-slate-950/80 px-1 py-0.2 rounded border border-cyan-400/30">
              TRK #{box.id} • 60 FPS
            </div>
          </div>
        ))}

        {/* 5. Center Target Crosshairs */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-16 h-16 border border-cyan-400/30 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-400/40" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-400/40" />
          </div>
        </div>

        {/* 6. Top Telemetry Bar */}
        <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between pointer-events-none text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ff0000]" />
            <span className="text-red-400 font-bold tracking-widest text-[11px]">REC [LIVE]</span>
            <span className="text-slate-400 text-[10px]">|</span>
            <span className="text-cyan-300 font-bold">{cameraTag}</span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">• 4K HDR 60FPS</span>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-300 bg-slate-950/75 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-md">
            <span>{timestamp}.{timecodeMs}</span>
            {isEnhanced && (
              <span className="text-emerald-400 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/40">
                AI ENHANCED 4K
              </span>
            )}
          </div>
        </div>

        {/* 7. Bottom Left Camera Description */}
        <div className="absolute bottom-12 left-3 pointer-events-none text-left font-mono">
          <div className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">
            {title}
          </div>
          <div className="text-[10px] text-cyan-400 flex items-center space-x-1.5 mt-0.5">
            <Scan className="w-3 h-3 text-cyan-400" />
            <span>AI NEURAL OPTICS ACTIVE • ZOOM: {zoomLevel}X</span>
          </div>
        </div>
      </div>

      {/* 8. Interactive AI Control Console (Bottom Strip) */}
      <div className="relative z-20 px-3 py-2 bg-slate-950/95 border-t border-cyan-500/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        
        {/* Left: Vision Spectrum Modes */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => { soundFX.playClick(); setVisionMode('rgb'); }}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              visionMode === 'rgb' 
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,242,254,0.5)]' 
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            OPTICAL RGB
          </button>
          <button
            onClick={() => { soundFX.playClick(); setVisionMode('thermal'); }}
            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center space-x-1 transition-all ${
              visionMode === 'thermal' 
                ? 'bg-pink-500 text-white shadow-[0_0_10px_rgba(255,0,127,0.5)]' 
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>THERMAL IR</span>
          </button>
          <button
            onClick={() => { soundFX.playClick(); setVisionMode('night'); }}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              visionMode === 'night' 
                ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(0,255,136,0.5)]' 
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            NIGHT VISION
          </button>
        </div>

        {/* Right: AI Tools & Zoom Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Tracking toggle */}
          <button
            onClick={() => { soundFX.playClick(); setTrackingActive(!trackingActive); }}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
              trackingActive 
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300' 
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
          >
            AI TRACKING
          </button>

          {/* AI Enhance button */}
          <button
            onClick={handleTriggerEnhance}
            disabled={isAiEnhancing}
            className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center space-x-1 border transition-all ${
              isEnhanced
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black hover:opacity-90 shadow-[0_0_12px_rgba(0,242,254,0.4)]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{isEnhanced ? 'ENHANCED ✓' : 'AI ENHANCE'}</span>
          </button>

          {/* Zoom button */}
          <button
            onClick={toggleZoom}
            className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300"
            title="Digital Zoom"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Snapshot button */}
          <button
            onClick={handleCaptureSnapshot}
            className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Save Snapshot"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
