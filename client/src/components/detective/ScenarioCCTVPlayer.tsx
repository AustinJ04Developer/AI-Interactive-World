import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import { soundFX } from '../../services/audioService';

interface ScenarioCCTVPlayerProps {
  scenario: any;
  selectedClue?: any;
}

export const ScenarioCCTVPlayer: React.FC<ScenarioCCTVPlayerProps> = ({ scenario, selectedClue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(14.2);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isAlertBlinking, setIsAlertBlinking] = useState<boolean>(true);

  // Scenario details
  const sceneTitle = scenario?.content?.scene || 'QUANTUM VAULT RESEARCH SECTOR';
  const cameraTag = scenario?.content?.clues?.[0]?.title || 'CAM-04 // PRIMARY CORRIDOR';
  const clueTimestamp = scenario?.content?.clues?.[0]?.timestamp || '22:14:02';
  const culpritName = scenario?.content?.culpritName || 'SUSPECT AVA CROSS';
  const crimeDetail = scenario?.content?.clues?.[0]?.details || 'Unidentified figure bypassing vault security.';

  // Animated canvas loop for procedural scenario CCTV surveillance video
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;
    let intruderX = 60;
    let intruderDir = 1;

    const render = () => {
      animId = requestAnimationFrame(render);
      frameCount++;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Surveillance Dark Chamber Room Background
      ctx.fillStyle = '#040b14';
      ctx.fillRect(0, 0, w, h);

      // Room Perspective lines (Vault Corridor)
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.lineWidth = 1.5;

      // Floor & Ceiling perspective
      ctx.beginPath();
      ctx.moveTo(0, h * 0.2); ctx.lineTo(w * 0.25, h * 0.35);
      ctx.moveTo(w, h * 0.2); ctx.lineTo(w * 0.75, h * 0.35);
      ctx.moveTo(0, h * 0.85); ctx.lineTo(w * 0.25, h * 0.7);
      ctx.moveTo(w, h * 0.85); ctx.lineTo(w * 0.75, h * 0.7);
      ctx.stroke();

      // Back Door / Vault Frame
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
      ctx.strokeRect(w * 0.25, h * 0.35, w * 0.5, h * 0.35);

      // Vault Neon Lock
      ctx.fillStyle = isAlertBlinking && Math.floor(frameCount / 25) % 2 === 0 ? '#ff007f' : '#00f2fe';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillRect(w * 0.5 - 15, h * 0.48, 30, 20);
      ctx.shadowBlur = 0;

      // Server Racks on side
      for (let r = 0; r < 4; r++) {
        const ry = h * 0.38 + r * 16;
        ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.fillRect(w * 0.12, ry, 6, 4);
        ctx.fillStyle = Math.random() > 0.5 ? '#ffaa00' : '#00f2fe';
        ctx.fillRect(w * 0.86, ry, 6, 4);
      }

      // 2. Animate Intruder / Suspect silhouette in CCTV
      if (isPlaying) {
        intruderX += 0.8 * intruderDir * playbackSpeed;
        if (intruderX > w - 140) intruderDir = -1;
        if (intruderX < 80) intruderDir = 1;
      }

      const intruderY = h * 0.46;
      const intruderW = 38;
      const intruderH = 75;

      // Draw Suspect Shadow / Cleanroom Suit Silhouette
      ctx.save();
      ctx.fillStyle = 'rgba(15, 30, 50, 0.95)';
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
      ctx.lineWidth = 2;

      // Head
      ctx.beginPath();
      ctx.arc(intruderX + intruderW / 2, intruderY + 12, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Body (Torso)
      ctx.fillRect(intruderX + 6, intruderY + 23, intruderW - 12, 32);
      ctx.strokeRect(intruderX + 6, intruderY + 23, intruderW - 12, 32);

      // Legs
      const legOffset = Math.sin(frameCount * 0.15) * 6;
      ctx.fillRect(intruderX + 8, intruderY + 55, 8, 20 + legOffset);
      ctx.fillRect(intruderX + 22, intruderY + 55, 8, 20 - legOffset);
      ctx.restore();

      // 3. AI Facial / Motion Tracking Bounding Box
      ctx.save();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(intruderX - 6, intruderY - 4, intruderW + 12, intruderH + 12);
      ctx.setLineDash([]);

      // Corner markers on bounding box
      const cb = 6;
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 2;
      // Top Left
      ctx.beginPath();
      ctx.moveTo(intruderX - 6, intruderY + cb); ctx.lineTo(intruderX - 6, intruderY - 4); ctx.lineTo(intruderX + cb, intruderY - 4);
      ctx.stroke();
      // Top Right
      ctx.beginPath();
      ctx.moveTo(intruderX + intruderW + 6 - cb, intruderY - 4); ctx.lineTo(intruderX + intruderW + 6, intruderY - 4); ctx.lineTo(intruderX + intruderW + 6, intruderY + cb);
      ctx.stroke();

      // AI Recognition Tag above suspect (Ambiguous & Mysterious - Do not spoil culprit)
      ctx.fillStyle = 'rgba(4, 8, 20, 0.9)';
      ctx.fillRect(intruderX - 10, intruderY - 26, 210, 18);
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 1;
      ctx.strokeRect(intruderX - 10, intruderY - 26, 210, 18);

      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      const scanTag = frameCount % 120 < 60 
        ? 'AI SCAN: BIOMETRIC MATCH INCONCLUSIVE' 
        : 'FACIAL ID: OBSCURED SILHOUETTE [CONF: 48%]';
      ctx.fillText(scanTag, intruderX - 6, intruderY - 14);
      ctx.restore();

      // 4. CCTV Static Noise & Scanlines Overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let s = 0; s < 120; s++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        ctx.fillRect(sx, sy, 2, 2);
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let l = 0; l < h; l += 4) {
        ctx.fillRect(0, l, w, 1);
      }

      // 5. Authentic CCTV Telemetry OSD (On-Screen Display)
      // Top Left: Recording Status & Camera Name
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(22, 22, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText('REC [LIVE REPLAY]', 34, 26);

      ctx.fillStyle = '#00f2fe';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(`${cameraTag.toUpperCase()}`, 22, 45);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`LOCATION: ${sceneTitle.toUpperCase()}`, 22, 60);

      // Top Right: Live Crime Scene Timestamp
      const ms = Math.floor((frameCount * 17) % 100).toString().padStart(2, '0');
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText(`${clueTimestamp}:${ms} UTC`, w - 20, 26);

      ctx.fillStyle = '#00ff88';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('ENCRYPTED TELEMETRY MESH', w - 20, 42);
      ctx.textAlign = 'left';

      // Bottom Bar Crime Event Banner
      ctx.fillStyle = 'rgba(2, 6, 16, 0.85)';
      ctx.fillRect(15, h - 34, w - 30, 24);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.strokeRect(15, h - 34, w - 30, 24);

      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`FORENSIC EVIDENCE: ${crimeDetail}`, 25, h - 18);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, playbackSpeed, scenario, culpritName, cameraTag, sceneTitle, clueTimestamp, crimeDetail, isAlertBlinking]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/40 select-none">
      {/* CCTV Screen Canvas */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="w-full h-full object-contain block"
        />

        {/* Optical Glass Distortion Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/30" />
      </div>

      {/* CCTV Playback Control Bar (Scrubber, Play, Rewind, Speed) */}
      <div className="bg-slate-950/95 border-t border-cyan-500/30 px-3 py-2 flex items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center space-x-2">
          {/* Play/Pause Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              setIsPlaying(prev => !prev);
            }}
            className="p-1.5 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all shadow-md active:scale-95"
            title={isPlaying ? 'Pause CCTV footage' : 'Play CCTV footage'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Frame */}
          <button
            onClick={() => {
              soundFX.playClick();
              setCurrentTimeSec(14.2);
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Rewind to Crime Point"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="text-cyan-400 font-bold hidden sm:inline">
            REPLAY TIMELINE
          </span>
        </div>

        {/* Timeline scrubber bar */}
        <div className="flex-1 max-w-xs flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="30"
            step="0.1"
            value={currentTimeSec}
            onChange={(e) => setCurrentTimeSec(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] text-slate-400 font-mono shrink-0">
            {currentTimeSec.toFixed(1)}s
          </span>
        </div>

        {/* Playback speed toggle */}
        <button
          onClick={() => {
            soundFX.playClick();
            setPlaybackSpeed(prev => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1));
          }}
          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 hover:border-cyan-400 font-bold shrink-0"
          title="Playback speed"
        >
          {playbackSpeed}X SPEED
        </button>
      </div>
    </div>
  );
};
