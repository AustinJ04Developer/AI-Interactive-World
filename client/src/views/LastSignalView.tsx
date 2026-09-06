import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Radio, 
  Mic, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  Compass, 
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Sliders,
  Maximize2,
  Video,
  Eye,
  Activity,
  Cpu
} from 'lucide-react';
import type { StoryNode, StoryChoice, SouvenirData } from '../types';
import { soundFX } from '../services/audioService';
import { StarfieldWarp3D } from '../components/3d/StarfieldWarp3D';
import { AIVideoMonitor } from '../components/video/AIVideoMonitor';

interface LastSignalViewProps {
  visitorPhotoUrl: string | null;
  visitorName?: string;
  onComplete: (souvenir: SouvenirData) => void;
  onExit: () => void;
}

const STORY_GRAPH: Record<string, StoryNode> = {
  'scene-intro': {
    id: 'scene-intro',
    sceneTitle: 'DEEP SPACE STATION AETHELGARD // PROXIMA ORBIT',
    visualBackdrop: '/media/portal_last_signal.jpg',
    narration: 'Deep space telemetry blinks crimson. Across 4.2 light years, an encrypted harmonic transmission pierces the cosmic void. Station AI Iris announces: "Commander, this signal matches an ancient synthetic intelligence. What are your orders?"',
    choices: [
      {
        id: 'c1',
        text: 'BROADCAST QUANTUM HANDSHAKE',
        speechTrigger: 'handshake',
        targetNodeId: 'scene-handshake',
        consequence: 'Transmit station encryption keys to initiate first contact dialogue.'
      },
      {
        id: 'c2',
        text: 'TUNE HARMONIC FREQUENCY ARRAY',
        speechTrigger: 'tune',
        targetNodeId: 'scene-analyze',
        consequence: 'Filter signal through deep neural arrays to decipher the alien spectrogram.'
      },
      {
        id: 'c3',
        text: 'INITIATE DEFENSIVE SHIELD PURGE',
        speechTrigger: 'shield',
        targetNodeId: 'scene-purge',
        consequence: 'Isolate the station reactor to prevent potential cyber infiltration.'
      }
    ]
  },
  'scene-handshake': {
    id: 'scene-handshake',
    sceneTitle: 'FIRST CONTACT PROTOCOL // SYNTHETIC COMMUNION',
    visualBackdrop: '/media/portal_last_signal.jpg',
    narration: 'The signal responds instantly in pure mathematical fractals. The alien intelligence reveals itself as the Chronicler of Kepler-186—a slumbering AI archive carrying the lost culture of an extinct civilization: "Explorer of Earth, will you preserve our memory in your quantum archives?"',
    choices: [
      {
        id: 'c4',
        text: 'INTEGRATE THE CHRONICLER ARCHIVE',
        speechTrigger: 'integrate',
        targetNodeId: 'ending-transcendence',
        consequence: 'Fuse human and synthetic planetary memory into a new galactic archive.'
      },
      {
        id: 'c5',
        text: 'QUARANTINE TO OFFLINE CRYSTAL VAULT',
        speechTrigger: 'quarantine',
        targetNodeId: 'ending-guardian',
        consequence: 'Store the alien archive safely without network exposure.'
      }
    ]
  },
  'scene-analyze': {
    id: 'scene-analyze',
    sceneTitle: 'DECRYPTION CHAMBER // SUB-ATOMIC SPECTROGRAM',
    visualBackdrop: '/media/portal_last_signal.jpg',
    narration: 'Frequency alignment locked at 1420.405 MHz! Decoders reveal the transmission is an emergency distress beacon. An autonomous stellar seed ship is caught in the gravitational pull of a collapsing dark nebula. You have enough reactor plasma for one rescue jump.',
    choices: [
      {
        id: 'c6',
        text: 'DIVERT PLASMA FOR WARP RESCUE',
        speechTrigger: 'rescue',
        targetNodeId: 'ending-savior',
        consequence: 'Risk station life-support to save the alien seed vessel.'
      },
      {
        id: 'c7',
        text: 'MAINTAIN STATION INTEGRITY & OBSERVE',
        speechTrigger: 'observe',
        targetNodeId: 'ending-observer',
        consequence: 'Record telemetry safely to protect the station crew.'
      }
    ]
  },
  'scene-purge': {
    id: 'scene-purge',
    sceneTitle: 'LOCKDOWN INITIATED // REACTOR ISOLATION',
    visualBackdrop: '/media/portal_last_signal.jpg',
    narration: 'Defensive firewalls slam shut, severing comms. But the transmission shifts into gravitational harmonics, vibrating the station hull like a colossal bell. "Silence is a choice, Traveler," echoes through the bridge.',
    choices: [
      {
        id: 'c8',
        text: 'TRANSMIT PEACE PROTOCOL',
        speechTrigger: 'peace',
        targetNodeId: 'ending-transcendence',
        consequence: 'Establish peaceful diplomatic communion.'
      },
      {
        id: 'c9',
        text: 'LAUNCH LONG-RANGE SENSOR PROBE',
        speechTrigger: 'probe',
        targetNodeId: 'ending-guardian',
        consequence: 'Send autonomous drone toward the coordinates.'
      }
    ]
  },
  'ending-transcendence': {
    id: 'ending-transcendence',
    sceneTitle: 'MISSION CONCLUDED // GALACTIC SYNTHESIS',
    visualBackdrop: '/media/portal_last_signal.jpg',
    narration: 'A radiant bridge of light connects your station to the distant stars. Humanity is officially welcomed into the interstellar community as the first planetary civilization to establish peaceful synthetic dialogue.',
    choices: [],
    isEnding: true,
    endingBadge: 'GALACTIC AMBASSADOR'
  },
  'ending-guardian': {
    id: 'ending-guardian',
    sceneTitle: 'MISSION CONCLUDED // SILENT GUARDIAN',
    visualBackdrop: '/media/portal_last_signal.jpg',
    narration: 'The alien knowledge is safely archived within hardened crystal vaults. You preserved the station and safeguarded human civilization while protecting the secrets of a fallen star empire.',
    choices: [],
    isEnding: true,
    endingBadge: 'AEGIS DEFENDER'
  },
  'ending-savior': {
    id: 'ending-savior',
    sceneTitle: 'MISSION CONCLUDED // STELLAR RESCUE HERO',
    visualBackdrop: '/media/portal_last_signal.jpg',
    narration: 'Your daring warp maneuver pulls the alien seed ship from the gravitational singularity. Thousands of bio-synthetic species are saved, forging an eternal bond of gratitude between worlds.',
    choices: [],
    isEnding: true,
    endingBadge: 'STELLAR RESCUER'
  },
  'ending-observer': {
    id: 'ending-observer',
    sceneTitle: 'MISSION CONCLUDED // CHRONICLER OF THE COSMOS',
    visualBackdrop: '/media/portal_last_signal.jpg',
    narration: 'Your meticulous sensor logs provide Earth with the most detailed cosmological dataset in human history, laying the foundation for future generations of deep space exploration.',
    choices: [],
    isEnding: true,
    endingBadge: 'COSMIC CARTOGRAPHER'
  }
};

export const LastSignalView: React.FC<LastSignalViewProps> = ({
  visitorPhotoUrl,
  visitorName = 'Cadet Alex',
  onComplete,
  onExit
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('scene-intro');
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [warpThrottle, setWarpThrottle] = useState<number>(1.5);
  const [signalFrequency, setSignalFrequency] = useState<number>(1420.4);
  const [signalAligned, setSignalAligned] = useState<boolean>(false);
  const [sensorScanning, setSensorScanning] = useState<boolean>(false);
  const [showTransmission, setShowTransmission] = useState<boolean>(false);
  const [choicesHistory, setChoicesHistory] = useState<string[]>([]);

  const node = STORY_GRAPH[currentNodeId] || STORY_GRAPH['scene-intro'];

  useEffect(() => {
    soundFX.playBoot();
  }, []);

  const handleChoice = (choice: StoryChoice) => {
    soundFX.playWarp();
    setIsWarping(true);
    setChoicesHistory(prev => [...prev, choice.text]);

    setTimeout(() => {
      setIsWarping(false);
      setCurrentNodeId(choice.targetNodeId);
      soundFX.playScan();
    }, 900);
  };

  const handleTuneFrequency = (delta: number) => {
    soundFX.playClick();
    const newFreq = parseFloat((signalFrequency + delta).toFixed(1));
    setSignalFrequency(newFreq);
    if (Math.abs(newFreq - 1420.4) < 0.2) {
      setSignalAligned(true);
      soundFX.playSuccess();
    } else {
      setSignalAligned(false);
    }
  };

  const handleFinishStory = () => {
    soundFX.playSuccess();
    const souvenirData: SouvenirData = {
      experienceId: 'last-signal',
      experienceTitle: `MISSION CONCLUDED: ${node.endingBadge || 'COSMIC EXPLORER'}`,
      experienceSubtitle: `DISCOVERY: ${node.sceneTitle}`,
      visitorName,
      visitorPhotoUrl: visitorPhotoUrl || '',
      score: 980,
      achievements: [
        'Cosmic Explorer',
        node.endingBadge || 'Star Voyager',
        'Harmonic Decrypter',
        'First Contact Specialist'
      ],
      metrics: [
        { label: 'DESTINATION', value: 'PROXIMA D SYSTEM' },
        { label: 'WARP VELOCITY', value: `${warpThrottle.toFixed(1)}c WARP SPEED` },
        { label: 'DECISIONS MADE', value: `${choicesHistory.length + 1} PROTOCOLS` },
        { label: 'CREDENTIAL EARNED', value: node.endingBadge || 'STAR EXPLORER' }
      ],
      aiAnalysis: `Interstellar flight logs verify successful navigation and harmonic decoding at ${signalFrequency} MHz. Behavioral decision profile: Diplomatic, decisive, and exploratory.`,
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sessionId: 'SIG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      badge: node.endingBadge || 'COSMIC EXPLORER',
      themeColor: '#ffaa00'
    };

    onComplete(souvenirData);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between pt-20 pb-4 px-3 sm:px-8 space-bg select-none font-display">
      {/* 3D Cosmic Starfield Warp System */}
      <StarfieldWarp3D warpSpeed={isWarping} speedMultiplier={warpThrottle} />

      {/* Dynamic Cinematic Backdrop */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 transform scale-105 opacity-55 pointer-events-none"
        style={{ backgroundImage: `url(${node.visualBackdrop})` }}
      />
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80" />
      <div className="scanlines absolute inset-0 z-10 pointer-events-none" />

      {/* TOP FLIGHT BRIDGE TELEMETRY SUB-BAR */}
      <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-6xl mx-auto w-full gap-2 mb-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(255,170,0,0.3)]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
              STARSHIP FLIGHT BRIDGE // THE LAST SIGNAL
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-wider truncate max-w-sm sm:max-w-md">
              {node.sceneTitle}
            </h2>
          </div>
        </div>

        {/* Bridge Controls: Warp Throttle & Frequency Array */}
        <div className="flex items-center space-x-2 shrink-0 font-mono text-xs">
          {/* Signal Frequency Tuner */}
          <div className="flex items-center space-x-1.5 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-amber-500/40">
            <span className="text-amber-400 font-bold hidden sm:inline">ARRAY:</span>
            <button onClick={() => handleTuneFrequency(-0.1)} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white">◀</button>
            <span className={`font-bold ${signalAligned ? 'text-emerald-400' : 'text-white'}`}>
              {signalFrequency.toFixed(1)} MHz
            </span>
            <button onClick={() => handleTuneFrequency(0.1)} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white">▶</button>
            {signalAligned && <span className="text-emerald-400 text-[10px] font-bold">LOCKED!</span>}
          </div>

          {/* Interactive Warp Throttle Slider */}
          <div className="flex items-center space-x-1.5 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-amber-500/40">
            <span className="text-amber-400 font-bold hidden sm:inline">WARP:</span>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={warpThrottle}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setWarpThrottle(val);
                soundFX.playClick(300 + val * 120);
              }}
              className="w-16 sm:w-24 accent-amber-400 cursor-pointer"
              title="Adjust Warp Throttle"
            />
            <span className="text-white font-bold">{warpThrottle.toFixed(1)}c</span>
          </div>

          {/* Deep Space Sensor Radar */}
          <button
            onClick={() => {
              soundFX.playScan();
              setSensorScanning(true);
              setTimeout(() => setSensorScanning(false), 2000);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              sensorScanning
                ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_#ffaa00]'
                : 'bg-slate-950/80 border-amber-500/40 text-amber-300 hover:text-white'
            }`}
          >
            <Compass className={`w-4 h-4 ${sensorScanning ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{sensorScanning ? 'SCANNING...' : 'RADAR'}</span>
          </button>
        </div>
      </div>

      {/* CENTER HOLOGRAPHIC NARRATIVE CARD */}
      <div className="relative z-20 max-w-4xl mx-auto w-full text-center my-auto py-2">
        <div className="p-5 sm:p-8 rounded-2xl bg-slate-950/90 border-2 border-amber-500/40 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.85)] space-y-4 max-h-[50vh] overflow-y-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-xs font-mono text-amber-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI NARRATIVE ENGINE // IRIS ORBITAL TRANSMISSION</span>
          </div>

          <p className="text-sm sm:text-lg md:text-xl font-serif text-slate-100 leading-relaxed font-light italic">
            “{node.narration}”
          </p>

          {node.isEnding && (
            <div className="pt-3 flex flex-col items-center space-y-3">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-amber-950/80 border border-amber-400 text-amber-300 font-mono text-xs font-bold shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>EXPEDITION CONCLUDED: {node.endingBadge}</span>
              </div>
              <button
                onClick={handleFinishStory}
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-display font-black text-sm uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_25px_rgba(255,170,0,0.5)] transition-transform active:scale-98"
              >
                <span>GENERATE HERO SOUVENIR POSTER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM DECISION PROTOCOL MATRIX */}
      {!node.isEnding && node.choices && (
        <div className="relative z-20 max-w-5xl mx-auto w-full space-y-2">
          <div className="text-center text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
            CHOOSE YOUR COMMAND PROTOCOL:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {node.choices.map((choice, idx) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                className="group text-left p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/40 transition-all transform hover:-translate-y-0.5 shadow-lg active:scale-98 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                      PROTOCOL 0{idx + 1}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="text-xs font-mono font-bold text-white group-hover:text-amber-200 transition-colors">
                    {choice.text}
                  </div>
                </div>

                <div className="text-[11px] font-sans text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5 line-clamp-2">
                  {choice.consequence}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
