export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const SERVER_BASE = import.meta.env.VITE_SERVER_URL || API_BASE.replace(/\/api\/?$/, '') || 'http://localhost:3001';

export function resolveAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SERVER_BASE}${cleanPath}`;
}

export interface AssignedScenarioResponse {
  scenarioId: string;
  portal: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  content: Record<string, any>;
}

export class APIService {
  /**
   * Starts a new visitor session
   */
  public async startSession(mode: 'SOLO' | 'TEAM' = 'SOLO', teamSize = 1): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, teamSize })
      });
      if (res.ok) {
        const data = await res.json();
        return data.sessionId;
      }
    } catch {
      // offline fallback
    }
    return `SESSION-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  /**
   * Ends current visitor session
   */
  public async endSession(sessionId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch {
      // ignore
    }
  }

  /**
   * Requests a fair, non-repeating scenario from the backend
   */
  public async fetchScenario(portal: string, sessionId: string): Promise<AssignedScenarioResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/experiences/${portal}/scenario?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.scenario) {
          return data.scenario;
        }
      }
    } catch (err) {
      console.warn('Backend scenario fetch notice:', err);
    }
    return null;
  }

  /**
   * Completes an experience, records authoritative results, and generates dynamic QR
   */
  public async completeExperience(payload: {
    portal: string;
    sessionId: string;
    scenarioId: string;
    score: number;
    xpEarned: number;
    achievements: string[];
    metrics: { label: string; value: string | number }[];
    aiSummary: string;
    snapshotBase64?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/experiences/${payload.portal}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend complete error, using local composite:', err);
    }
    return null;
  }

  /**
   * Sends experience report email via server
   */
  public async sendEmail(payload: {
    resultId: string;
    recipientEmail: string;
    experienceTitle: string;
    visitorName?: string;
    score: number;
    xpEarned: number;
    achievements: string[];
    badges?: { name: string; description?: string; tier?: string; icon?: string }[];
    cardFrontUrl?: string;
    cardBackUrl?: string;
    badgePrintUrl?: string;
    posterUrl?: string;
    token?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/email/send-experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Server communication error: ' + err.message };
    }
  }

  /**
   * Fetches public mobile result data by token
   */
  public async fetchMobileResult(token: string) {
    const res = await fetch(`${API_BASE}/results/${token}`);
    if (!res.ok) throw new Error('Result not found or expired');
    return await res.json();
  }

  /**
   * Safe server-side AI chat proxy
   */
  public async talkToAI(payload: Record<string, any>) {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Fetches operator dashboard telemetry
   */
  public async fetchOperatorStats() {
    try {
      const res = await fetch(`${API_BASE}/operator/stats`);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Fetches system health
   */
  public async fetchSystemHealth() {
    try {
      const res = await fetch(`${API_BASE}/system/health`);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Admin Authentication
   */
  public async verifyAdminPin(pin: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Admin Aggregate Pacing Stats
   */
  public async fetchAdminStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Admin Leaderboard Query
   */
  public async fetchAdminLeaderboard(params: { portal?: string; sortBy?: string; order?: string; limit?: number } = {}) {
    try {
      const qs = new URLSearchParams();
      if (params.portal) qs.append('portal', params.portal);
      if (params.sortBy) qs.append('sortBy', params.sortBy);
      if (params.order) qs.append('order', params.order);
      if (params.limit) qs.append('limit', String(params.limit));

      const res = await fetch(`${API_BASE}/admin/leaderboard?${qs.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Admin Session Detail
   */
  public async fetchAdminSessionDetail(tokenOrId: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/sessions/${tokenOrId}`);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Admin CSV Export URL
   */
  public getAdminExportUrl(): string {
    return `${API_BASE}/admin/export.csv`;
  }
}

export const apiService = new APIService();
