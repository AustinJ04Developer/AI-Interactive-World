import React, { useState } from 'react';
import { Compass, Navigation2, Target, ZoomIn, ZoomOut, Maximize2, Minimize2, MapPin } from 'lucide-react';
import type { CitySector } from '../../types';

export interface CityTarget {
  id: string;
  title: string;
  sectorName: string;
  description: string;
  position: [number, number, number];
  color: string;
  rewardPoints: number;
}

interface CityMiniMapProps {
  playerPos: { x: number; z: number };
  playerYaw: number; // in radians
  sectors: CitySector[];
  currentTarget: CityTarget | null;
  allTargets: CityTarget[];
  onSelectSector?: (sectorId: string) => void;
}

export const CityMiniMap: React.FC<CityMiniMapProps> = ({
  playerPos,
  playerYaw,
  sectors,
  currentTarget,
  allTargets
}) => {
  const [zoomLevel, setZoomLevel] = useState<'close' | 'wide'>('close');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Map scale: 'close' = 45 units radius, 'wide' = 85 units radius
  const mapRadiusUnits = zoomLevel === 'close' ? 45 : 85;
  const radarSizePx = isExpanded ? 240 : 155;
  const radarRadiusPx = radarSizePx / 2;

  // Calculate distance to current target
  const targetDist = currentTarget
    ? Math.round(Math.hypot(currentTarget.position[0] - playerPos.x, currentTarget.position[2] - playerPos.z))
    : 0;

  // Calculate relative angle to target in degrees
  let targetAngleDeg = 0;
  let cardinalDirection = 'N';
  if (currentTarget) {
    const dx = currentTarget.position[0] - playerPos.x;
    const dz = currentTarget.position[2] - playerPos.z;
    // World coordinates: x is East(+)/West(-), z is South(+)/North(-)
    // Angle in world: 0 is North (-z), 90 is East (+x)
    const worldAngleRad = Math.atan2(dx, -dz);
    // Relative to player vehicle yaw heading
    const relAngleRad = worldAngleRad - playerYaw;
    targetAngleDeg = (relAngleRad * 180) / Math.PI;

    // Cardinal direction of target in world
    const compDeg = ((worldAngleRad * 180) / Math.PI + 360) % 360;
    if (compDeg >= 337.5 || compDeg < 22.5) cardinalDirection = 'N';
    else if (compDeg >= 22.5 && compDeg < 67.5) cardinalDirection = 'NE';
    else if (compDeg >= 67.5 && compDeg < 112.5) cardinalDirection = 'E';
    else if (compDeg >= 112.5 && compDeg < 157.5) cardinalDirection = 'SE';
    else if (compDeg >= 157.5 && compDeg < 202.5) cardinalDirection = 'S';
    else if (compDeg >= 202.5 && compDeg < 247.5) cardinalDirection = 'SW';
    else if (compDeg >= 247.5 && compDeg < 292.5) cardinalDirection = 'W';
    else cardinalDirection = 'NW';
  }

  // Convert world coordinate (x, z) to radar position relative to center (0,0) with vehicle heading rotation
  const worldToRadar = (wx: number, wz: number) => {
    const dx = wx - playerPos.x;
    const dz = wz - playerPos.z;

    // Rotate with vehicle heading so 'up' is always car forward
    const cosYaw = Math.cos(-playerYaw);
    const sinYaw = Math.sin(-playerYaw);
    const rotX = dx * cosYaw - dz * sinYaw;
    const rotZ = dx * sinYaw + dz * cosYaw;

    // Scale to radar pixels
    const px = (rotX / mapRadiusUnits) * (radarRadiusPx - 16);
    const py = (rotZ / mapRadiusUnits) * (radarRadiusPx - 16);

    // Clamp inside radar boundary
    const dist = Math.hypot(px, py);
    const maxR = radarRadiusPx - 12;
    if (dist > maxR) {
      return {
        x: (px / dist) * maxR,
        y: (py / dist) * maxR,
        isClamped: true
      };
    }
    return { x: px, y: py, isClamped: false };
  };

  // Compass rotation angle (negative of player yaw)
  const compassRotationDeg = (-playerYaw * 180) / Math.PI;

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="flex items-center space-x-2 bg-slate-950/95 border-2 border-emerald-400 rounded-xl px-3 py-2 shadow-[0_0_15px_rgba(0,255,136,0.3)] backdrop-blur-xl font-mono text-[10px] text-emerald-300 hover:text-white transition-all active:scale-95"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold">RADAR: {targetDist}m [{cardinalDirection}]</span>
        <Maximize2 className="w-3 h-3 text-emerald-400" />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start select-none">
      {/* Racing HUD Minimap Container */}
      <div className="relative bg-slate-950/90 border-2 border-emerald-400/60 rounded-2xl p-2 sm:p-2.5 shadow-[0_0_25px_rgba(0,255,136,0.25)] backdrop-blur-xl">
        
        {/* Header HUD Bar */}
        <div className="flex items-center justify-between w-full mb-1.5 px-1 font-mono text-[10px] text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">
          <div className="flex items-center space-x-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ff88]" />
            <span className="tracking-wider">GPS RADAR</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoomLevel(prev => (prev === 'close' ? 'wide' : 'close'))}
              className="p-1 hover:text-white transition-colors bg-slate-900 rounded border border-emerald-500/30 text-[9px]"
              title="Toggle Radar Range"
            >
              {zoomLevel === 'close' ? <ZoomIn className="w-3 h-3" /> : <ZoomOut className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="p-1 hover:text-white transition-colors bg-slate-900 rounded border border-emerald-500/30 text-[9px] hidden sm:block"
              title="Toggle Size"
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 hover:text-white transition-colors bg-slate-900 rounded border border-emerald-500/30 text-[9px]"
              title="Minimize Radar"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Circular Racing Radar Screen */}
        <div
          className="relative overflow-hidden rounded-full border border-emerald-500/40 bg-radial-radar mx-auto"
          style={{
            width: `${radarSizePx}px`,
            height: `${radarSizePx}px`,
            background: 'radial-gradient(circle, rgba(0,30,20,0.85) 0%, rgba(4,10,24,0.95) 100%)'
          }}
        >
          {/* Radar Concentric Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[33%] h-[33%] rounded-full border border-emerald-500/20" />
            <div className="w-[66%] h-[66%] rounded-full border border-emerald-500/25 border-dashed" />
            <div className="w-[98%] h-[98%] rounded-full border border-emerald-500/30" />
            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-emerald-500/15" />
            <div className="absolute h-full w-[1px] bg-emerald-500/15" />
          </div>

          {/* Rotating Dynamic Sweep Line (Car-race style radar) */}
          <div
            className="absolute inset-0 pointer-events-none origin-center animate-spin"
            style={{
              animationDuration: '3s',
              background: 'conic-gradient(from 0deg, rgba(0,255,136,0.18) 0deg, transparent 65deg, transparent 360deg)'
            }}
          />

          {/* Rotating Compass Ring */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-75"
            style={{ transform: `rotate(${compassRotationDeg}deg)` }}
          >
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-black text-emerald-300 drop-shadow-[0_0_5px_#00ff88]">
              N
            </span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-500">
              S
            </span>
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">
              E
            </span>
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">
              W
            </span>
          </div>

          {/* Sector Hub Blips */}
          {sectors.map((sec) => {
            const pos = worldToRadar(sec.coordinates[0], sec.coordinates[2]);
            return (
              <div
                key={sec.id}
                className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                style={{
                  left: `${radarRadiusPx + pos.x}px`,
                  top: `${radarRadiusPx + pos.y}px`,
                  backgroundColor: sec.color,
                  boxShadow: `0 0 6px ${sec.color}`
                }}
                title={sec.name}
              />
            );
          })}

          {/* Active Search Target Blip (Car Racing Objective) */}
          {currentTarget && (() => {
            const targetPos = worldToRadar(currentTarget.position[0], currentTarget.position[2]);
            return (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75 z-20"
                style={{
                  left: `${radarRadiusPx + targetPos.x}px`,
                  top: `${radarRadiusPx + targetPos.y}px`
                }}
              >
                {/* Pulsing ring indicator */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-6 h-6 rounded-full bg-amber-400/40 animate-ping" />
                  <div className="absolute w-4 h-4 rounded-full border border-amber-300 animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white shadow-[0_0_10px_#ffaa00]" />
                  {targetPos.isClamped && (
                    <div
                      className="absolute text-[8px] font-black text-amber-300"
                      style={{
                        transform: `rotate(${targetAngleDeg}deg) translateY(-8px)`
                      }}
                    >
                      ▲
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Center Player Cybercar Indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Vehicle Arrow (Always points UP on radar screen) */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-cyan-300 drop-shadow-[0_0_8px_#00f2fe]" />
              <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
          </div>
        </div>

        {/* Real-time Target Direction & Distance Readout */}
        {currentTarget && (
          <div className="mt-2 p-1.5 rounded-lg bg-slate-900/90 border border-amber-400/40 text-[10px] font-mono">
            <div className="flex items-center justify-between text-amber-300 font-bold mb-0.5">
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="truncate max-w-[120px]">{currentTarget.title}</span>
              </div>
              <span className="px-1 py-0.2 bg-amber-950/80 rounded border border-amber-500/40 text-[9px]">
                {cardinalDirection}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300 text-[9px]">
              <span>SECTOR: {currentTarget.sectorName}</span>
              <span className={`font-bold ${targetDist < 15 ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
                {targetDist}m AWAY
              </span>
            </div>

            {/* Proximity progress bar */}
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-1 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-150 ${
                  targetDist < 15
                    ? 'bg-emerald-400 shadow-[0_0_8px_#00ff88]'
                    : targetDist < 40
                    ? 'bg-amber-400 shadow-[0_0_8px_#ffaa00]'
                    : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, 100 - (targetDist / 70) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* GPS Coordinates Bar */}
        <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-400 px-0.5">
          <span>X: {Math.round(playerPos.x)} | Z: {Math.round(playerPos.z)}</span>
          <span className="text-emerald-400">STATUS: TRACKING</span>
        </div>
      </div>
    </div>
  );
};
