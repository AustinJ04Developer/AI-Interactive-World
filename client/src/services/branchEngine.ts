export interface BranchWeights {
  diplomacy: number;
  science: number;
  containment: number;
}

export type DominantBranch = 'diplomacy' | 'science' | 'containment' | 'hybrid';

export interface BranchEnding {
  id: string;
  title: string;
  badge: string;
  themeColor: string;
  summary: string;
  quote: string;
}

export class BranchEngine {
  private weights: BranchWeights = {
    diplomacy: 0,
    science: 0,
    containment: 0
  };

  private choiceHistory: { level: number; choiceId: string; weightDelta: Partial<BranchWeights>; label: string }[] = [];

  public reset() {
    this.weights = { diplomacy: 0, science: 0, containment: 0 };
    this.choiceHistory = [];
  }

  public recordChoice(level: number, choiceId: string, label: string, delta: Partial<BranchWeights>) {
    this.weights.diplomacy += delta.diplomacy || 0;
    this.weights.science += delta.science || 0;
    this.weights.containment += delta.containment || 0;

    this.choiceHistory.push({
      level,
      choiceId,
      label,
      weightDelta: delta
    });
  }

  public getWeights(): BranchWeights {
    return { ...this.weights };
  }

  public getDominantBranch(): DominantBranch {
    const { diplomacy, science, containment } = this.weights;
    const max = Math.max(diplomacy, science, containment);

    // Hybrid detection: if top two are within 1 point of each other and > 2
    if (diplomacy > 2 && science > 2 && Math.abs(diplomacy - science) <= 1) {
      return 'hybrid';
    }

    if (max === science) return 'science';
    if (max === diplomacy) return 'diplomacy';
    return 'containment';
  }

  /**
   * Returns live color-grading tint based on dominant weight
   * Cyan: Science (0x00f2fe / #00f2fe)
   * Emerald/Green: Diplomacy (0x10b981 / #10b981)
   * Magenta/Amber: Containment (0xf43f5e / #f43f5e)
   */
  public getColorGrade(): { colorHex: string; colorNum: number; label: string } {
    const dominant = this.getDominantBranch();
    switch (dominant) {
      case 'science':
        return { colorHex: '#00f2fe', colorNum: 0x00f2fe, label: 'CYAN // QUANTUM SCIENCE' };
      case 'diplomacy':
        return { colorHex: '#10b981', colorNum: 0x10b981, label: 'EMERALD // DIPLOMATIC HARMONY' };
      case 'containment':
        return { colorHex: '#f43f5e', colorNum: 0xf43f5e, label: 'MAGENTA // QUARANTINE CONTAINMENT' };
      case 'hybrid':
      default:
        return { colorHex: '#8b5cf6', colorNum: 0x8b5cf6, label: 'VIOLET // SYNTHETIC CONVERGENCE' };
    }
  }

  /**
   * Resolves final Level 5 Climax Ending based on weights and path taken
   */
  public resolveEnding(): BranchEnding {
    const { diplomacy, science, containment } = this.weights;

    // Hybrid endings
    if (diplomacy >= 3 && science >= 3) {
      return {
        id: 'ending-symbiotic',
        title: 'THE SYMBIOTIC CONVERGENCE',
        badge: 'COSMIC HARBINGER',
        themeColor: '#8b5cf6',
        summary: 'By balancing scientific inquiry with deep xenodiplomacy, you formed a transcendent link with the alien signal network.',
        quote: '“We did not conquer the silence—we joined the chorus.”'
      };
    }

    if (science >= 3 && containment >= 3) {
      return {
        id: 'ending-stasis',
        title: 'THE ETERNAL ARCHIVE',
        badge: 'QUANTUM ARCHITECT',
        themeColor: '#06b6d4',
        summary: 'You locked the alien resonance within a localized tesseract chamber, studying its infinite wisdom while safeguarding Earth.',
        quote: '“Knowledge preserved in stasis outlives the stars themselves.”'
      };
    }

    // Pure branches
    if (diplomacy > science && diplomacy > containment) {
      return {
        id: 'ending-diplomacy',
        title: 'THE CELESTIAL ACCORD',
        badge: 'STELLAR EMISSARY',
        themeColor: '#10b981',
        summary: 'Humanity broadcasted a peaceful harmonic resonance, joining an interstellar federation spanning three galactic clusters.',
        quote: '“Across lightyears of void, understanding was our brightest beacon.”'
      };
    }

    if (science > diplomacy && science > containment) {
      return {
        id: 'ending-science',
        title: 'TRANSCENDENT ASCENSION',
        badge: 'PARAGON OF DISCOVERY',
        themeColor: '#00f2fe',
        summary: 'You deciphered the alien mathematics, unlocking faster-than-light energy manifolds that redefined physics forever.',
        quote: '“The signal was never a greeting; it was the blueprint of the cosmos.”'
      };
    }

    return {
      id: 'ending-containment',
      title: 'THE SENTINEL SHIELD',
      badge: 'AEGIS GUARDIAN',
      themeColor: '#f43f5e',
      summary: 'Recognizing the existential threat of unknown cosmic entities, you purged the beacon and fortified solar orbital perimeter defenses.',
      quote: '“Vigilance is the eternal price of humanity’s survival.”'
    };
  }

  public getChoiceHistory() {
    return [...this.choiceHistory];
  }
}

export const branchEngine = new BranchEngine();
