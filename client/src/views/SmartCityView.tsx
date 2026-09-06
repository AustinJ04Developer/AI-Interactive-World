import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Building2, 
  Target, 
  Sparkles, 
  Zap, 
  Camera, 
  Navigation, 
  Gauge, 
  Flame, 
  Radio, 
  Eye, 
  ChevronRight, 
  MessageSquare, 
  Mic, 
  Send, 
  Volume2,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import type { CityNPC, CitySector, SouvenirData, LevelResult } from '../types';
import { aiService } from '../services/aiService';
import { soundFX } from '../services/audioService';
import { CityMiniMap, type CityTarget } from '../components/city/CityMiniMap';
import { useLevelTimer, type LevelConfig } from '../hooks/useLevelTimer';

interface SmartCityViewProps {
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

const SECTORS: CitySector[] = [
  { id: 'sector-ai', name: 'AI Research Hub', description: 'Quantum computing labs and autonomous neural nodes', color: '#00f2fe', coordinates: [0, 0, 0] },
  { id: 'sector-health', name: 'Smart Hospital District', description: 'Nanomedicine clinics and preventative biometrics', color: '#00ff88', coordinates: [-22, 0, 18] },
  { id: 'sector-farm', name: 'Vertical Agro-Dome', description: 'Hydroponic towers supplying 100% organic city nourishment', color: '#84cc16', coordinates: [20, 0, 22] },
  { id: 'sector-energy', name: 'Fusion Grid Station', description: 'Atmospheric quantum energy harvesters & plasma storage', color: '#ffaa00', coordinates: [24, 0, -22] },
  { id: 'sector-police', name: 'Municipal Safety AI Core', description: 'Autonomous emergency coordination and disaster mitigation', color: '#3b82f6', coordinates: [-24, 0, -20] }
];

const SEARCH_TARGETS: CityTarget[] = [
  {
    id: 'target-energy',
    title: 'Quantum Plasma Relic',
    sectorName: 'Fusion Grid Station',
    description: 'An overcharged clean plasma cell providing continuous power to Sector Energy.',
    position: [24, 1.5, -22],
    color: '#ffaa00',
    rewardPoints: 250
  },
  {
    id: 'target-health',
    title: 'Nanomedical Cryo-Pod',
    sectorName: 'Smart Hospital District',
    description: 'Autonomous medical stasis cache carrying molecular health re-sequencers.',
    position: [-22, 1.5, 18],
    color: '#00ff88',
    rewardPoints: 250
  },
  {
    id: 'target-farm',
    title: 'Bio-Synthetic Seed Archive',
    sectorName: 'Vertical Agro-Dome',
    description: 'Next-generation hydroponic genetic seeds resistant to extreme planetary climates.',
    position: [20, 1.5, 22],
    color: '#84cc16',
    rewardPoints: 250
  },
  {
    id: 'target-safety',
    title: 'Sentinel AI Overdrive Node',
    sectorName: 'Municipal Safety AI Core',
    description: 'Predictive civic safety node coordinating autonomous accident mitigation drones.',
    position: [-24, 1.5, -20],
    color: '#3b82f6',
    rewardPoints: 250
  },
  {
    id: 'target-monument',
    title: 'Central Metropolitan Monument',
    sectorName: 'AI Research Hub',
    description: 'Grand civic monument where city telemetry is permanently archived.',
    position: [0, 2.0, 0],
    color: '#00f2fe',
    rewardPoints: 500
  }
];

const NPCS: CityNPC[] = [
  {
    id: 'npc-doctor',
    name: 'Dr. Lyra Chen',
    role: 'Autonomous Medicine Lead',
    sectorId: 'sector-health',
    personality: 'Compassionate, analytical, optimistic',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    dialogueGreeting: 'Greetings Explorer! In Smart City 2050, disease is predicted months before symptoms appear.',
    responses: {
      'cure': 'Our cellular re-sequencing monitors eliminate viral anomalies within minutes of detection.',
      'health': 'Every citizen has a non-invasive biometric telemetry twin guiding nutrition and rest.'
    },
    position: [-20, 1, 16]
  },
  {
    id: 'npc-farmer',
    name: 'Kaelen Vance',
    role: 'Agro-Ecology Director',
    sectorId: 'sector-farm',
    personality: 'Pragmatic, grounded, innovative',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    dialogueGreeting: 'Welcome to the vertical bio-domes! We cultivate nutrient produce using zero soil and 95% recycled moisture.',
    responses: {
      'water': 'We capture moisture directly from clouds and morning marine fog layers.',
      'food': 'Genetic optimization ensures all produce is rich in vital micronutrients.'
    },
    position: [18, 1, 20]
  },
  {
    id: 'npc-energy',
    name: 'Dr. Soren Ray',
    role: 'Plasma Grid Controller',
    sectorId: 'sector-energy',
    personality: 'Visionary, technical, focused',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    dialogueGreeting: 'Look up at the sky rings! That is our decentralized magnetic fusion matrix powering 12 million homes.',
    responses: {
      'power': 'Clean plasma magnetic containment has solved our energy storage problem permanently.',
      'solar': 'Our transparent solar skyscraper glass absorbs ultraviolet light across every window.'
    },
    position: [22, 1, -20]
  },
  {
    id: 'npc-police',
    name: 'Sentinel AXIOM-9',
    role: 'Safety & Mobility Coordinator',
    sectorId: 'sector-police',
    personality: 'Calm, authoritative, helpful',
    avatar: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&auto=format&fit=crop&q=80',
    dialogueGreeting: 'Citizen status verified: Welcome Explorer. Traffic accidents have been reduced to 0.00% by automated transit.',
    responses: {
      'traffic': 'Autonomous aerial skypods synchronize trajectories down to the millisecond.',
      'safety': 'Predictive civic safety alerts coordinate emergency drones before incidents can escalate.'
    },
    position: [-22, 1, -18]
  }
];

const CITY_LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, label: 'Sector 1: Fusion Grid Station', timeBudgetSec: 45, maxScore: 100 },
  { level: 2, label: 'Sector 2: Smart Hospital District', timeBudgetSec: 55, maxScore: 150 },
  { level: 3, label: 'Sector 3: Vertical Agro-Dome', timeBudgetSec: 65, maxScore: 200 },
  { level: 4, label: 'Sector 4: Municipal Safety AI Core', timeBudgetSec: 65, maxScore: 250 },
  { level: 5, label: 'Sector 5: Central Metropolitan Monument', timeBudgetSec: 70, maxScore: 300 },
];

export const SmartCityView: React.FC<SmartCityViewProps> = ({
  visitorPhotoUrl,
  visitorName = 'Cadet Alex',
  onComplete,
  onExit,
  onHudUpdate
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Vehicle Simulation & Location State
  const [playerPos, setPlayerPos] = useState<{ x: number; z: number }>({ x: 0, z: 12 });
  const [playerYaw, setPlayerYaw] = useState<number>(0);
  const [speedKmH, setSpeedKmH] = useState<number>(0);
  const [nitroFuel, setNitroFuel] = useState<number>(100);
  const [isNitroActive, setIsNitroActive] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'chase' | 'cockpit' | 'drone'>('chase');

  // Multi-Stage Target Search System
  const [foundTargets, setFoundTargets] = useState<string[]>([]);
  const [targetPromptAlert, setTargetPromptAlert] = useState<string | null>(null);
  const [atTargetProximity, setAtTargetProximity] = useState<boolean>(false);
  const [explorerPoints, setExplorerPoints] = useState<number>(450);
  const [activeNPC, setActiveNPC] = useState<CityNPC | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showIntercom, setShowIntercom] = useState<boolean>(false);

  // Universal 5-Level Timer Scaffolding Integration
  const handleSessionComplete = useCallback((results: LevelResult[], finalScore: number) => {
    soundFX.playShutter();
    const totalScoreVal = finalScore + 350;
    const earnedBadge = results.filter(r => r.completedBeforeTimeout).length >= 4;
    const souvenirData: SouvenirData = {
      experienceId: 'smart-city',
      experienceTitle: 'SMART CITY 2026 // EXPLORER DOSSIER',
      experienceSubtitle: 'CIVIC NEURAL TELEMETRY ARCHIVE',
      visitorName,
      visitorPhotoUrl: visitorPhotoUrl || '',
      score: totalScoreVal,
      achievements: ['Grand City Explorer', 'Autonomous Navigator', 'Zero-Emission Racer', 'Neural Grid Master'],
      metrics: [
        { label: 'SECTORS CONNECTED', value: `${foundTargets.length} / 5 DISTRICTS` },
        { label: 'TRANSIT EFFICIENCY', value: `${Math.min(99, 82 + results.length * 3.2)}%` },
        { label: 'EXPLORATION XP', value: `+${explorerPoints} XP` },
        { label: 'NETWORK STATUS', value: 'OPTIMAL (NET-ZERO)' }
      ],
      aiAnalysis: `Autonomous vehicular exploration logged flawless trajectory across all 5 municipal sectors. Telemetry corroborates ${foundTargets.length} civil telemetry handshakes, maintaining net-zero power drain.`,
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sessionId: 'CTY-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      badge: earnedBadge ? 'MASTER URBAN PLANNER' : 'CIVIC EXPLORER',
      themeColor: '#00ff88',
      levelResults: results
    };

    setTimeout(() => {
      onComplete(souvenirData);
    }, 1500);
  }, [foundTargets.length, explorerPoints, visitorName, visitorPhotoUrl, onComplete]);

  const {
    currentLevel,
    timeRemainingInLevel,
    currentConfig,
    transitionInfo,
    totalScore,
    advanceLevel,
    startTimer,
    isTimerStarted
  } = useLevelTimer(CITY_LEVEL_CONFIGS, handleSessionComplete);

  const targetIndex = Math.min(currentLevel - 1, SEARCH_TARGETS.length - 1);

  // Sync Level HUD with GlobalHUD
  useEffect(() => {
    if (onHudUpdate) {
      onHudUpdate({
        level: currentLevel,
        timeRemaining: timeRemainingInLevel,
        timeBudget: currentConfig.timeBudgetSec,
        transitionInfo,
        score: totalScore + explorerPoints
      });
    }
  }, [currentLevel, timeRemainingInLevel, currentConfig, transitionInfo, totalScore, explorerPoints, onHudUpdate]);

  // Virtual Controls input states for mouse/touch
  const virtualControlsRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    nitro: false,
    handbrake: false
  });

  const currentTarget = SEARCH_TARGETS[targetIndex];

  // Three.js & Vehicle Physics Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040816, 0.022);

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2e4a, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 0.9);
    dirLight.position.set(30, 60, 30);
    scene.add(dirLight);

    // City Ground & Grid Roadways
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050d1a,
      roughness: 0.85,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    const grid = new THREE.GridHelper(140, 70, 0x00f2fe, 0x07223b);
    grid.position.y = 0.02;
    scene.add(grid);

    // Neon City Roads (Cross Arteries)
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    const createRoadStrip = (w: number, l: number, x: number, z: number, rotY: number = 0) => {
      const roadGeo = new THREE.PlaneGeometry(w, l);
      const roadMat = new THREE.MeshBasicMaterial({ color: 0x081729 });
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.rotation.z = rotY;
      roadMesh.position.set(x, 0.03, z);
      roadGroup.add(roadMesh);

      // Glowing Center Line
      const lineGeo = new THREE.PlaneGeometry(0.3, l);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.rotation.z = rotY;
      lineMesh.position.set(x, 0.04, z);
      roadGroup.add(lineMesh);
    };

    // Major Avenues
    createRoadStrip(8, 140, 0, 0, 0); // North-South
    createRoadStrip(8, 140, 0, 0, Math.PI / 2); // East-West
    createRoadStrip(6, 120, 20, 0, 0);
    createRoadStrip(6, 120, -20, 0, 0);
    createRoadStrip(6, 120, 0, 20, Math.PI / 2);
    createRoadStrip(6, 120, 0, -20, Math.PI / 2);

    // Procedural Futuristic Skyscrapers (Organized into civic blocks with clear corridors)
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const buildingColors = [0x061933, 0x082447, 0x0c3359, 0x051d38];
    const buildingBoxes: THREE.Box3[] = [];

    // Clear urban zones: 36 sleek towers arranged with guaranteed open boulevards
    for (let i = 0; i < 38; i++) {
      const h = 10 + Math.random() * 28;
      const w = 3.5 + Math.random() * 3.5;
      const d = 3.5 + Math.random() * 3.5;

      const x = (Math.random() - 0.5) * 105;
      const z = (Math.random() - 0.5) * 105;

      // 1. Guaranteed Clearance around ALL 5 Search Target Plazas (At least 15m open zone)
      const nearTarget = SEARCH_TARGETS.some(t => Math.hypot(x - t.position[0], z - t.position[2]) < 15);
      if (nearTarget) continue;

      // 2. Guaranteed Clearance around ALL AI Citizens / NPCs (At least 12m open zone)
      const nearNPC = NPCS.some(npc => Math.hypot(x - npc.position[0], z - npc.position[2]) < 12);
      if (nearNPC) continue;

      // 3. Keep Initial Vehicle Spawn & Central Plaza wide open
      if (Math.hypot(x, z - 12) < 12 || (Math.abs(x) < 9 && Math.abs(z) < 9)) continue;

      // 4. Keep Main Avenues and Transit Boulevards open
      if (Math.abs(x) < 7 || Math.abs(z) < 7) continue;
      if (Math.abs(x - 20) < 6 || Math.abs(x + 20) < 6) continue;
      if (Math.abs(z - 20) < 6 || Math.abs(z + 20) < 6) continue;

      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        roughness: 0.35,
        metalness: 0.65
      });
      const bMesh = new THREE.Mesh(geo, mat);
      bMesh.position.set(x, h / 2, z);
      buildingGroup.add(bMesh);

      // Add neon window accents
      const neonTrimGeo = new THREE.BoxGeometry(w * 0.95, 0.4, d * 0.95);
      const neonTrimMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.4 ? 0x00f2fe : (Math.random() > 0.5 ? 0x00ff88 : 0xffaa00)
      });
      const neonTrim = new THREE.Mesh(neonTrimGeo, neonTrimMat);
      neonTrim.position.set(x, h + 0.2, z);
      buildingGroup.add(neonTrim);

      buildingBoxes.push(new THREE.Box3().setFromObject(bMesh));
    }

    // Sector District Landmarks & Billboards
    SECTORS.forEach((sec) => {
      const pylonGeo = new THREE.CylinderGeometry(0.6, 1.2, 8, 8);
      const pylonMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(sec.color),
        emissive: new THREE.Color(sec.color),
        emissiveIntensity: 0.5,
        wireframe: true
      });
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(sec.coordinates[0], 4, sec.coordinates[2]);
      scene.add(pylon);
    });

    // 3D Player Cyber Hovercar Model
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Car Chassis
    const chassisGeo = new THREE.BoxGeometry(1.6, 0.5, 3.2);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x021324,
      metalness: 0.85,
      roughness: 0.2
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.45;
    carGroup.add(chassis);

    // Cockpit Canopy (Glowing glass)
    const canopyGeo = new THREE.BoxGeometry(1.2, 0.4, 1.5);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x006688,
      emissiveIntensity: 0.3
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.8, -0.2);
    carGroup.add(canopy);

    // Neon Trim Stripes
    const stripeGeo = new THREE.BoxGeometry(1.65, 0.08, 3.1);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.45;
    carGroup.add(stripe);

    // Rear Plasma Thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const thrusterL = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterL.rotation.x = Math.PI / 2;
    thrusterL.position.set(-0.5, 0.45, 1.6);
    carGroup.add(thrusterL);

    const thrusterR = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterR.rotation.x = Math.PI / 2;
    thrusterR.position.set(0.5, 0.45, 1.6);
    carGroup.add(thrusterR);

    // Forward Headlights & Spotlights
    const headlightL = new THREE.SpotLight(0x00f2fe, 5, 28, Math.PI / 6, 0.4);
    headlightL.position.set(-0.6, 0.5, -1.6);
    headlightL.target.position.set(-0.6, 0.2, -18);
    carGroup.add(headlightL);
    carGroup.add(headlightL.target);

    const headlightR = new THREE.SpotLight(0x00f2fe, 5, 28, Math.PI / 6, 0.4);
    headlightR.position.set(0.6, 0.5, -1.6);
    headlightR.target.position.set(0.6, 0.2, -18);
    carGroup.add(headlightR);
    carGroup.add(headlightR.target);

    // Underglow Pointlight
    const underglow = new THREE.PointLight(0x00ff88, 3, 5);
    underglow.position.set(0, 0.1, 0);
    carGroup.add(underglow);

    // Initial Car Spawn
    carGroup.position.set(0, 0.2, 12);

    // 3D Skyway Beacon for Target (Sky beam visible across the whole city!)
    const beaconGroup = new THREE.Group();
    scene.add(beaconGroup);

    // Light pillar
    const beamGeo = new THREE.CylinderGeometry(0.5, 0.8, 45, 12, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 22.5;
    beaconGroup.add(beam);

    // Holographic Target Orb
    const orbGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      wireframe: true
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 2.5;
    beaconGroup.add(orb);

    // Pulsing Ground Wave Ring
    const ringGeo = new THREE.RingGeometry(1.5, 2.2, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const groundRing = new THREE.Mesh(ringGeo, ringMat);
    groundRing.rotation.x = -Math.PI / 2;
    groundRing.position.y = 0.06;
    beaconGroup.add(groundRing);

    // Flying Autonomous Skyway Traffic
    const trafficGroup = new THREE.Group();
    scene.add(trafficGroup);
    const vehicles: { mesh: THREE.Mesh; speed: number; axis: 'x' | 'z'; dir: number }[] = [];

    for (let v = 0; v < 18; v++) {
      const vGeo = new THREE.BoxGeometry(0.9, 0.3, 1.8);
      const vMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00f2fe : 0x00ff88 });
      const vMesh = new THREE.Mesh(vGeo, vMat);
      const isAltX = Math.random() > 0.5;
      vMesh.position.set(
        (Math.random() - 0.5) * 80,
        5 + Math.random() * 10,
        (Math.random() - 0.5) * 80
      );
      trafficGroup.add(vMesh);
      vehicles.push({
        mesh: vMesh,
        speed: 0.2 + Math.random() * 0.2,
        axis: isAltX ? 'x' : 'z',
        dir: Math.random() > 0.5 ? 1 : -1
      });
    }

    // Keyboard state
    const keys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'c') {
        setCameraMode(prev => (prev === 'chase' ? 'cockpit' : prev === 'cockpit' ? 'drone' : 'chase'));
        soundFX.playClick();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Physics state
    let speed = 0;
    let yaw = 0;
    let roll = 0;
    let currentNitro = 100;

    soundFX.startEngine();

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Main Game & Driving Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Check inputs: Keyboard OR Virtual buttons
      const virt = virtualControlsRef.current;
      const isAccelerating = keys['w'] || keys['arrowup'] || virt.forward;
      const isReversing = keys['s'] || keys['arrowdown'] || virt.backward;
      const isSteeringLeft = keys['a'] || keys['arrowleft'] || virt.left;
      const isSteeringRight = keys['d'] || keys['arrowright'] || virt.right;
      const isDrifting = keys[' '] || virt.handbrake;
      const wantsNitro = (keys['shift'] || virt.nitro) && currentNitro > 5;

      // Timer starts ONLY when player actually begins moving / controlling the vehicle!
      if (isAccelerating || isReversing || isSteeringLeft || isSteeringRight) {
        startTimer();
      }

      // Nitro handling
      let nitroActive = false;
      if (wantsNitro && isAccelerating) {
        nitroActive = true;
        currentNitro = Math.max(0, currentNitro - dt * 28);
        thrusterL.scale.set(1.4, 2.0, 1.4);
        thrusterR.scale.set(1.4, 2.0, 1.4);
        underglow.color.setHex(0xffaa00);
      } else {
        currentNitro = Math.min(100, currentNitro + dt * 10);
        thrusterL.scale.set(1, 1, 1);
        thrusterR.scale.set(1, 1, 1);
        underglow.color.setHex(0x00ff88);
      }
      setIsNitroActive(nitroActive);
      setNitroFuel(Math.round(currentNitro));

      // Acceleration & Top Speed (Playable arcade feel!)
      const maxForwardSpeed = nitroActive ? 0.72 : 0.42;
      const maxReverseSpeed = -0.22;
      const accelRate = nitroActive ? 0.58 : 0.35;
      const dragRate = isDrifting ? 0.45 : 0.20;

      if (isAccelerating) {
        speed = Math.min(maxForwardSpeed, speed + accelRate * dt);
      } else if (isReversing) {
        speed = Math.max(maxReverseSpeed, speed - accelRate * dt);
      } else {
        // Natural friction/drag deceleration
        if (speed > 0) speed = Math.max(0, speed - dragRate * dt);
        if (speed < 0) speed = Math.min(0, speed + dragRate * dt);
      }

      // Steering with drift dynamics
      const steerSensitivity = isDrifting ? 2.6 : 1.9;
      if (Math.abs(speed) > 0.01) {
        const steerDir = speed >= 0 ? 1 : -1;
        if (isSteeringLeft) {
          yaw += steerSensitivity * dt * steerDir;
          roll = THREE.MathUtils.lerp(roll, 0.18, dt * 8);
        } else if (isSteeringRight) {
          yaw -= steerSensitivity * dt * steerDir;
          roll = THREE.MathUtils.lerp(roll, -0.18, dt * 8);
        } else {
          roll = THREE.MathUtils.lerp(roll, 0, dt * 8);
        }
      } else {
        roll = THREE.MathUtils.lerp(roll, 0, dt * 8);
      }

      // Update Car Position & Rotation
      const forwardVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      carGroup.position.addScaledVector(forwardVec, speed);

      // Smooth Obstacle & Building Sliding Collision Response (Never gets boxed in or stuck)
      const carRadius = 1.4;
      for (const box of buildingBoxes) {
        if (
          carGroup.position.x + carRadius > box.min.x &&
          carGroup.position.x - carRadius < box.max.x &&
          carGroup.position.z + carRadius > box.min.z &&
          carGroup.position.z - carRadius < box.max.z
        ) {
          const penLeft = (carGroup.position.x + carRadius) - box.min.x;
          const penRight = box.max.x - (carGroup.position.x - carRadius);
          const penBack = (carGroup.position.z + carRadius) - box.min.z;
          const penFront = box.max.z - (carGroup.position.z - carRadius);
          const minPen = Math.min(penLeft, penRight, penBack, penFront);

          if (minPen === penLeft) carGroup.position.x = box.min.x - carRadius;
          else if (minPen === penRight) carGroup.position.x = box.max.x + carRadius;
          else if (minPen === penBack) carGroup.position.z = box.min.z - carRadius;
          else carGroup.position.z = box.max.z + carRadius;

          speed *= 0.65; // Soft deflection instead of stopping
        }
      }

      // Clamp within city arena bounds
      carGroup.position.x = THREE.MathUtils.clamp(carGroup.position.x, -58, 58);
      carGroup.position.z = THREE.MathUtils.clamp(carGroup.position.z, -58, 58);
      // Hover bobbing effect
      carGroup.position.y = 0.25 + Math.sin(now * 0.006) * 0.04;

      carGroup.rotation.y = yaw;
      carGroup.rotation.z = roll;

      // Update audio synthesis in real time
      const speedRatio = Math.abs(speed) / 0.42;
      soundFX.updateEngine(speedRatio, nitroActive);

      // Calculate km/h for HUD
      const calculatedKmH = Math.round(Math.abs(speed) * 220);
      setSpeedKmH(calculatedKmH);
      setPlayerPos({ x: carGroup.position.x, z: carGroup.position.z });
      setPlayerYaw(yaw);

      // Dynamic Camera Views (Realistic YouTube Playables camera)
      if (cameraMode === 'chase') {
        const camOffset = new THREE.Vector3(0, 2.8, 6.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const targetCamPos = carGroup.position.clone().add(camOffset);
        camera.position.lerp(targetCamPos, dt * 7);
        const lookAtPos = carGroup.position.clone().add(new THREE.Vector3(0, 1.2, 0)).addScaledVector(forwardVec, 3);
        camera.lookAt(lookAtPos);
      } else if (cameraMode === 'cockpit') {
        const hoodPos = carGroup.position.clone().add(new THREE.Vector3(0, 0.9, 0)).addScaledVector(forwardVec, 0.6);
        camera.position.copy(hoodPos);
        const lookAtPos = hoodPos.clone().addScaledVector(forwardVec, 25);
        camera.lookAt(lookAtPos);
      } else {
        // Drone overhead
        camera.position.set(carGroup.position.x, 26, carGroup.position.z + 8);
        camera.lookAt(carGroup.position);
      }

      // Update Active Target 3D Skyway Beacon Position & Animation
      const activeTgt = SEARCH_TARGETS[Math.min(targetIndex, SEARCH_TARGETS.length - 1)];
      if (activeTgt) {
        beaconGroup.position.set(activeTgt.position[0], 0, activeTgt.position[2]);
        beamMat.color.set(new THREE.Color(activeTgt.color));
        orbMat.color.set(new THREE.Color(activeTgt.color));
        orbMat.emissive.set(new THREE.Color(activeTgt.color));
        groundRing.material.color.set(new THREE.Color(activeTgt.color));

        orb.rotation.y += dt * 1.5;
        orb.rotation.x += dt * 0.8;
        beam.rotation.y += dt * 0.4;
        groundRing.scale.setScalar(1 + Math.sin(now * 0.005) * 0.25);

        // Distance check
        const distToTarget = Math.hypot(carGroup.position.x - activeTgt.position[0], carGroup.position.z - activeTgt.position[2]);
        
        // Radar proximity ping
        soundFX.playProximityPing(distToTarget);

        if (distToTarget < 8.0) {
          setAtTargetProximity(true);
        } else {
          setAtTargetProximity(false);
        }
      }

      // Animate Aerial Traffic
      vehicles.forEach(veh => {
        if (veh.axis === 'x') {
          veh.mesh.position.x += veh.speed * veh.dir;
          if (veh.mesh.position.x > 50) veh.mesh.position.x = -50;
          if (veh.mesh.position.x < -50) veh.mesh.position.x = 50;
        } else {
          veh.mesh.position.z += veh.speed * veh.dir;
          if (veh.mesh.position.z > 50) veh.mesh.position.z = -50;
          if (veh.mesh.position.z < -50) veh.mesh.position.z = 50;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      soundFX.stopEngine();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [targetIndex, cameraMode]);

  // Handle Target Retrieval
  const handleRetrieveTarget = () => {
    if (!currentTarget) return;
    soundFX.playTargetFound();

    const targetId = currentTarget.id;
    if (!foundTargets.includes(targetId)) {
      setFoundTargets(prev => [...prev, targetId]);
      setExplorerPoints(prev => prev + currentTarget.rewardPoints);
      setTargetPromptAlert(`✓ OBJECTIVE COMPLETE: Discovered ${currentTarget.title} in ${currentTarget.sectorName}! (+${currentConfig.maxScore} XP)`);

      // Advance to next level via universal scaffolding
      advanceLevel(currentConfig.maxScore, 95, currentTarget.title);
      setTimeout(() => {
        setTargetPromptAlert(null);
      }, 2500);
    }
  };

  // Generate Souvenir Manual Trigger
  const handleGenerateSouvenir = () => {
    soundFX.playShutter();
    // Finish session early or at completion
    advanceLevel(currentConfig.maxScore, 90, 'Mission Finalized');
  };

  // NPC Intercom selection
  const handleSelectNPC = (npc: CityNPC) => {
    soundFX.playClick();
    setActiveNPC(npc);
    setShowIntercom(true);
    setChatMessages([
      { sender: npc.name, text: npc.dialogueGreeting }
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeNPC || isAiResponding) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    soundFX.playClick();

    setChatMessages(prev => [...prev, { sender: 'You', text: userText }]);
    setIsAiResponding(true);
    soundFX.playAIProcess();

    const response = await aiService.talkToCityNPC(activeNPC.name, activeNPC.role, userText);
    setIsAiResponding(false);

    setChatMessages(prev => [...prev, { sender: activeNPC.name, text: response }]);
    setExplorerPoints(prev => prev + 50);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col pt-16 pb-6 px-6 space-bg select-none">
      <div className="scanlines absolute inset-0 z-10 pointer-events-none" />

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* TOP RACING HUD BAR */}
      <div className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full mb-2 pointer-events-none">
        
        {/* Left: City Badge & Sector Status */}
        <div className="flex items-center space-x-3 pointer-events-auto bg-slate-950/80 border border-emerald-500/40 rounded-xl px-4 py-2 backdrop-blur-md">
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 animate-pulse">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-display font-bold text-white tracking-wide">
                SMART CITY 2050
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/50 text-[10px] font-mono text-emerald-300">
                STAGE {targetIndex + 1}/{SEARCH_TARGETS.length}
              </span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">
              OPEN-WORLD EXPLORATION // CYBER SPEEDSTER HUD
            </div>
          </div>
        </div>

        {/* Right: Telemetry, Camera & Intercom Toggles */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          {/* Camera View Mode Switcher */}
          <button
            onClick={() => {
              soundFX.playClick();
              setCameraMode(prev => (prev === 'chase' ? 'cockpit' : prev === 'cockpit' ? 'drone' : 'chase'));
            }}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white font-mono text-xs flex items-center space-x-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Switch Camera Perspective [C]"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="capitalize">{cameraMode} CAM [C]</span>
          </button>

          {/* NPC Intercom Directory Button */}
          <button
            onClick={() => { soundFX.playClick(); setShowIntercom(prev => !prev); }}
            className={`px-3 py-2 rounded-xl border font-mono text-xs flex items-center space-x-1.5 shadow-lg backdrop-blur-md transition-all ${
              showIntercom
                ? 'bg-emerald-500 text-black border-emerald-300 font-bold shadow-[0_0_15px_#00ff88]'
                : 'bg-slate-950/80 border-emerald-500/40 text-emerald-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI CITIZENS [{NPCS.length}]</span>
          </button>

          {/* Score Counter */}
          <div className="px-4 py-2 rounded-xl bg-slate-950/85 border border-emerald-500/40 backdrop-blur-md text-xs font-mono text-slate-200 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '5s' }} />
            <span className="text-emerald-400 font-bold">{explorerPoints} XP</span>
          </div>
        </div>
      </div>

      {/* MISSION TARGET BANNER (YouTube Playables Style Floating Objective) */}
      {currentTarget && (
        <div className="relative z-20 max-w-xl mx-auto w-full mb-1 pointer-events-none animate-in fade-in slide-in-from-top-3">
          <div className="bg-slate-950/90 border border-amber-400/50 rounded-xl px-4 py-2.5 shadow-[0_0_20px_rgba(255,170,0,0.2)] backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <Target className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  MISSION OBJECTIVE // SEARCH THE CITY
                </div>
                <div className="text-xs font-bold text-white font-sans">
                  Locate the <span className="text-amber-300">{currentTarget.title}</span> in <span className="text-emerald-400">{currentTarget.sectorName}</span>
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-[11px]">
              <span className="text-slate-400 text-[9px] block">RADAR BEACON</span>
              <span className="text-amber-300 font-bold">ACTIVE SCAN</span>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS NOTIFICATION POPUP */}
      {targetPromptAlert && (
        <div className="relative z-30 max-w-md mx-auto w-full my-2 pointer-events-none animate-bounce">
          <div className="bg-emerald-950/95 border-2 border-emerald-400 text-emerald-100 px-4 py-3 rounded-xl shadow-[0_0_30px_#00ff88] text-center font-mono text-xs font-bold">
            {targetPromptAlert}
          </div>
        </div>
      )}

      {/* MAIN SCREEN OVERLAYS: RADAR MINIMAP (SIDE), SPEEDOMETER & ON-SCREEN TOUCH/CLICK CONTROLS */}
      <div className="relative z-20 flex-1 flex flex-col justify-between pointer-events-none">
        
        {/* UPPER ROW: NPC INTERCOM MODAL (IF OPEN) */}
        <div className="flex justify-end pointer-events-auto">
          {showIntercom && (
            <div className="w-80 md:w-96 rounded-2xl hologram-panel border-2 border-emerald-400/50 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl flex flex-col space-y-3 max-h-[70vh] overflow-hidden">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-white">CITIZEN NEURAL INTERCOM</span>
                </div>
                <button
                  onClick={() => setShowIntercom(false)}
                  className="w-6 h-6 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Citizen Selector List */}
              <div className="grid grid-cols-4 gap-2">
                {NPCS.map(npc => (
                  <button
                    key={npc.id}
                    onClick={() => handleSelectNPC(npc)}
                    className={`p-1.5 rounded-lg border text-center transition-all ${
                      activeNPC?.id === npc.id
                        ? 'bg-emerald-950 border-emerald-400 shadow-[0_0_10px_#00ff88]'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={npc.avatar} alt={npc.name} className="w-8 h-8 rounded-full mx-auto object-cover mb-1" />
                    <div className="text-[9px] font-mono font-bold text-slate-200 truncate">{npc.name.split(' ')[0]}</div>
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              {activeNPC && (
                <div className="flex-1 overflow-y-auto space-y-2 font-sans text-xs max-h-48 pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg ${
                        msg.sender === 'You'
                          ? 'ml-auto bg-slate-800 text-slate-200 max-w-[85%]'
                          : 'mr-auto bg-emerald-950/60 border border-emerald-500/30 text-emerald-100 max-w-[85%]'
                      }`}
                    >
                      <div className="text-[9px] font-mono text-emerald-400 font-bold mb-0.5">{msg.sender}</div>
                      <div>{msg.text}</div>
                    </div>
                  ))}
                  {isAiResponding && (
                    <div className="text-[10px] font-mono text-slate-400 animate-pulse">Synthesizing response...</div>
                  )}
                </div>
              )}

              {/* Input */}
              {activeNPC && (
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask citizen about city tech..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isAiResponding}
                    className="p-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROXIMITY OBJECTIVE INTERACTION MODAL (APPEARS WHEN ARRIVING AT TARGET) */}
        {atTargetProximity && currentTarget && (
          <div className="max-w-md mx-auto w-full mb-3 pointer-events-auto animate-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-amber-400 shadow-[0_0_35px_rgba(255,170,0,0.45)] backdrop-blur-xl text-center space-y-3">
              <div className="flex items-center justify-center space-x-2 text-amber-400 font-mono font-bold text-xs">
                <Target className="w-4 h-4 animate-spin" />
                <span>◈ ANOMALY TARGET DETECTED IN RANGE ◈</span>
              </div>
              <h3 className="text-base font-display font-bold text-white">{currentTarget.title}</h3>
              <p className="text-xs text-slate-300 font-sans">{currentTarget.description}</p>
              
              <button
                onClick={handleRetrieveTarget}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-[0_0_20px_#ffaa00] active:scale-95 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>SCAN & SECURE OBJECTIVE (+{currentTarget.rewardPoints} XP)</span>
              </button>
            </div>
          </div>
        )}

        {/* ALL TARGETS FOUND - SOUVENIR UNLOCKED MODAL */}
        {foundTargets.length >= SEARCH_TARGETS.length - 1 && (
          <div className="max-w-md mx-auto w-full mb-3 pointer-events-auto animate-pulse-glow">
            <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-emerald-400 shadow-[0_0_35px_rgba(0,255,136,0.45)] backdrop-blur-xl text-center space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-400">
                ★ ALL SECTOR ANOMALIES SECURED ★
              </div>
              <p className="text-xs text-slate-300">
                You have completely explored Smart City 2050! Archive your neural dossier to obtain your official certified Explorer Souvenir.
              </p>
              <button
                onClick={handleGenerateSouvenir}
                className="w-full py-3 rounded-xl cyber-btn cyber-btn-emerald font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-[0_0_25px_#00ff88] active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>GENERATE OFFICIAL EXPLORER SOUVENIR</span>
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM ROW: SIDE RADAR MINIMAP (CAR RACING STYLE) + SPEEDOMETER + VIRTUAL RACING CONTROLS */}
        <div className="flex items-end justify-between w-full pointer-events-none pb-2">
          
          {/* BOTTOM LEFT: CAR-RACING STYLE SIDE RADAR MINIMAP */}
          <div className="pointer-events-auto">
            <CityMiniMap
              playerPos={playerPos}
              playerYaw={playerYaw}
              sectors={SECTORS}
              currentTarget={currentTarget}
              allTargets={SEARCH_TARGETS}
            />
          </div>

          {/* BOTTOM CENTER: REALISTIC SPEEDOMETER HUD + GEAR GAUGE */}
          <div className="pointer-events-auto flex flex-col items-center bg-slate-950/90 border-2 border-emerald-400/50 rounded-2xl px-5 py-3 shadow-[0_0_30px_rgba(0,255,136,0.2)] backdrop-blur-xl">
            {/* Speed Digital Readout */}
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-4xl font-display font-black tracking-tight ${
                isNitroActive ? 'text-amber-400 drop-shadow-[0_0_12px_#ffaa00]' : 'text-emerald-400 drop-shadow-[0_0_8px_#00ff88]'
              }`}>
                {speedKmH}
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">KM/H</span>
            </div>

            {/* Gear & Status Indicators */}
            <div className="flex items-center space-x-2 my-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                speedKmH > 0 && !isNitroActive ? 'bg-emerald-500 text-black' : 'bg-slate-900 text-slate-500'
              }`}>
                DRIVE [D]
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                isNitroActive ? 'bg-amber-400 text-black animate-pulse' : 'bg-slate-900 text-slate-500'
              }`}>
                NITRO [BOOST]
              </span>
            </div>

            {/* Nitro Boost Charge Meter */}
            <div className="w-36 mt-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                <span className="flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>NITRO TANK</span>
                </span>
                <span className="text-amber-400 font-bold">{nitroFuel}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-75"
                  style={{ width: `${nitroFuel}%` }}
                />
              </div>
            </div>

            {/* Desktop Controls Hint */}
            <div className="mt-2 text-[9px] font-mono text-slate-400 text-center">
              [W/↑] GAS • [S/↓] REV • [A/D] STEER • [SHIFT] NITRO • [SPACE] DRIFT
            </div>
          </div>

          {/* BOTTOM RIGHT: ON-SCREEN TACTILE VIRTUAL CONTROLS (YOUTUBE PLAYABLES TOUCH/MOUSE EASY CONTROLS) */}
          <div className="pointer-events-auto flex flex-col items-end space-y-2">
            
            {/* Nitro & Handbrake Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onMouseDown={() => { virtualControlsRef.current.handbrake = true; soundFX.playDrift(); }}
                onMouseUp={() => { virtualControlsRef.current.handbrake = false; }}
                onTouchStart={() => { virtualControlsRef.current.handbrake = true; soundFX.playDrift(); }}
                onTouchEnd={() => { virtualControlsRef.current.handbrake = false; }}
                className="px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 active:bg-slate-800 text-[10px] font-mono font-bold shadow-lg"
              >
                DRIFT
              </button>
              <button
                onMouseDown={() => { virtualControlsRef.current.nitro = true; soundFX.playNitro(); }}
                onMouseUp={() => { virtualControlsRef.current.nitro = false; }}
                onTouchStart={() => { virtualControlsRef.current.nitro = true; soundFX.playNitro(); }}
                onTouchEnd={() => { virtualControlsRef.current.nitro = false; }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[11px] font-mono font-black flex items-center space-x-1.5 shadow-[0_0_15px_#ffaa00] active:scale-95"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>NITRO</span>
              </button>
            </div>

            {/* Virtual Directional Steering & Drive Pad */}
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-slate-950/85 border border-emerald-500/30 backdrop-blur-xl shadow-xl">
              <div />
              <button
                onMouseDown={() => { virtualControlsRef.current.forward = true; }}
                onMouseUp={() => { virtualControlsRef.current.forward = false; }}
                onTouchStart={() => { virtualControlsRef.current.forward = true; }}
                onTouchEnd={() => { virtualControlsRef.current.forward = false; }}
                className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 active:bg-emerald-500 active:text-black flex items-center justify-center font-bold shadow-md"
                title="Drive Forward"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div />

              <button
                onMouseDown={() => { virtualControlsRef.current.left = true; }}
                onMouseUp={() => { virtualControlsRef.current.left = false; }}
                onTouchStart={() => { virtualControlsRef.current.left = true; }}
                onTouchEnd={() => { virtualControlsRef.current.left = false; }}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 active:bg-emerald-500 active:text-black flex items-center justify-center font-bold shadow-md"
                title="Steer Left"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onMouseDown={() => { virtualControlsRef.current.backward = true; }}
                onMouseUp={() => { virtualControlsRef.current.backward = false; }}
                onTouchStart={() => { virtualControlsRef.current.backward = true; }}
                onTouchEnd={() => { virtualControlsRef.current.backward = false; }}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 active:bg-emerald-500 active:text-black flex items-center justify-center font-bold shadow-md"
                title="Reverse / Brake"
              >
                <ArrowDown className="w-5 h-5" />
              </button>

              <button
                onMouseDown={() => { virtualControlsRef.current.right = true; }}
                onMouseUp={() => { virtualControlsRef.current.right = false; }}
                onTouchStart={() => { virtualControlsRef.current.right = true; }}
                onTouchEnd={() => { virtualControlsRef.current.right = false; }}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 active:bg-emerald-500 active:text-black flex items-center justify-center font-bold shadow-md"
                title="Steer Right"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
