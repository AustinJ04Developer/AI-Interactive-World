/**
 * AI Provider Abstraction
 * Handles generative AI responses via Gemini API with seamless local neural simulation fallback.
 */

export interface AIResponse {
  text: string;
  reasoning?: string[];
  confidence?: number;
  source: 'gemini' | 'neural-simulator';
}

class AIService {
  private apiKey: string = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY || '';

  public setApiKey(key: string) {
    this.apiKey = key.trim();
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    return this.apiKey.length > 5;
  }

  /**
   * Detective reasoning for witness statements, evidence correlation, and contradictions
   */
  public async analyzeDetectiveEvidence(clueId: string, suspectId: string): Promise<AIResponse> {
    const analysisMap: Record<string, { text: string; reasoning: string[] }> = {
      'cctv-1': {
        text: 'CCTV footage confirms Dr. Sterling was not at Station Alpha at 22:14 as claimed. Log shows biometrics cleared for Ava Cross.',
        reasoning: [
          'INPUT: Correlating CCTV Camera 04 timestamp with Server Access log',
          'ANALYZING: Keycard signature #9942 matches Ava Cross',
          'CONNECTING EVIDENCE: Timestamp conflicts directly with Ava Cross interview statement',
          'REASONING: Two timestamps conflict'
        ]
      },
      'audio-1': {
        text: 'Audio analysis detects high-frequency harmonic distortion consistent with an unauthorized quantum decryptor operating at Sub-level 3.',
        reasoning: [
          'INPUT: Acoustic wave spectrogram processing',
          'ANALYZING: Frequency spike at 14.8 kHz detected at 22:18',
          'CONNECTING EVIDENCE: Marcus Vance requisitioned Quantum Decryptor Unit 3 hours prior',
          'REASONING: Audio signature matches Vance’s checked-out hardware'
        ]
      },
      'doc-1': {
        text: 'Project Prometheus schematic reveals the prototype requires a twin neural cipher key held only by Dr. Sterling and Ava Cross.',
        reasoning: [
          'INPUT: Decrypting Prometheus architecture diagram',
          'ANALYZING: Security protocols required dual authorization bypass',
          'CONNECTING EVIDENCE: External breach is mathematically impossible without inside credentials',
          'REASONING: Inside perpetrator confirmed'
        ]
      }
    };

    // If Gemini key exists, attempt live query with timeout, fallback on error
    if (this.hasApiKey()) {
      try {
        const live = await this.callGeminiAPI(
          `You are an elite AI Detective Assistant at an AI Science Expo. Clue ID: ${clueId}, Suspect: ${suspectId}. Give a concise 2-sentence forensic deduction and a 1-line reasoning note.`
        );
        return {
          text: live,
          reasoning: [
            'INPUT: Live neural analysis via Gemini 2.5 API',
            'ANALYZING: Processing forensic vectors',
            'CONNECTING EVIDENCE: Cross-referencing laboratory sensor arrays',
            'REASONING: Active deduction verified'
          ],
          source: 'gemini'
        };
      } catch (err) {
        console.warn('Gemini API call failed, falling back to neural simulator:', err);
      }
    }

    // Default high-fidelity simulated neural reasoning
    const item = analysisMap[clueId] || {
      text: `Evidence correlation index 94.2%. Suspect ${suspectId || 'target'} shows biometric variance during cross-examination.`,
      reasoning: [
        'INPUT: Scanning evidence telemetry',
        'ANALYZING: Cross-referencing witness testimony against physical timestamps',
        'CONNECTING EVIDENCE: Discrepancy registered in lab logs',
        'REASONING: Timeline anomaly isolated'
      ]
    };

    // Small delay to simulate realistic AI inference
    await new Promise(r => setTimeout(r, 600));

    return {
      text: item.text,
      reasoning: item.reasoning,
      confidence: 0.94,
      source: 'neural-simulator'
    };
  }

  /**
   * Interacting with Smart City 2050 NPCs
   */
  public async talkToCityNPC(npcName: string, npcRole: string, visitorMessage: string): Promise<string> {
    if (this.hasApiKey()) {
      try {
        const prompt = `You are ${npcName}, a futuristic ${npcRole} in Smart City 2050 at a Science Exhibition. A visitor says: "${visitorMessage}". Respond in 2-3 inspiring, futuristic, concise sentences.`;
        return await this.callGeminiAPI(prompt);
      } catch (err) {
        console.warn('Gemini NPC chat fallback:', err);
      }
    }

    await new Promise(r => setTimeout(r, 500));

    const lower = visitorMessage.toLowerCase();
    if (lower.includes('energy') || lower.includes('power')) {
      return `Our city runs on a decentralized fusion grid and atmospheric quantum harvesters. We reached 100% net-positive clean energy twelve years ago!`;
    }
    if (lower.includes('doctor') || lower.includes('health') || lower.includes('cure')) {
      return `Our nanomedical monitors repair cellular micro-tears in real time. We predict health anomalies up to 6 months before symptoms manifest!`;
    }
    if (lower.includes('traffic') || lower.includes('transport') || lower.includes('fly')) {
      return `Sky-transit pods are synchronized by the Central Mobility Mesh. Zero traffic jams and zero collisions since 2043!`;
    }
    if (lower.includes('ai') || lower.includes('robot') || lower.includes('think')) {
      return `In Smart City 2050, AI doesn't rule; it harmonizes resources, preserves nature, and empowers human creativity.`;
    }

    return `Welcome to our sector! As ${npcRole}, I use autonomous quantum telemetry to keep Smart City 2050 flourishing. What system would you like to inspect next?`;
  }

  /**
   * Generates a personalized post-experience souvenir assessment
   */
  public async generateSouvenirSummary(
    experience: string,
    score: number,
    achievements: string[]
  ): Promise<string> {
    if (this.hasApiKey()) {
      try {
        const prompt = `Write a 2-sentence futuristic commendation for an AI Science Expo visitor who completed "${experience}" with score ${score} and achievements: ${achievements.join(', ')}. Keep it high-tech, inspiring, and cinematic.`;
        return await this.callGeminiAPI(prompt);
      } catch {
        // fallback below
      }
    }

    const summaries: Record<string, string> = {
      'detective': `Exceptional forensic acumen displayed. Your deductive timeline reconstruction exposed the Prometheus prototype breach with 96.8% accuracy.`,
      'smart-city': `Exemplary civic exploration recorded. You interfaced with municipal neural hubs and unlocked breakthrough ecological insights across Smart City 2050.`,
      'ai-defense': `Tactical cyber-reflexes rated in the 99th percentile. You countered adaptive algorithmic swarm vectors with superhuman precision.`,
      'last-signal': `Profound ethical foresight demonstrated. Your critical signal protocol decisions charted humanity's first peaceful synthetic communion.`
    };

    return summaries[experience] || `Outstanding performance logged in the AI Interactive World neural archives.`;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
      })
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  }
}

export const aiService = new AIService();
