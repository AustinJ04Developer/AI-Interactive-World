import React, { useState } from 'react';
import { MessageSquare, HeartPulse, ShieldAlert, CheckCircle, ChevronRight, X, AlertTriangle, Pin } from 'lucide-react';
import type { Suspect, DialogueNode } from '../../types';
import { soundFX } from '../../services/audioService';

interface SuspectDialogueModalProps {
  suspect: Suspect | null;
  isOpen: boolean;
  onClose: () => void;
  onPinTestimony?: (testimonyText: string) => void;
}

export const SuspectDialogueModal: React.FC<SuspectDialogueModalProps> = ({
  suspect,
  isOpen,
  onClose,
  onPinTestimony
}) => {
  if (!isOpen || !suspect) return null;

  // Default dialogue tree if none provided
  const defaultDialogueTree: DialogueNode[] = [
    {
      id: 'd1',
      prompt: '“Where were you precisely between 22:00 and 22:30?”',
      response: suspect.alibi || 'I was in my private quarters reviewing standard operations telemetry.',
      stressLevel: suspect.isCulprit ? 78 : 24,
      isContradiction: suspect.isCulprit
    },
    {
      id: 'd2',
      prompt: '“Security sensors detected unauthorized keycard usage with your clearance level.”',
      response: suspect.isCulprit 
        ? 'Anyone could have cloned my keycard! I misplaced my lanyard near the cafeteria earlier.'
        : 'My keycard never leaves my biometric belt clip. Check the biometric scanner logs.',
      stressLevel: suspect.isCulprit ? 92 : 31,
      isContradiction: suspect.isCulprit
    },
    {
      id: 'd3',
      prompt: '“What motive would you have to tamper with this system?”',
      response: suspect.motive || 'I have spent years building this facility; why would I compromise it?',
      stressLevel: suspect.isCulprit ? 85 : 18
    }
  ];

  const dialogueNodes = suspect.dialogueTree && suspect.dialogueTree.length > 0 
    ? suspect.dialogueTree 
    : defaultDialogueTree;

  const [activeNode, setActiveNode] = useState<DialogueNode>(dialogueNodes[0]);
  const [interrogationHistory, setInterrogationHistory] = useState<{ prompt: string; response: string; stress: number; isContradiction?: boolean }[]>([
    { prompt: dialogueNodes[0].prompt, response: dialogueNodes[0].response, stress: dialogueNodes[0].stressLevel, isContradiction: dialogueNodes[0].isContradiction }
  ]);

  const handleSelectNode = (node: DialogueNode) => {
    soundFX.playClick();
    setActiveNode(node);
    if (node.stressLevel > 70) {
      soundFX.playWarning();
    }
    setInterrogationHistory(prev => [
      ...prev,
      { prompt: node.prompt, response: node.response, stress: node.stressLevel, isContradiction: node.isContradiction }
    ]);
  };

  const getSuspectPhoto = (name: string): string => {
    if (name.includes('Thorne') || name.includes('Silas') || name.includes('Vance')) return '/media/suspect_thorne.jpg';
    if (name.includes('Elena') || name.includes('Rostova') || name.includes('Ava') || name.includes('Evelyn')) return '/media/suspect_elena.jpg';
    if (name.includes('Finnick') || name.includes('Troy') || name.includes('Drake') || name.includes('Marcus')) return '/media/suspect_finnick.jpg';
    return '/media/suspect_maya.jpg';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in select-none font-display">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header with Biometric Stress Meter */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={getSuspectPhoto(suspect.name)} 
              alt={suspect.name} 
              className="w-10 h-10 rounded-lg object-cover border border-cyan-400"
            />
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                INTERROGATION ROOM // POLYGRAPH TELEMETRY
              </div>
              <h3 className="text-base font-bold text-white leading-tight">
                {suspect.name} <span className="text-slate-400 text-xs font-mono font-normal">({suspect.role})</span>
              </h3>
            </div>
          </div>

          {/* Live Biometric Pulse Readout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-1.5 justify-end">
                <HeartPulse className={`w-4 h-4 ${activeNode.stressLevel > 70 ? 'text-rose-500 animate-ping' : 'text-emerald-400 animate-pulse'}`} />
                <span className="text-xs font-mono font-bold text-slate-200">
                  {activeNode.stressLevel > 70 ? 'ELEVATED STRESS' : 'BASELINE PULSE'}
                </span>
              </div>
              <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full transition-all duration-500 ${
                    activeNode.stressLevel > 70 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${activeNode.stressLevel}%` }}
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Transcript Scroll + Interrogation Dialogue Options */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-5 p-4 gap-4">
          
          {/* Transcript Log (Left 3 Columns) */}
          <div className="md:col-span-3 flex flex-col overflow-hidden bg-slate-900/60 rounded-xl border border-slate-800/80 p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-2 pb-1 border-b border-slate-800">
              POLICE RECORDED INTERVIEW LOG
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {interrogationHistory.map((item, idx) => (
                <div key={idx} className="space-y-1.5 font-mono text-xs">
                  <div className="text-cyan-400 font-bold flex items-center space-x-1">
                    <ChevronRight className="w-3 h-3" />
                    <span>DETECTIVE:</span>
                    <span className="text-slate-200 font-normal">{item.prompt}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border leading-relaxed ${
                    item.isContradiction 
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-100' 
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between mb-1 text-[9px] font-bold">
                      <span className="text-amber-400 uppercase">{suspect.name}:</span>
                      {item.isContradiction && (
                        <span className="inline-flex items-center space-x-1 text-rose-400 uppercase">
                          <AlertTriangle className="w-3 h-3" />
                          <span>CONTRADICTION DETECTED</span>
                        </span>
                      )}
                    </div>
                    {item.response}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branching Question Selector (Right 2 Columns) */}
          <div className="md:col-span-2 flex flex-col space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              CHOOSE INTERROGATION ANGLE
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {dialogueNodes.map((node) => {
                const isCurrent = activeNode.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleSelectNode(node)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex flex-col space-y-1 ${
                      isCurrent
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="text-xs font-bold leading-snug">{node.prompt}</div>
                    <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between pt-1">
                      <span>STRESS DELTA: {node.stressLevel}%</span>
                      {node.isContradiction && <span className="text-amber-400 font-bold">★ HIGH VALUE</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pin Testimony Button */}
            {onPinTestimony && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onPinTestimony(`${suspect.name}: "${activeNode.response}"`);
                }}
                className="mt-2 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg"
              >
                <Pin className="w-3.5 h-3.5 fill-current" />
                <span>PIN TESTIMONY TO CORKBOARD</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
