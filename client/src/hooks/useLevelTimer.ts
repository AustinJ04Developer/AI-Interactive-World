import { useReducer, useEffect, useRef, useCallback } from 'react';
import { soundFX } from '../services/audioService';
import type { LevelResult } from '../types';

export interface LevelConfig {
  level: number;
  label: string;
  timeBudgetSec: number;
  maxScore: number;
}

export interface TransitionInfo {
  completedLevel: number;
  nextLevel: number;
  label: string;
  scoreEarned: number;
  maxScore: number;
  completedBeforeTimeout: boolean;
  message: string;
}

export interface LevelTimerState {
  currentLevel: number; // 1 to 5
  timeRemainingInLevel: number;
  totalElapsed: number;
  isRunning: boolean;
  isComplete: boolean;
  isTransitioning: boolean;
  transitionInfo: TransitionInfo | null;
  levelResults: LevelResult[];
  totalScore: number;
}

type LevelTimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'TICK' }
  | { 
      type: 'ADVANCE_LEVEL'; 
      payload: { 
        scoreEarned?: number; 
        accuracy?: number; 
        keyChoice?: string;
        isTimeout?: boolean;
      } 
    }
  | { type: 'DISMISS_TRANSITION' }
  | { type: 'RESET'; payload?: LevelConfig[] };

// Default 300s / 5-minute split (45s / 55s / 65s / 65s / 70s) with 10/15/20/25/30% scoring (total 1000 pts)
export const DEFAULT_LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, label: 'Level 1: Initialization', timeBudgetSec: 45, maxScore: 100 },
  { level: 2, label: 'Level 2: Investigation', timeBudgetSec: 55, maxScore: 150 },
  { level: 3, label: 'Level 3: Deep Scan', timeBudgetSec: 65, maxScore: 200 },
  { level: 4, label: 'Level 4: Synthesis', timeBudgetSec: 65, maxScore: 250 },
  { level: 5, label: 'Level 5: Climax & Resolution', timeBudgetSec: 70, maxScore: 300 },
];

function createInitialState(configs: LevelConfig[]): LevelTimerState {
  return {
    currentLevel: 1,
    timeRemainingInLevel: configs[0]?.timeBudgetSec ?? 45,
    totalElapsed: 0,
    isRunning: false, // Timer starts only when the game/session explicitly begins!
    isComplete: false,
    isTransitioning: false,
    transitionInfo: null,
    levelResults: [],
    totalScore: 0,
  };
}

export function useLevelTimer(
  customConfigs: LevelConfig[] = DEFAULT_LEVEL_CONFIGS,
  onSessionComplete?: (results: LevelResult[], totalScore: number) => void
) {
  const configsRef = useRef<LevelConfig[]>(customConfigs);
  configsRef.current = customConfigs;

  const onCompleteRef = useRef(onSessionComplete);
  onCompleteRef.current = onSessionComplete;

  const reducer = (state: LevelTimerState, action: LevelTimerAction): LevelTimerState => {
    const configs = configsRef.current;
    const currentConfig = configs[state.currentLevel - 1] || configs[configs.length - 1];

    switch (action.type) {
      case 'START':
        if (state.isComplete) return state;
        return { ...state, isRunning: true };

      case 'PAUSE':
        return { ...state, isRunning: false };

      case 'TICK': {
        if (!state.isRunning || state.isTransitioning || state.isComplete) {
          return state;
        }

        const newTimeRemaining = state.timeRemainingInLevel - 1;
        const newTotalElapsed = state.totalElapsed + 1;

        if (newTimeRemaining <= 0) {
          // Auto-trigger timeout resolution
          const timeTaken = currentConfig.timeBudgetSec;
          const partialScore = Math.round(currentConfig.maxScore * 0.4); // 40% partial credit on timeout
          
          const result: LevelResult = {
            level: state.currentLevel,
            label: currentConfig.label,
            score: partialScore,
            maxScore: currentConfig.maxScore,
            timeTakenSec: timeTaken,
            timeBudgetSec: currentConfig.timeBudgetSec,
            completedBeforeTimeout: false,
            accuracy: 40,
            keyChoice: 'Emergency Protocol (Timed Out)',
          };

          const newResults = [...state.levelResults, result];
          const newScore = state.totalScore + partialScore;
          const isFinal = state.currentLevel >= 5;

          return {
            ...state,
            timeRemainingInLevel: 0,
            totalElapsed: newTotalElapsed,
            isComplete: isFinal,
            isTransitioning: !isFinal,
            transitionInfo: isFinal ? null : {
              completedLevel: state.currentLevel,
              nextLevel: state.currentLevel + 1,
              label: currentConfig.label,
              scoreEarned: partialScore,
              maxScore: currentConfig.maxScore,
              completedBeforeTimeout: false,
              message: 'Time Expired — Emergency Fail-Safe Activated',
            },
            levelResults: newResults,
            totalScore: newScore,
          };
        }

        return {
          ...state,
          timeRemainingInLevel: newTimeRemaining,
          totalElapsed: newTotalElapsed,
        };
      }

      case 'ADVANCE_LEVEL': {
        if (state.isTransitioning || state.isComplete) return state;

        const { scoreEarned, accuracy, keyChoice, isTimeout } = action.payload;
        const timeTaken = Math.max(1, currentConfig.timeBudgetSec - state.timeRemainingInLevel);
        const resolvedScore = scoreEarned !== undefined 
          ? Math.min(scoreEarned, currentConfig.maxScore) 
          : (isTimeout ? Math.round(currentConfig.maxScore * 0.4) : currentConfig.maxScore);

        const result: LevelResult = {
          level: state.currentLevel,
          label: currentConfig.label,
          score: resolvedScore,
          maxScore: currentConfig.maxScore,
          timeTakenSec: timeTaken,
          timeBudgetSec: currentConfig.timeBudgetSec,
          completedBeforeTimeout: !isTimeout,
          accuracy: accuracy ?? (isTimeout ? 45 : 90),
          keyChoice: keyChoice,
        };

        const newResults = [...state.levelResults, result];
        const newTotalScore = state.totalScore + resolvedScore;
        const isFinal = state.currentLevel >= 5;

        if (isFinal) {
          return {
            ...state,
            isComplete: true,
            isTransitioning: false,
            levelResults: newResults,
            totalScore: newTotalScore,
          };
        }

        const nextLevel = state.currentLevel + 1;
        const nextConfig = configs[nextLevel - 1] || configs[configs.length - 1];

        return {
          ...state,
          isTransitioning: true,
          transitionInfo: {
            completedLevel: state.currentLevel,
            nextLevel,
            label: currentConfig.label,
            scoreEarned: resolvedScore,
            maxScore: currentConfig.maxScore,
            completedBeforeTimeout: !isTimeout,
            message: isTimeout 
              ? 'Sector Timed Out — Partial Credit Logged' 
              : 'Level Objective Secured — Advancing',
          },
          currentLevel: nextLevel,
          timeRemainingInLevel: nextConfig.timeBudgetSec,
          levelResults: newResults,
          totalScore: newTotalScore,
        };
      }

      case 'DISMISS_TRANSITION':
        return {
          ...state,
          isTransitioning: false,
          transitionInfo: null,
        };

      case 'RESET':
        return createInitialState(action.payload || configsRef.current);

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, configsRef.current, createInitialState);

  // 1-second interval timer
  useEffect(() => {
    if (!state.isRunning || state.isTransitioning || state.isComplete) return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, state.isTransitioning, state.isComplete]);

  // Non-disturbing audio cues on critical timer thresholds (soft high-tech tick, no jarring siren)
  useEffect(() => {
    if (state.isRunning && state.timeRemainingInLevel <= 5 && state.timeRemainingInLevel > 0) {
      soundFX.playClick(1100);
    }
  }, [state.timeRemainingInLevel, state.isRunning]);

  // Auto-dismiss transition card after 1.8s
  useEffect(() => {
    if (state.isTransitioning) {
      soundFX.playSuccess();
      const timer = setTimeout(() => {
        dispatch({ type: 'DISMISS_TRANSITION' });
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [state.isTransitioning]);

  // Notify parent when all 5 levels complete
  useEffect(() => {
    if (state.isComplete && onCompleteRef.current) {
      onCompleteRef.current(state.levelResults, state.totalScore);
    }
  }, [state.isComplete, state.levelResults, state.totalScore]);

  const advanceLevel = useCallback((scoreEarned?: number, accuracy?: number, keyChoice?: string) => {
    dispatch({ type: 'ADVANCE_LEVEL', payload: { scoreEarned, accuracy, keyChoice, isTimeout: false } });
  }, []);

  const timeoutLevel = useCallback((scoreEarned?: number, accuracy?: number, keyChoice?: string) => {
    dispatch({ type: 'ADVANCE_LEVEL', payload: { scoreEarned, accuracy, keyChoice, isTimeout: true } });
  }, []);

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const reset = useCallback((newConfigs?: LevelConfig[]) => dispatch({ type: 'RESET', payload: newConfigs }), []);

  const currentConfig = configsRef.current[state.currentLevel - 1] || configsRef.current[0];
  const progressPct = Math.max(0, Math.min(100, (state.timeRemainingInLevel / currentConfig.timeBudgetSec) * 100));

  return {
    ...state,
    isTimerStarted: state.isRunning,
    startTimer: start,
    currentConfig,
    progressPct,
    advanceLevel,
    timeoutLevel,
    pause,
    start,
    reset,
  };
}
