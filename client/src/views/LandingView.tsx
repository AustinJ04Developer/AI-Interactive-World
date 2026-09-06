import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundFX } from '../services/audioService';
import { NovaGuide } from '../components/nova/NovaGuide';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';

interface LandingViewProps {
  onStart: () => void;
  onOpenOperator?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, onOpenOperator }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [bootSequence, setBootSequence] = useState<string[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.035);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // AI Core Geometry
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner glowing sphere
    const sphereGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    coreGroup.add(coreSphere);

    // Quantum nucleus
    const nucleusGeo = new THREE.IcosahedronGeometry(0.7, 1);
    const nucleusMat = new THREE.MeshBasicMaterial({ color: 0x7928ca });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleus);

    // Geodesic Cage
    const cageGeo = new THREE.IcosahedronGeometry(2.0, 2);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x0066ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    coreGroup.add(cage);

    // Orbiting Rings
    const ring1Geo = new THREE.TorusGeometry(2.8, 0.02, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(3.2, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xff007f, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // Floating Particles
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = (Math.random() - 0.5) * 40;
      positions[i + 2] = (Math.random() - 0.5) * 40;

      if (Math.random() > 0.4) {
        colors[i] = 0;
        colors[i + 1] = 0.95;
        colors[i + 2] = 1;
      } else {
        colors[i] = 0.47;
        colors[i + 1] = 0.16;
        colors[i + 2] = 0.79;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(50, 50, 0x00f2fe, 0x0d2040);
    gridHelper.position.y = -3.5;
    scene.add(gridHelper);

    // Parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      coreGroup.rotation.y = elapsedTime * 0.25;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.2;
      ring1.rotation.z = elapsedTime * 0.4;
      ring2.rotation.x = elapsedTime * 0.3;
      particles.rotation.y = elapsedTime * 0.03;

      camera.position.x += (targetMouseX * 0.8 - camera.position.x) * 0.05;
      camera.position.y += (-targetMouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleStartExperience = () => {
    if (isBooting) return;
    setIsBooting(true);
    soundFX.playBoot();

    const steps = [
      'WAKING UP NOVA...',
      'CONNECTING AI WORLDS...',
      'POWERING UP PORTALS...',
      'EXPLORER DETECTED! READY TO GO!'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        soundFX.playScan();
        setBootSequence(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setTimeout(() => {
            soundFX.playSuccess();
            onStart();
          }, 600);
        }
      }, (idx + 1) * 350);
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center space-bg">
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-auto" />
      <div className="scanlines absolute inset-0 z-10 pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl">
        
        {/* NOVA Mascot Greeting Header */}
        <div className="mb-6">
          <NovaGuide 
            message="Hey Explorer! 👋 Ready for an awesome AI adventure?"
            subMessage="Pick any world, solve mysteries, protect the core, and get your hero poster!"
            mood="excited"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-wider text-white uppercase drop-shadow-[0_0_35px_rgba(0,242,254,0.5)] mb-3">
          AI INTERACTIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">WORLD</span>
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-xl font-body font-light tracking-[0.2em] text-slate-200 uppercase mb-8 glow-cyan">
          “Four Experiences. One Intelligent World.”
        </p>

        {/* One-Tap Action */}
        {!isBooting ? (
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleStartExperience}
              className="cyber-btn text-base sm:text-lg px-10 py-4 shadow-[0_0_35px_rgba(0,242,254,0.5)] flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <span>START EXPLORING</span>
              <ArrowRight className="w-5 h-5 text-cyan-300 ml-1" />
            </button>
            <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">
              TOUCH OR CLICK TO BEGIN
            </span>
          </div>
        ) : (
          <div className="w-full max-w-md p-5 rounded-2xl bg-slate-950/90 border-2 border-cyan-400 backdrop-blur-xl shadow-2xl text-left font-mono text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-3 pb-2 border-b border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>AI IS GETTING READY...</span>
            </div>
            <div className="space-y-1.5 text-cyan-200">
              {bootSequence.map((step, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="text-cyan-400">✓</span>
                  <span className={i === bootSequence.length - 1 ? 'font-bold text-white' : 'text-slate-300'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Operator Access Link in bottom corner */}
      {onOpenOperator && (
        <button
          onClick={onOpenOperator}
          className="absolute bottom-4 right-4 z-20 text-[10px] font-mono text-slate-600 hover:text-cyan-400 underline"
        >
          [OPERATOR CONSOLE]
        </button>
      )}
    </div>
  );
};
