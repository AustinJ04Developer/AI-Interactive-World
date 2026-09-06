import { config } from '../config.js';

export interface AIResponsePayload {
  text: string;
  reasoning?: string[];
  source: 'gemini' | 'neural-simulator';
}

export class AIProvider {
  /**
   * Generates conversational response with Smart City AI NPCs
   */
  public async talkToNPC(npcName: string, role: string, message: string): Promise<string> {
    if (!config.mockAi && config.geminiApiKey) {
      try {
        const prompt = `You are ${npcName}, a friendly and inspiring futuristic ${role} in Smart City 2050 talking to a school student explorer at an interactive Science Fair. The student asks: "${message}". Reply in 2-3 enthusiastic, simple, kid-friendly sentences.`;
        return await this.callGemini(prompt);
      } catch (err) {
        console.warn('Gemini API call failed, using neural simulation:', err);
      }
    }

    // High-fidelity local simulation
    const lower = message.toLowerCase();
    if (lower.includes('energy') || lower.includes('power') || lower.includes('solar')) {
      return `Hey Explorer! Our city captures clean energy from the sun and magnetic plasma rings. It powers all our flying pods with zero pollution!`;
    }
    if (lower.includes('robot') || lower.includes('ai') || lower.includes('think')) {
      return `Here in Smart City 2050, AI works side-by-side with humans! We help grow food, heal sickness, and protect nature.`;
    }
    if (lower.includes('food') || lower.includes('farm') || lower.includes('plant')) {
      return `Our aero-towers grow strawberries and fresh greens without any dirt! We recycle 95% of our water directly from morning fog.`;
    }
    if (lower.includes('car') || lower.includes('traffic') || lower.includes('fly')) {
      return `Look up in the sky! Our automated transit mesh guides flying pods with quantum precision so there are zero traffic jams.`;
    }

    return `Awesome question! As ${role}, I use futuristic sensors to keep our smart city thriving. What technology do you want to check out next?`;
  }

  /**
   * Generates forensic AI detective reasoning
   */
  public async analyzeDetectiveClue(clueTitle: string, suspectName: string, scenarioTitle: string): Promise<AIResponsePayload> {
    if (!config.mockAi && config.geminiApiKey) {
      try {
        const prompt = `You are NOVA, a smart and friendly AI Detective Assistant helping a school student in the mystery "${scenarioTitle}". Clue: "${clueTitle}", Suspect: "${suspectName}". Give a 2-sentence clue explanation and 1 simple deduction.`;
        const text = await this.callGemini(prompt);
        return {
          text,
          reasoning: [
            'INPUT: Scanning security telemetry',
            'ANALYZING: Comparing witness statement with physical evidence',
            'DEDUCTION: Potential contradiction isolated'
          ],
          source: 'gemini'
        };
      } catch (err) {
        console.warn('Gemini API error, falling back:', err);
      }
    }

    return {
      text: `NOVA Detective Analysis: Correlating ${clueTitle} with statements from ${suspectName}. The timestamps show a clear conflict!`,
      reasoning: [
        'INPUT: Reading forensic timestamp log',
        'ANALYZING: Cross-referencing witness movement',
        'DEDUCTION: Alibi does not match electronic keycard access'
      ],
      source: 'neural-simulator'
    };
  }

  /**
   * Generates student-friendly souvenir commendation
   */
  public async generateSouvenirCommendation(
    experience: string,
    score: number,
    achievements: string[]
  ): Promise<string> {
    if (!config.mockAi && config.geminiApiKey) {
      try {
        const prompt = `Write a 2-sentence celebratory, heroic commendation for a school student who completed the Science Expo experience "${experience}" with ${score} XP and badges: ${achievements.join(', ')}. Make them feel like a brilliant future scientist!`;
        return await this.callGemini(prompt);
      } catch {
        // fallback
      }
    }

    const map: Record<string, string> = {
      'detective': `Incredible deductive thinking! You spotted the critical timeline contradiction and recovered the missing technology with brilliant forensic precision.`,
      'smart-city': `Masterful civic exploration! You connected with municipal AI leaders and helped chart a sustainable, clean future for Smart City 2050.`,
      'ai-defense': `Lightning-fast cyber reflexes! Your accuracy and tactical decisions protected the Quantum Core against mutating algorithmic swarms.`,
      'last-signal': `Inspiring space commander courage! Your ethical choices during deep-space contact proved that humanity is ready to explore the cosmos.`
    };

    return map[experience] || `Outstanding performance recorded in the AI Interactive World science archives!`;
  }

  private async callGemini(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 120, temperature: 0.7 }
      })
    });
    if (!res.ok) throw new Error(`Gemini HTTP Error: ${res.statusText}`);
    const data = (await res.json()) as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  }
}

export const aiProvider = new AIProvider();
