import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Zap, 
  Target, 
  Activity, 
  Award, 
  Cpu, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Video,
  Eye,
  Flame,
  Bomb,
  Snowflake,
  ShieldPlus,
  Crosshair,
  Sliders,
  Play,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import type { DefenseThreat, PlayerAdaptationStats, SouvenirData, LevelResult } from '../types';
import { soundFX } from '../services/audioService';
import { useLevelTimer, type LevelConfig } from '../hooks/useLevelTimer';

interface AIDefenseViewProps {
  visitorPhotoUrl: string | null;
  visitorName?: string;
  onComplete: (souvenir: SouvenirData) => void;
  onExit: () => void;
  onHudUpdate?: (hud: {
    level?: number;
    timeRemaining?: number;
    timeBudget?: number;
    transitionInfo?: any;
    score?: number;
  }) => void;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

interface BossEnemy {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  angle: number;
  active: boolean;
}

const DEFENSE_LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, label: 'Wave 1: Peripheral Recon Probes', timeBudgetSec: 45, maxScore: 100 },
  { level: 2, label: 'Wave 2: Distributed Botnet Infiltration', timeBudgetSec: 55, maxScore: 150 },
  { level: 3, label: 'Wave 3: Quantum Decryption Swarm', timeBudgetSec: 65, maxScore: 200 },
  { level: 4, label: 'Wave 4: Neural Trojan Incursion', timeBudgetSec: 65, maxScore: 250 },
  { level: 5, label: 'Wave 5: Hive Queen Zero-Day Synthesis', timeBudgetSec: 70, maxScore: 300 },
];

export const AIDefenseView: React.FC<AIDefenseViewProps> = ({
  visitorPhotoUrl,
  visitorName = 'Cadet Alex',
  onComplete,
  onExit,
  onHudUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game lifecycle: briefing modal -> active gameplay -> complete
  const [gameState, setGameState] = useState<'briefing' | 'active' | 'complete'>('briefing');
  const [score, setScore] = useState<number>(0);
  const [coreHealth, setCoreHealth] = useState<number>(100);
  const [combo, setCombo] = useState<number>(0);
  const [empCharges, setEmpCharges] = useState<number>(2);
  const [freezeCharges, setFreezeCharges] = useState<number>(2);
  const [shieldCharges, setShieldCharges] = useState<number>(1);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 400, y: 300 });
  const isPointerDownRef = useRef<boolean>(false);
  const lastShotTimeRef = useRef<number>(0);

  const [adaptationStats, setAdaptationStats] = useState<PlayerAdaptationStats>({
    reactionTimeMs: 410,
    accuracyPct: 95,
    threatsNeutralized: 0,
    difficultyLevel: 1,
    aiAggressionLevel: 1.0,
    riskTolerance: 'Balanced'
  });
  const [aiAdaptiveAlert, setAiAdaptiveAlert] = useState<string>('DEFENSE GRID ACTIVE // TARGET INCOMING MALWARE');

  // Universal 5-Level Timer Scaffolding Integration
  const handleFinalDefenseComplete = (results: LevelResult[], finalScore: number) => {
    soundFX.playSuccess();
    setGameState('complete');
    const totalScoreVal = finalScore + 400;
    const allCompletedWithoutTimeout = results.every(r => r.completedBeforeTimeout);
    const achievements = allCompletedWithoutTimeout
      ? ['Neural Defender', 'Sub-400ms Reflexes', 'Quantum Core Hero', 'Titan Breaker'] 
      : ['Brave Stand', 'Swarm Survivor', 'Quantum Resilient'];

    const souvenirData: SouvenirData = {
      experienceId: 'ai-defense',
      experienceTitle: 'AI DEFENSE // PLAYER PROFILE',
      experienceSubtitle: 'MISSION RESULT: QUANTUM CORE SECURED (5 WAVES)',
      visitorName,
      visitorPhotoUrl: visitorPhotoUrl || '',
      score: totalScoreVal,
      achievements,
      metrics: [
        { label: 'REACTION LATENCY', value: `${adaptationStats.reactionTimeMs} MS` },
        { label: 'TARGETING ACCURACY', value: `${adaptationStats.accuracyPct}%` },
        { label: 'GLITCHES ELIMINATED', value: `${statsRef.current.hits} ANOMALIES` },
        { label: 'WAVES CLEARED', value: `${results.filter(r => r.completedBeforeTimeout).length} / 5 WAVES` }
      ],
      aiAnalysis: `Dynamic neural adaptation analysis logs a ${adaptationStats.reactionTimeMs}ms average reflex response across 5 escalating threat waves. Behavioral metrics classified combat style as ${adaptationStats.riskTolerance}.`,
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sessionId: 'DEF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      badge: allCompletedWithoutTimeout ? 'CYBER-ATHLETE ELITE' : 'TACTICAL DEFENDER',
      themeColor: '#ff007f',
      levelResults: results
    };

    setTimeout(() => {
      onComplete(souvenirData);
    }, 1200);
  };

  const {
    currentLevel,
    timeRemainingInLevel,
    currentConfig,
    transitionInfo,
    totalScore,
    advanceLevel,
    timeoutLevel,
    start: startLevelTimer
  } = useLevelTimer(DEFENSE_LEVEL_CONFIGS, handleFinalDefenseComplete);

  const wave = currentLevel;

  // Sync Level HUD with GlobalHUD
  useEffect(() => {
    if (onHudUpdate) {
      onHudUpdate({
        level: currentLevel,
        timeRemaining: timeRemainingInLevel,
        timeBudget: currentConfig.timeBudgetSec,
        transitionInfo,
        score: totalScore + score
      });
    }
  }, [currentLevel, timeRemainingInLevel, currentConfig, transitionInfo, totalScore, score, onHudUpdate]);

  // Game loop internal refs
  const threatsRef = useRef<DefenseThreat[]>([]);
  const laserBeamsRef = useRef<{ x1: number; y1: number; x2: number; y2: number; alpha: number; color: string }[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }[]>([]);
  const bossRef = useRef<BossEnemy>({ x: 400, y: 100, health: 0, maxHealth: 15, angle: 0, active: false });

  const statsRef = useRef({
    totalShots: 0,
    hits: 0,
    lastSpawnTime: 0,
    reactionLatencies: [] as number[],
    lastClickTime: Date.now(),
    comboCount: 0
  });

  const freezeTimerRef = useRef<number>(0);

  const handleStartGame = () => {
    soundFX.playBoot();
    startLevelTimer();
    setGameState('active');
    setScore(0);
    setCoreHealth(100);
    setCombo(0);
    setEmpCharges(2);
    setFreezeCharges(2);
    setShieldCharges(1);
    setIsFrozen(false);
    threatsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    shockwavesRef.current = [];
    laserBeamsRef.current = [];
    bossRef.current = { x: 400, y: 100, health: 0, maxHealth: 15, angle: 0, active: false };
    statsRef.current = {
      totalShots: 0,
      hits: 0,
      lastSpawnTime: Date.now(),
      reactionLatencies: [],
      lastClickTime: Date.now(),
      comboCount: 0
    };
  };

  // Keyboard Shortcuts (Space for EMP, F for Freeze, R for Repair)
  useEffect(() => {
    if (gameState !== 'active') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        triggerEMP();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        triggerFreeze();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        triggerRepair();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, empCharges, freezeCharges, shieldCharges]);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    if (gameState !== 'active') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let spawnTimer = 0;

    // Resize canvas to container
    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);

      const w = canvas.width;
      const h = canvas.height;
      const coreX = w / 2;
      const coreY = h / 2;
      const coreRadius = Math.min(46, w * 0.08);

      const now = Date.now();
      const freezeActive = now < freezeTimerRef.current;
      if (!freezeActive && isFrozen) setIsFrozen(false);

      // Background clearing with motion trail
      ctx.fillStyle = freezeActive ? 'rgba(3, 16, 28, 0.42)' : 'rgba(4, 8, 20, 0.38)';
      ctx.fillRect(0, 0, w, h);

      // Futuristic Grid Overlay
      ctx.strokeStyle = freezeActive ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 0, 127, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Shockwave Animations
      for (let sw = shockwavesRef.current.length - 1; sw >= 0; sw--) {
        const s = shockwavesRef.current[sw];
        s.radius += 20;
        s.alpha -= 0.04;

        ctx.strokeStyle = `rgba(0, 242, 254, ${Math.max(0, s.alpha)})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (s.alpha <= 0 || s.radius >= s.maxRadius) {
          shockwavesRef.current.splice(sw, 1);
        }
      }

      // Laser Beams from Core to Targets
      for (let b = laserBeamsRef.current.length - 1; b >= 0; b--) {
        const beam = laserBeamsRef.current[b];
        beam.alpha -= 0.1;

        ctx.save();
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = beam.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(beam.x1, beam.y1);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();
        ctx.restore();

        if (beam.alpha <= 0) {
          laserBeamsRef.current.splice(b, 1);
        }
      }

      // Central Quantum Core
      ctx.save();
      ctx.strokeStyle = freezeActive ? '#00f2fe' : '#ff007f';
      ctx.lineWidth = 3;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(coreX, coreY, coreRadius + Math.sin(now * 0.006) * 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = freezeActive ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 0, 127, 0.2)';
      ctx.beginPath();
      ctx.arc(coreX, coreY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core Text HUD
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QUANTUM CORE', coreX, coreY - 6);
      ctx.fillStyle = coreHealth > 35 ? '#00ff88' : '#ff007f';
      ctx.fillText(`${coreHealth}% HP`, coreX, coreY + 12);
      ctx.restore();

      const currentWave = currentLevel;

      // Boss Spawn Trigger on Wave 5
      if (currentWave === 5 && !bossRef.current.active && bossRef.current.health === 0) {
        bossRef.current = {
          x: coreX,
          y: Math.max(70, h * 0.18),
          health: 15,
          maxHealth: 15,
          angle: 0,
          active: true
        };
        soundFX.playAlert();
        floatingTextsRef.current.push({
          id: Math.random().toString(),
          x: coreX,
          y: 90,
          text: '⚠ BOSS DETECTED: TITAN GLITCH OVERLORD ⚠',
          color: '#ff007f',
          alpha: 1
        });
      }

      // Spawn Regular Glitch Threats
      spawnTimer++;
      const spawnInterval = freezeActive ? 120 : currentWave === 1 ? 55 : currentWave === 2 ? 40 : 32;

      if (spawnTimer >= spawnInterval && threatsRef.current.length < 9) {
        spawnTimer = 0;
        const angle = Math.random() * Math.PI * 2;
        const spawnDist = Math.max(w, h) * 0.55;
        const sx = coreX + Math.cos(angle) * spawnDist;
        const sy = coreY + Math.sin(angle) * spawnDist;

        // Types: glitch, malware, quantum-probe
        const threatType: 'glitch' | 'malware' | 'quantum-probe' = 
          currentWave === 1 ? 'glitch' : Math.random() > 0.4 ? 'malware' : 'quantum-probe';
        const speedMultiplier = threatType === 'malware' ? 1.4 : threatType === 'quantum-probe' ? 0.7 : 1.0;

        threatsRef.current.push({
          id: Math.random().toString(36).substring(2, 9),
          type: threatType,
          x: sx,
          y: sy,
          speed: (1.2 + Math.random() * 0.6) * speedMultiplier,
          health: 1,
          points: 100,
          radius: threatType === 'quantum-probe' ? 22 : 16,
          color: threatType === 'malware' ? '#ff007f' : threatType === 'quantum-probe' ? '#ffaa00' : '#00f2fe',
          mutationLabel: threatType === 'quantum-probe' ? 'CORRUPTOR' : threatType === 'malware' ? 'TROJAN' : 'MALWARE'
        });
      }

      // Render & Update Threats
      for (let i = threatsRef.current.length - 1; i >= 0; i--) {
        const t = threatsRef.current[i];
        const threatRadius = t.radius || 16;
        const threatColor = t.color || '#00f2fe';
        const threatLabel = t.mutationLabel || 'GLITCH';

        // Move towards core
        const dx = coreX - t.x;
        const dy = coreY - t.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const actualSpeed = freezeActive ? t.speed * 0.2 : t.speed;

        if (dist > coreRadius) {
          t.x += (dx / dist) * actualSpeed;
          t.y += (dy / dist) * actualSpeed;
        } else {
          // Reached Core -> Core Damage!
          threatsRef.current.splice(i, 1);
          soundFX.playAlert();
          setCoreHealth(prev => {
            const next = Math.max(0, prev - 12);
            if (next <= 0) {
              timeoutLevel(Math.round(currentConfig.maxScore * 0.4), 35, 'Emergency Reboot // Non-Fatal Breach');
              return 45;
            }
            return next;
          });
          statsRef.current.comboCount = 0;
          setCombo(0);

          floatingTextsRef.current.push({
            id: Math.random().toString(),
            x: coreX,
            y: coreY - 25,
            text: '-12% CORE BREACH',
            color: '#ff007f',
            alpha: 1
          });
          continue;
        }

        // Draw Threat Node
        ctx.save();
        ctx.fillStyle = threatColor;
        ctx.shadowColor = threatColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(t.x, t.y, threatRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, threatRadius + Math.sin(now * 0.01) * 3, 0, Math.PI * 2);
        ctx.stroke();

        // Threat Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(threatLabel, t.x, t.y - threatRadius - 4);
        ctx.restore();
      }

      // Update & Render Boss Glitch Overlord
      if (bossRef.current.active) {
        const boss = bossRef.current;
        boss.angle += 0.02;
        boss.x = coreX + Math.sin(boss.angle) * (w * 0.25);

        ctx.save();
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 25;

        // Boss Hexagon Core
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const bAngle = a * (Math.PI / 3) + boss.angle;
          const bx = boss.x + Math.cos(bAngle) * 35;
          const by = boss.y + Math.sin(bAngle) * 35;
          if (a === 0) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Rotating Shield Bits
        for (let s = 0; s < 3; s++) {
          const sAngle = boss.angle * 2 + s * ((Math.PI * 2) / 3);
          const sx = boss.x + Math.cos(sAngle) * 55;
          const sy = boss.y + Math.sin(sAngle) * 55;
          ctx.fillStyle = '#00f2fe';
          ctx.beginPath();
          ctx.arc(sx, sy, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Boss HP Bar
        const barW = 140;
        const barH = 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(boss.x - barW / 2, boss.y - 50, barW, barH);
        ctx.fillStyle = '#ff007f';
        ctx.fillRect(boss.x - barW / 2, boss.y - 50, (boss.health / boss.maxHealth) * barW, barH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(boss.x - barW / 2, boss.y - 50, barW, barH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`TITAN GLITCH [${boss.health}/${boss.maxHealth}]`, boss.x, boss.y - 55);
        ctx.restore();
      }

      // Find closest threat or boss to cursor for Smart Magnetic Reticle Lock
      let lockedTarget: { x: number; y: number; radius: number; isBoss: boolean } | null = null;
      if (bossRef.current.active && Math.hypot(mousePos.x - bossRef.current.x, mousePos.y - bossRef.current.y) < 65) {
        lockedTarget = { x: bossRef.current.x, y: bossRef.current.y, radius: 45, isBoss: true };
      } else {
        let bestDist = 65;
        threatsRef.current.forEach(t => {
          const d = Math.hypot(mousePos.x - t.x, mousePos.y - t.y);
          if (d < bestDist) {
            bestDist = d;
            lockedTarget = { x: t.x, y: t.y, radius: t.radius || 18, isBoss: false };
          }
        });
      }

      // Draw Cursor & Smart Magnetic Targeting Crosshair on Canvas
      ctx.save();
      if (lockedTarget) {
        // High-Tech Animated Magnetic Lock-On Brackets
        const lx = lockedTarget.x;
        const ly = lockedTarget.y;
        const bColor = lockedTarget.isBoss ? '#ff007f' : '#00f2fe';
        ctx.strokeStyle = bColor;
        ctx.lineWidth = 2;
        const bSize = 22;

        // 4 Corner Brackets
        ctx.beginPath(); ctx.moveTo(lx - bSize, ly - bSize + 8); ctx.lineTo(lx - bSize, ly - bSize); ctx.lineTo(lx - bSize + 8, ly - bSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx + bSize - 8, ly - bSize); ctx.lineTo(lx + bSize, ly - bSize); ctx.lineTo(lx + bSize, ly - bSize + 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx - bSize, ly + bSize - 8); ctx.lineTo(lx - bSize, ly + bSize); ctx.lineTo(lx - bSize + 8, ly + bSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx + bSize - 8, ly + bSize); ctx.lineTo(lx + bSize, ly + bSize); ctx.lineTo(lx + bSize, ly + bSize - 8); ctx.stroke();

        // Pulsing lock ring
        ctx.beginPath();
        ctx.arc(lx, ly, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Lock text
        ctx.fillStyle = bColor;
        ctx.font = 'bold 9px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('[ TARGET LOCKED ]', lx, ly - bSize - 4);

        // Faint laser targeting guide beam from core
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(coreX, coreY); ctx.lineTo(lx, ly); ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Sleek Precision Targeting Reticle
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(mousePos.x, mousePos.y, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mousePos.x - 20, mousePos.y); ctx.lineTo(mousePos.x - 5, mousePos.y);
        ctx.moveTo(mousePos.x + 5, mousePos.y); ctx.lineTo(mousePos.x + 20, mousePos.y);
        ctx.moveTo(mousePos.x, mousePos.y - 20); ctx.lineTo(mousePos.x, mousePos.y - 5);
        ctx.moveTo(mousePos.x, mousePos.y + 5); ctx.lineTo(mousePos.x, mousePos.y + 20);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath(); ctx.arc(mousePos.x, mousePos.y, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // Rapid Hold-to-Fire Mechanism (Fires smooth laser bursts when pointer is held down)
      if (isPointerDownRef.current && now - lastShotTimeRef.current >= 120) {
        lastShotTimeRef.current = now;
        fireLaser(mousePosRef.current.x, mousePosRef.current.y);
      }

      // Floating Combat Texts
      for (let f = floatingTextsRef.current.length - 1; f >= 0; f--) {
        const ft = floatingTextsRef.current[f];
        ft.y -= 1.2;
        ft.alpha -= 0.02;

        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = 'bold 12px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();

        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(f, 1);
        }
      }

      // Particle Explosions
      for (let p = particlesRef.current.length - 1; p >= 0; p--) {
        const pt = particlesRef.current[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.03;

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();

        if (pt.alpha <= 0) {
          particlesRef.current.splice(p, 1);
        }
      }
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState, coreHealth, wave, isFrozen, mousePos]);

  // Enhanced Pointing and Shooting Engine with Magnetic Lock and Generous Hitbox
  const fireLaser = (targetX: number, targetY: number) => {
    if (gameState !== 'active') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Start timer on first shot if not already running!
    startLevelTimer();

    const coreX = canvas.width / 2;
    const coreY = canvas.height / 2;

    statsRef.current.totalShots++;
    const now = Date.now();
    const reactionTime = Math.min(750, Math.max(120, now - statsRef.current.lastClickTime));
    statsRef.current.lastClickTime = now;
    statsRef.current.reactionLatencies.push(reactionTime);

    // Check if target is magnetically locked near the pointer
    let aimX = targetX;
    let aimY = targetY;
    let lockedThreatIndex = -1;

    if (bossRef.current.active && Math.hypot(targetX - bossRef.current.x, targetY - bossRef.current.y) < 65) {
      aimX = bossRef.current.x;
      aimY = bossRef.current.y;
    } else {
      let closestDist = 65;
      threatsRef.current.forEach((t, idx) => {
        const d = Math.hypot(targetX - t.x, targetY - t.y);
        if (d < closestDist) {
          closestDist = d;
          aimX = t.x;
          aimY = t.y;
          lockedThreatIndex = idx;
        }
      });
    }

    // High-Intensity Twin Laser Cannons with plasma core
    const beamColor = combo >= 5 ? '#ff007f' : combo >= 2 ? '#ffaa00' : '#00f2fe';
    laserBeamsRef.current.push({
      x1: coreX - 8,
      y1: coreY,
      x2: aimX,
      y2: aimY,
      alpha: 1,
      color: beamColor
    });
    laserBeamsRef.current.push({
      x1: coreX + 8,
      y1: coreY,
      x2: aimX,
      y2: aimY,
      alpha: 1,
      color: '#ffffff'
    });

    soundFX.playLaser();

    // Muzzle flash particle burst at core
    spawnExplosion(coreX, coreY, beamColor, 5);

    let hitSomething = false;

    // Check hit on Boss
    if (bossRef.current.active) {
      const bdx = aimX - bossRef.current.x;
      const bdy = aimY - bossRef.current.y;
      if (Math.hypot(bdx, bdy) < 55) {
        hitSomething = true;
        bossRef.current.health--;
        soundFX.playWarning();

        spawnExplosion(aimX, aimY, '#ff007f', 16);

        floatingTextsRef.current.push({
          id: Math.random().toString(),
          x: aimX,
          y: aimY - 15,
          text: `CRITICAL BURST! BOSS HP: ${bossRef.current.health}`,
          color: '#ff007f',
          alpha: 1
        });

        if (bossRef.current.health <= 0) {
          bossRef.current.active = false;
          soundFX.playSuccess();
          setScore(prev => prev + 1500);
          advanceLevel(currentConfig.maxScore, adaptationStats.accuracyPct, 'Titan Glitch Overlord Neutralized');
        }
      }
    }

    // Check hit on Regular Threats (with generous burst radius)
    if (!hitSomething) {
      for (let i = threatsRef.current.length - 1; i >= 0; i--) {
        const t = threatsRef.current[i];
        const dist = Math.hypot(aimX - t.x, aimY - t.y);
        const hitRadius = (t.radius || 18) + 26; // Generous satisfying burst radius!

        if (dist <= hitRadius || i === lockedThreatIndex) {
          hitSomething = true;
          threatsRef.current.splice(i, 1);

          statsRef.current.hits++;
          statsRef.current.comboCount++;
          const newCombo = statsRef.current.comboCount;
          setCombo(newCombo);

          const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
          const pointsEarned = 100 * multiplier;
          setScore(prev => prev + pointsEarned);

          soundFX.playClick(420 + Math.min(newCombo * 50, 400));
          spawnExplosion(t.x, t.y, t.color || '#00f2fe', 18);

          floatingTextsRef.current.push({
            id: Math.random().toString(),
            x: t.x,
            y: t.y - 12,
            text: newCombo >= 3 ? `+${pointsEarned} [COMBO x${multiplier}!]` : `+${pointsEarned}`,
            color: newCombo >= 3 ? '#ffaa00' : '#00ff88',
            alpha: 1
          });

          updateAIAdaptation();

          // Check wave escalation milestones
          const totalHits = statsRef.current.hits;
          if (currentLevel === 1 && totalHits >= 6) {
            advanceLevel(currentConfig.maxScore, adaptationStats.accuracyPct, 'Wave 1: Probes Neutralized');
          } else if (currentLevel === 2 && totalHits >= 13) {
            advanceLevel(currentConfig.maxScore, adaptationStats.accuracyPct, 'Wave 2: Botnet Severed');
          } else if (currentLevel === 3 && totalHits >= 21) {
            advanceLevel(currentConfig.maxScore, adaptationStats.accuracyPct, 'Wave 3: Decryption Stopped');
          } else if (currentLevel === 4 && totalHits >= 30) {
            advanceLevel(currentConfig.maxScore, adaptationStats.accuracyPct, 'Wave 4: Trojans Purged');
          }
          break;
        }
      }
    }

    if (!hitSomething) {
      statsRef.current.comboCount = 0;
      setCombo(0);
    }
  };

  const spawnExplosion = (x: number, y: number, color: string, count: number) => {
    for (let p = 0; p < count; p++) {
      const pAngle = Math.random() * Math.PI * 2;
      const pSpeed = 1.5 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(pAngle) * pSpeed,
        vy: Math.sin(pAngle) * pSpeed,
        alpha: 1,
        color,
        size: 2 + Math.random() * 3
      });
    }
  };

  const triggerEMP = () => {
    if (empCharges <= 0) return;
    setEmpCharges(prev => prev - 1);
    soundFX.playWarp();

    const canvas = canvasRef.current;
    if (canvas) {
      shockwavesRef.current.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        maxRadius: Math.max(canvas.width, canvas.height) * 0.7,
        alpha: 1
      });
    }

    const threatsDestroyed = threatsRef.current.length;
    threatsRef.current.forEach(t => spawnExplosion(t.x, t.y, '#00f2fe', 12));
    threatsRef.current = [];

    setScore(prev => prev + threatsDestroyed * 150);
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x: canvas ? canvas.width / 2 : 400,
      y: canvas ? canvas.height / 2 - 40 : 200,
      text: `💥 EMP DETONATED! CLEARED ${threatsDestroyed} GLITCHES`,
      color: '#00f2fe',
      alpha: 1
    });
  };

  const triggerFreeze = () => {
    if (freezeCharges <= 0) return;
    setFreezeCharges(prev => prev - 1);
    soundFX.playScan();
    setIsFrozen(true);
    freezeTimerRef.current = Date.now() + 4000;

    const canvas = canvasRef.current;
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x: canvas ? canvas.width / 2 : 400,
      y: canvas ? canvas.height / 2 - 40 : 200,
      text: '❄ CHRONO FREEZE ENGAGED (4.0s SLOW-MO)',
      color: '#00f2fe',
      alpha: 1
    });
  };

  const triggerRepair = () => {
    if (shieldCharges <= 0) return;
    setShieldCharges(prev => prev - 1);
    soundFX.playSuccess();
    setCoreHealth(prev => Math.min(100, prev + 35));

    const canvas = canvasRef.current;
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x: canvas ? canvas.width / 2 : 400,
      y: canvas ? canvas.height / 2 - 40 : 200,
      text: '🛡 NANO REPAIR COMPLETE (+35% HP)',
      color: '#00ff88',
      alpha: 1
    });
  };

  const updateAIAdaptation = () => {
    const hits = statsRef.current.hits;
    const total = statsRef.current.totalShots;
    const acc = total > 0 ? Math.round((hits / total) * 100) : 100;

    const latencies = statsRef.current.reactionLatencies;
    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 390;

    let newDiff = 1;
    let alertMsg = 'SWARM PHASE 1: Tracking initial player aim...';

    if (acc > 80 && avgLatency < 450) {
      newDiff = 3;
      alertMsg = 'MUTATION ESCALATED: High player reflex detected. Mutating evasive trojans!';
    } else if (acc > 65) {
      newDiff = 2;
      alertMsg = 'SWARM ESCALATED: Core under pressure. Deploying infiltrators!';
    }

    setAdaptationStats({
      reactionTimeMs: avgLatency,
      accuracyPct: acc,
      threatsNeutralized: hits,
      difficultyLevel: newDiff,
      aiAggressionLevel: 1.0 + newDiff * 0.4,
      riskTolerance: avgLatency < 380 ? 'Hyper-Aggressive' : acc > 80 ? 'Balanced' : 'Cautious'
    });
    setAiAdaptiveAlert(alertMsg);
  };

  const handleGameOver = () => {
    soundFX.playAlert();
    timeoutLevel(Math.round(currentConfig.maxScore * 0.4), 40, 'Core Defense Overloaded');
  };

  const handleGameWin = () => {
    soundFX.playSuccess();
    advanceLevel(currentConfig.maxScore, adaptationStats.accuracyPct, 'Quantum Core Secured');
  };

  const finalizeSouvenir = () => {
    advanceLevel(currentConfig.maxScore, adaptationStats.accuracyPct, 'Mission Concluded');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col pt-20 pb-4 px-3 sm:px-6 space-bg select-none font-display">
      <div className="scanlines absolute inset-0 z-10 pointer-events-none" />

      {/* TOP ARENA HUD HEADER */}
      <div className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full mb-2 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-pink-950/70 border border-pink-500/50 text-pink-400 shadow-[0_0_15px_rgba(255,0,127,0.3)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-pink-400 uppercase tracking-widest font-bold">
              AI DEFENDER // QUANTUM CORE DEFENSE
            </div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-wider">
              WAVE {wave}/3 • SCORE: <span className="text-cyan-300">{score}</span>
            </h2>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {combo >= 2 && (
            <div className="px-3 py-1 rounded-xl bg-amber-950/90 border border-amber-500 text-amber-300 font-bold animate-pulse shadow-[0_0_15px_#ffaa00]">
              🔥 {combo}X COMBO!
            </div>
          )}
          <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300">
            ACCURACY: <span className="text-cyan-400 font-bold">{adaptationStats.accuracyPct}%</span>
          </div>
        </div>
      </div>

      {/* CENTER ARENA CANVAS CONTAINER */}
      <div 
        ref={containerRef}
        className="relative z-20 flex-1 max-w-7xl mx-auto w-full rounded-2xl overflow-hidden border-2 border-pink-500/40 bg-slate-950 shadow-[0_0_40px_rgba(255,0,127,0.2)]"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            isPointerDownRef.current = true;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            mousePosRef.current = { x, y };
            setMousePos({ x, y });
            fireLaser(x, y);
          }}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            mousePosRef.current = { x, y };
            setMousePos({ x, y });
          }}
          onPointerUp={() => {
            isPointerDownRef.current = false;
          }}
          onPointerLeave={() => {
            isPointerDownRef.current = false;
          }}
          className="w-full h-full block cursor-crosshair touch-none select-none"
        />

        {/* BRIEFING OVERLAY IF BRIEFING STATE */}
        {gameState === 'briefing' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6">
            <div className="w-full max-w-lg rounded-2xl hologram-panel border-2 border-pink-500 p-6 shadow-2xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-pink-950 border border-pink-400 text-pink-400 flex items-center justify-center mx-auto shadow-lg">
                <Target className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <div className="text-[11px] font-mono text-pink-400 font-bold uppercase tracking-widest">
                  MISSION METHODOLOGY & GAMEPLAY GUIDE
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mt-1">
                  DEFEND THE QUANTUM CORE
                </h3>
              </div>

              {/* 3 Step Instructions */}
              <div className="text-left space-y-2.5 font-mono text-xs text-slate-300 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-start space-x-2.5">
                  <span className="text-pink-400 font-bold">1. AIM & CLICK:</span>
                  <span>Click or tap incoming rogue glitches to blast them with the core laser before they reach the center.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="text-amber-400 font-bold">2. CHAIN COMBOS:</span>
                  <span>Hit glitches consecutively without missing to activate score multipliers (x2, x3, x5!).</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="text-cyan-400 font-bold">3. 3 SUPER POWERS:</span>
                  <span>Deploy EMP shockwave ([SPACE]), Freeze ([F]), or Nano Repair ([R]) when swarmed!</span>
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-400 hover:from-pink-400 hover:to-cyan-300 text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(255,0,127,0.5)] transition-transform active:scale-98"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>START CORE DEFENSE</span>
              </button>
            </div>
          </div>
        )}

        {/* In-Game Telemetry Bar Banner */}
        <div className="absolute top-3 inset-x-4 flex items-center justify-between pointer-events-none text-xs font-mono">
          <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-300 flex items-center space-x-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{aiAdaptiveAlert}</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-pink-500/40 text-pink-300 font-bold">
            NEURAL LATENCY: {adaptationStats.reactionTimeMs}ms
          </div>
        </div>
      </div>

      {/* BOTTOM TACTILE ABILITY BAR */}
      <div className="relative z-20 max-w-7xl mx-auto w-full mt-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Core Integrity Bar */}
        <div className="flex items-center space-x-3 bg-slate-950/90 p-2 rounded-xl border border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-300">CORE HP:</span>
          <div className="w-32 sm:w-48 h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${coreHealth > 40 ? 'bg-emerald-400' : 'bg-pink-500 animate-pulse'}`}
              style={{ width: `${coreHealth}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-white">{coreHealth}%</span>
        </div>

        {/* 3 Ability Hotkeys */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={triggerEMP}
            disabled={empCharges <= 0}
            className={`px-3.5 py-2 rounded-xl border flex items-center space-x-1.5 font-bold transition-all ${
              empCharges > 0 
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 hover:bg-cyan-500 hover:text-black shadow-[0_0_15px_rgba(0,242,254,0.3)] cursor-pointer' 
                : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Deploy EMP Shockwave"
          >
            <Bomb className="w-4 h-4" />
            <span>EMP BLAST [SPACE] ({empCharges})</span>
          </button>

          <button
            onClick={triggerFreeze}
            disabled={freezeCharges <= 0}
            className={`px-3.5 py-2 rounded-xl border flex items-center space-x-1.5 font-bold transition-all ${
              freezeCharges > 0 
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 hover:bg-cyan-500 hover:text-black shadow-[0_0_15px_rgba(0,242,254,0.3)] cursor-pointer' 
                : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Freeze Threats in Slow Motion"
          >
            <Snowflake className="w-4 h-4" />
            <span>CHRONO FREEZE [F] ({freezeCharges})</span>
          </button>

          <button
            onClick={triggerRepair}
            disabled={shieldCharges <= 0}
            className={`px-3.5 py-2 rounded-xl border flex items-center space-x-1.5 font-bold transition-all ${
              shieldCharges > 0 
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 hover:bg-emerald-500 hover:text-black shadow-[0_0_15px_rgba(0,255,136,0.3)] cursor-pointer' 
                : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Emergency Core Repair"
          >
            <ShieldPlus className="w-4 h-4" />
            <span>NANO REPAIR [R] ({shieldCharges})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
