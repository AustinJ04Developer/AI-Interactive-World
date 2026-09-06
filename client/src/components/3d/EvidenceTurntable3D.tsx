import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, Box, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { soundFX } from '../../services/audioService';

interface EvidenceTurntable3DProps {
  evidenceName: string;
  evidenceCode?: string;
  onClose?: () => void;
}

export const EvidenceTurntable3D: React.FC<EvidenceTurntable3DProps> = ({
  evidenceName,
  evidenceCode = 'EVD-904-QUANTUM',
  onClose
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(4.2);

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    coreGroup: THREE.Group;
    materials: THREE.Material[];
    reqId: number;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.08);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, zoomLevel);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f2fe, 3, 20);
    cyanLight.position.set(3, 4, 3);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff007f, 2, 20);
    magentaLight.position.set(-3, -2, -3);
    scene.add(magentaLight);

    // 4. Evidence Hologram Core Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const materials: THREE.Material[] = [];

    // Outer Faceted Crystal Housing (Quantum Prototype)
    const crystalGeo = new THREE.OctahedronGeometry(1.3, 1);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      metalness: 0.8,
      roughness: 0.15,
      transparent: true,
      opacity: 0.65,
      wireframe: wireframeMode
    });
    materials.push(crystalMat);
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(crystalMesh);

    // Inner Pulsing Core
    const innerGeo = new THREE.IcosahedronGeometry(0.7, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x7928ca,
      emissive: 0x5a189a,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    materials.push(innerMat);
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Orbital Laser Ring 1
    const ring1Geo = new THREE.TorusGeometry(1.9, 0.02, 16, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true });
    materials.push(ring1Mat);
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.5;
    coreGroup.add(ring1);

    // Orbital Laser Ring 2
    const ring2Geo = new THREE.TorusGeometry(2.2, 0.015, 16, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    materials.push(ring2Mat);
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3;
    coreGroup.add(ring2);

    // Holographic Pedestal Grid
    const gridHelper = new THREE.GridHelper(6, 16, 0x00f2fe, 0x1e293b);
    gridHelper.position.y = -1.6;
    scene.add(gridHelper);

    // 5. Interactive Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      coreGroup.rotation.y += deltaX * 0.01;
      coreGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 6. Animation Loop
    let lastTime = performance.now();
    const startTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const time = (now - startTime) / 1000;

      if (autoRotate && !isDragging) {
        coreGroup.rotation.y += delta * 0.5;
      }

      // Pulse inner core
      const scale = 1 + Math.sin(time * 3) * 0.08;
      innerMesh.scale.set(scale, scale, scale);

      ring1.rotation.z += delta * 0.3;
      ring2.rotation.z -= delta * 0.4;

      renderer.render(scene, camera);
      threeRef.current!.reqId = requestAnimationFrame(animate);
    };

    threeRef.current = {
      scene,
      camera,
      renderer,
      coreGroup,
      materials,
      reqId: requestAnimationFrame(animate)
    };

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.reqId);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Update wireframe mode
  useEffect(() => {
    if (threeRef.current && threeRef.current.materials[0]) {
      (threeRef.current.materials[0] as THREE.MeshStandardMaterial).wireframe = wireframeMode;
    }
  }, [wireframeMode]);

  // Update camera zoom
  useEffect(() => {
    if (threeRef.current) {
      threeRef.current.camera.position.z = zoomLevel;
      threeRef.current.camera.updateProjectionMatrix();
    }
  }, [zoomLevel]);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-cyan-400/50 bg-slate-950 flex flex-col shadow-2xl">
      {/* 3D Three.js Container */}
      <div 
        ref={mountRef} 
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Header Overlay */}
      <div className="absolute top-2 inset-x-3 pointer-events-none flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2 bg-slate-950/80 px-2.5 py-1 rounded-md border border-cyan-500/40 backdrop-blur-md">
          <Box className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-white font-bold">{evidenceName}</span>
          <span className="text-cyan-400 text-[10px]">[{evidenceCode}]</span>
        </div>

        <div className="text-[10px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
          CLICK & DRAG TO ROTATE 3D
        </div>
      </div>

      {/* Floating Target Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-48 h-48 border border-dashed border-cyan-400/20 rounded-full" />
      </div>

      {/* Bottom Interactive Toolbar */}
      <div className="relative z-10 px-3 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { soundFX.playClick(); setWireframeMode(!wireframeMode); }}
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all flex items-center space-x-1 ${
              wireframeMode 
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_#00f2fe]' 
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>X-RAY WIREFRAME</span>
          </button>

          <button
            onClick={() => { soundFX.playClick(); setAutoRotate(!autoRotate); }}
            className={`px-2 py-1 rounded text-[11px] font-bold border transition-all flex items-center space-x-1 ${
              autoRotate ? 'bg-slate-900 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>TURNTABLE {autoRotate ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => { soundFX.playClick(); setZoomLevel(prev => Math.max(2.5, prev - 0.5)); }}
            className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { soundFX.playClick(); setZoomLevel(prev => Math.min(6.5, prev + 0.5)); }}
            className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
