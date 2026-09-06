import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface StarfieldWarp3DProps {
  warpSpeed?: boolean;
  speedMultiplier?: number;
}

export const StarfieldWarp3D: React.FC<StarfieldWarp3DProps> = ({ warpSpeed = false, speedMultiplier = 1.0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const warpSpeedRef = useRef<boolean>(warpSpeed);
  const speedMultRef = useRef<number>(speedMultiplier);

  useEffect(() => {
    warpSpeedRef.current = warpSpeed;
  }, [warpSpeed]);

  useEffect(() => {
    speedMultRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.002);

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Starfield Particles
    const starCount = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const speeds = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
      positions[i * 3 + 2] = Math.random() * 1000;

      // Color variation: cyan, violet, amber, and brilliant white
      const rVal = Math.random();
      if (rVal > 0.6) {
        colors[i * 3] = 0.0; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0; // Cyan
      } else if (rVal > 0.3) {
        colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.3; colors[i * 3 + 2] = 1.0; // Violet
      } else {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0; // White
      }

      speeds[i] = 0.5 + Math.random() * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    // 2. Gravitational Singularity / Anomaly Vortex
    const vortexGeo = new THREE.RingGeometry(8, 38, 48);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x7928ca,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      wireframe: true
    });
    const vortex = new THREE.Mesh(vortexGeo, vortexMat);
    vortex.position.set(0, 0, -200);
    scene.add(vortex);

    // 3. Animation Loop
    let reqId: number;
    let targetSpeedMultiplier = 1.0;

    const animate = () => {
      const isWarp = warpSpeedRef.current;
      const baseMult = speedMultRef.current;
      targetSpeedMultiplier += (((isWarp ? 8.0 : 1.0) * baseMult) - targetSpeedMultiplier) * 0.05;

      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        pos[i * 3 + 2] -= speeds[i] * targetSpeedMultiplier * 1.8;
        if (pos[i * 3 + 2] < 0) {
          pos[i * 3 + 2] = 1000;
          pos[i * 3] = (Math.random() - 0.5) * 1200;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 1200;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      // Rotate vortex
      vortex.rotation.z += 0.004 * targetSpeedMultiplier;

      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    reqId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden" 
    />
  );
};
