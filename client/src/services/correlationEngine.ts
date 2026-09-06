import type { LevelResult, CorrelationAnalysis, ExperienceId } from '../types';

export function synthesizeDefaultLevelResults(experienceId: ExperienceId, totalScore: number): LevelResult[] {
  const splits = [0.10, 0.15, 0.20, 0.25, 0.30];
  const labels: Record<ExperienceId, string[]> = {
    'detective': [
      'Phase 1: Holographic Sweep',
      'Phase 2: Digital Forensics',
      'Phase 3: Interrogation Tree',
      'Phase 4: Sensor Synthesis',
      'Phase 5: Case Accusation'
    ],
    'smart-city': [
      'Sector 1: Fusion Grid',
      'Sector 2: Transit & Hospital',
      'Sector 3: Vertical Agro-Dome',
      'Sector 4: Safety AI Core',
      'Sector 5: Central Monument'
    ],
    'ai-defense': [
      'Wave 1: Recon Probes',
      'Wave 2: Botnet Infiltration',
      'Wave 3: Decryption Swarm',
      'Wave 4: Trojan Incursion',
      'Wave 5: Titan Glitch Overlord'
    ],
    'last-signal': [
      'Chapter 1: Anomaly Decryption',
      'Chapter 2: Resonance Matrix',
      'Chapter 3: The Chronicler',
      'Chapter 4: Reactor Warp Crisis',
      'Chapter 5: Final Epoch Broadcast'
    ]
  };

  const currentLabels = labels[experienceId] || labels['detective'];

  return [1, 2, 3, 4, 5].map(lvl => {
    const budget = [45, 55, 65, 65, 70][lvl - 1];
    const maxScore = [100, 150, 200, 250, 300][lvl - 1];
    const score = Math.round(totalScore * splits[lvl - 1]);
    return {
      level: lvl,
      label: currentLabels[lvl - 1],
      score: Math.min(score, maxScore),
      maxScore,
      timeTakenSec: Math.round(budget * 0.75),
      timeBudgetSec: budget,
      completedBeforeTimeout: true,
      accuracy: 85 + Math.round(Math.random() * 12),
      keyChoice: 'Optimal Operational Route'
    };
  });
}

export function computeCorrelation(
  experienceId: ExperienceId,
  rawResults?: LevelResult[],
  totalScore: number = 750
): CorrelationAnalysis {
  const results = (rawResults && rawResults.length === 5)
    ? rawResults
    : synthesizeDefaultLevelResults(experienceId, totalScore);

  // 1. Normalized sparkline points (0 to 100 based on score / maxScore)
  const sparklinePoints = results.map(r => {
    const ratio = r.maxScore > 0 ? (r.score / r.maxScore) : 0.7;
    return Math.max(15, Math.min(100, Math.round(ratio * 100)));
  });

  // 2. Trend Calculation
  const firstHalfAvg = (sparklinePoints[0] + sparklinePoints[1]) / 2;
  const secondHalfAvg = (sparklinePoints[3] + sparklinePoints[4]) / 2;
  const delta = secondHalfAvg - firstHalfAvg;

  let trend: CorrelationAnalysis['trend'] = 'steady';
  let trendLabel = 'Consistent Performance: Balanced focus across all operational phases';

  if (delta > 12) {
    trend = 'improving';
    trendLabel = 'Surging Momentum: Exponential accuracy ramp into final high-threat phases';
  } else if (delta < -12) {
    trend = 'declining';
    trendLabel = 'High Early Reflexes: Strong opening tempo with late-game fatigue indicators';
  } else {
    // Check variance
    const mean = sparklinePoints.reduce((a, b) => a + b, 0) / 5;
    const variance = sparklinePoints.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / 5;
    if (variance > 200) {
      trend = 'erratic';
      trendLabel = 'Volatile Tactics: High-risk decision spikes offset by clutch recoveries';
    } else {
      trend = 'steady';
      trendLabel = 'Clockwork Precision: Exceptional rhythm maintained under increasing difficulty';
    }
  }

  // 3. Consistency Rating
  const timeoutsCount = results.filter(r => !r.completedBeforeTimeout).length;
  let consistencyRating = 'Flawless Execution (Zero Timeouts)';
  if (timeoutsCount >= 2) {
    consistencyRating = `High-Stress Strain (${timeoutsCount} Overtime Fail-Safes Triggered)`;
  } else if (timeoutsCount === 1) {
    consistencyRating = 'Resilient Rebound (1 Emergency Protocol)';
  } else if (sparklinePoints.every(p => p >= 80)) {
    consistencyRating = 'Elite Synchrony (Consistently ≥80% Target Capture)';
  }

  // 4. Standout Level (Highest delta vs budget or score)
  let bestIdx = 0;
  let bestScoreRatio = 0;
  results.forEach((r, idx) => {
    const ratio = r.score / r.maxScore;
    if (ratio > bestScoreRatio) {
      bestScoreRatio = ratio;
      bestIdx = idx;
    }
  });

  const standoutLevel = {
    level: results[bestIdx].level,
    label: results[bestIdx].label,
    reason: results[bestIdx].completedBeforeTimeout
      ? `Peak efficiency: Secured ${results[bestIdx].score} XP in ${results[bestIdx].timeTakenSec}s`
      : 'Tenacious defense: Highest threat density sustained'
  };

  // 5. Composite Grade & Title
  const avgSpark = sparklinePoints.reduce((a, b) => a + b, 0) / 5;
  let compositeGrade: CorrelationAnalysis['compositeGrade'] = 'A';
  if (avgSpark >= 92 && timeoutsCount === 0) compositeGrade = 'S+';
  else if (avgSpark >= 84) compositeGrade = 'S';
  else if (avgSpark >= 72) compositeGrade = 'A';
  else if (avgSpark >= 60) compositeGrade = 'B';
  else compositeGrade = 'C';

  // Titles derived from behavioral pattern
  const titlesByPattern: Record<string, string> = {
    'improving': 'Exponential Ascendant',
    'steady': 'Methodical Synthesizer',
    'declining': 'High-Burst Sprinter',
    'erratic': 'Dynamic Maverick'
  };

  const portalTitles: Record<ExperienceId, string> = {
    'detective': compositeGrade === 'S+' ? 'Master Forensic Inquisitor' : 'Forensic Crime Analyst',
    'smart-city': compositeGrade === 'S+' ? 'Autonomous City Architect' : 'Cyber-Metropolis Navigator',
    'ai-defense': compositeGrade === 'S+' ? 'Quantum Reflex Sentinel' : 'Adaptive Cyber-Defender',
    'last-signal': compositeGrade === 'S+' ? 'Cosmic Epoch Arbiter' : 'Deep Space Emissary'
  };

  const compositeTitle = `${portalTitles[experienceId]} // ${titlesByPattern[trend]}`;

  // 6. Portal-Specific Correlation Graphic Details
  let portalSpecificGraphic: CorrelationAnalysis['portalSpecificGraphic'];

  if (experienceId === 'detective') {
    portalSpecificGraphic = {
      type: 'evidence-trail',
      summary: 'Correlated Evidence Trail: 5 Pinned Nodes Linked to Suspect Dossier',
      details: {
        nodes: results.map((r, i) => ({
          level: r.level,
          label: r.label.split(':')[0],
          verified: r.completedBeforeTimeout,
          clue: r.keyChoice || 'Verified Clue Node'
        }))
      }
    };
  } else if (experienceId === 'last-signal') {
    portalSpecificGraphic = {
      type: 'branch-triangle',
      summary: '3-Axis Moral Trajectory: Synthesis of Diplomacy, Science & Containment',
      details: {
        points: results.map(r => ({
          chapter: r.level,
          vector: r.keyChoice || 'Harmonic Path'
        }))
      }
    };
  } else if (experienceId === 'ai-defense') {
    portalSpecificGraphic = {
      type: 'defense-telemetry',
      summary: '5-Wave Latency vs Intercept Scatter Analysis',
      details: {
        waves: results.map(r => ({
          wave: r.level,
          latencyMs: 380 - (r.level * 15) + Math.round(Math.random() * 20),
          accuracy: r.accuracy || 90
        }))
      }
    };
  } else {
    portalSpecificGraphic = {
      type: 'city-efficiency',
      summary: 'Metropolitan Energy & Navigation Vector Map',
      details: {
        sectors: results.map(r => ({
          sector: r.level,
          timeBudget: r.timeBudgetSec,
          timeTaken: r.timeTakenSec,
          efficiencyPct: Math.round((1 - (r.timeTakenSec / r.timeBudgetSec)) * 100)
        }))
      }
    };
  }

  return {
    trend,
    trendLabel,
    consistencyRating,
    standoutLevel,
    compositeTitle,
    compositeGrade,
    sparklinePoints,
    portalSpecificGraphic
  };
}
