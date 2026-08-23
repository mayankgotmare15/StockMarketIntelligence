import { UserProfile, UserPreferences } from "../types/auth";

const API_BASE = "http://localhost:5000/api";
const USER_STORAGE_KEY = "stockai_user_profile";
const PREFS_STORAGE_KEY = "stockai_user_preferences";
const ACCESS_TOKEN_KEY = "stockai_access_token";
const REFRESH_TOKEN_KEY = "stockai_refresh_token";

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultStock: "APOLLOHOSP.NS",
  driftZScoreThreshold: 2.0,
  primaryBaselineModel: "Liu_Static",
  enableRegimeAlerts: true,
  enableDriftAlerts: true,
  theme: "cream",
  defaultTimeframe: "Month",
  enableHaptics: true,
  enableBiometrics: false,
  dataSource: "supabase",
};

export const DEMO_USER: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "ariana.b@stockai.in",
  fullName: "Ariana B",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "pro_trader",
  createdAt: "2024-02-15T10:30:00Z",
  investorProfile: {
    tradingHorizon: "swing",
    riskTolerance: "aggressive",
    primarySector: "Pharma",
  },
};

export const GUEST_USER: UserProfile = {
  id: "usr_guest_0000",
  email: "guest@stockai.internal",
  fullName: "Guest Trader",
  role: "guest",
  createdAt: new Date().toISOString(),
  investorProfile: {
    tradingHorizon: "intraday",
    riskTolerance: "moderate",
    primarySector: "IT",
  },
};

export class AuthService {
  // ==========================================================================
  // Local Token & Profile Storage
  // ==========================================================================

  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static getStoredUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static getStoredPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  static saveSession(user: UserProfile, accessToken?: string, refreshToken?: string): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (err) {
      console.warn("[AuthService] Failed to persist session:", err);
    }
  }

  static saveUser(user: UserProfile): void {
    this.saveSession(user);
  }

  static savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch (err) {
      console.warn("[AuthService] Failed to persist preferences:", err);
    }
  }

  static clearSession(): void {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        // Fire-and-forget server logout
        fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (err) {
      console.warn("[AuthService] Failed to clear session:", err);
    }
  }

  // ==========================================================================
  // Cloud Authentication Endpoints
  // ==========================================================================

  static async register(payload: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
    riskTolerance?: string;
    tradingHorizon?: string;
    defaultStock?: string;
    primarySector?: string;
  }): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || errorJson.error || "Registration failed");
      }

      const data = await res.json();
      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name,
        role: data.user.role,
        createdAt: data.user.created_at,
        investorProfile: {
          tradingHorizon: data.user.trading_horizon,
          riskTolerance: data.user.risk_tolerance,
          primarySector: data.user.primary_sector,
        },
      };

      this.saveSession(userProfile, data.accessToken, data.refreshToken);
      return userProfile;
    } catch (err) {
      console.warn("[AuthService] Cloud registration failed, using local session:", err);
      // Fallback local session
      const fallbackUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role as any || "pro_trader",
        createdAt: new Date().toISOString(),
        investorProfile: {
          tradingHorizon: (payload.tradingHorizon as any) || "swing",
          riskTolerance: (payload.riskTolerance as any) || "moderate",
          primarySector: payload.primarySector || "Pharma",
        },
      };
      this.saveSession(fallbackUser);
      return fallbackUser;
    }
  }

  static async login(email: string, password: string): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || errorJson.error || "Invalid credentials");
      }

      const data = await res.json();
      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name,
        role: data.user.role,
        createdAt: data.user.created_at,
        investorProfile: {
          tradingHorizon: data.user.trading_horizon,
          riskTolerance: data.user.risk_tolerance,
          primarySector: data.user.primary_sector,
        },
      };

      this.saveSession(userProfile, data.accessToken, data.refreshToken);
      return userProfile;
    } catch (err) {
      console.warn("[AuthService] Cloud login failed:", err);
      throw err;
    }
  }

  static async demoLogin(): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/auth/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        const demoProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          role: data.user.role,
          createdAt: data.user.created_at,
          investorProfile: {
            tradingHorizon: data.user.trading_horizon || "swing",
            riskTolerance: data.user.risk_tolerance || "aggressive",
            primarySector: data.user.primary_sector || "Pharma",
          },
        };
        this.saveSession(demoProfile, data.accessToken, data.refreshToken);
        return demoProfile;
      }
    } catch (err) {
      console.warn("[AuthService] Demo server fallback:", err);
    }

    // Local fallback
    this.saveSession(DEMO_USER);
    return DEMO_USER;
  }

  static async loginWithGoogle(mockGoogleProfile?: {
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    googleId?: string;
  }): Promise<UserProfile> {
    const googleEmail = mockGoogleProfile?.email || "priya.sharma@gmail.com";
    const googleName = mockGoogleProfile?.fullName || "Priya Sharma";
    const googleAvatar =
      mockGoogleProfile?.avatarUrl ||
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80";
    const googleSub = mockGoogleProfile?.googleId || "google_sub_109283746501";

    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleEmail,
          fullName: googleName,
          avatarUrl: googleAvatar,
          googleId: googleSub,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const googleUserProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          avatarUrl: data.user.avatar_url || googleAvatar,
          role: data.user.role,
          authProvider: "google",
          googleId: data.user.google_id || googleSub,
          createdAt: data.user.created_at,
          investorProfile: {
            tradingHorizon: data.user.trading_horizon || "swing",
            riskTolerance: data.user.risk_tolerance || "moderate",
            primarySector: data.user.primary_sector || "Pharma",
          },
        };

        this.saveSession(googleUserProfile, data.accessToken, data.refreshToken);
        return googleUserProfile;
      }
    } catch (err) {
      console.warn("[AuthService] Cloud Google OAuth fallback:", err);
    }

    // Local fallback Google User
    const fallbackGoogleUser: UserProfile = {
      id: `usr_google_${Date.now()}`,
      email: googleEmail,
      fullName: googleName,
      avatarUrl: googleAvatar,
      role: "pro_trader",
      authProvider: "google",
      googleId: googleSub,
      createdAt: new Date().toISOString(),
      investorProfile: {
        tradingHorizon: "swing",
        riskTolerance: "moderate",
        primarySector: "Pharma",
      },
    };

    this.saveSession(fallbackGoogleUser);
    return fallbackGoogleUser;
  }

  // ==========================================================================
  // Cloud User Engagement Sync
  // ==========================================================================

  static async syncPreferences(updates: Partial<UserPreferences>): Promise<void> {
    const token = this.getAccessToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE}/user/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          driftThreshold: updates.driftZScoreThreshold,
          primaryBaseline: updates.primaryBaselineModel,
          alertVolatilitySpike: updates.enableRegimeAlerts,
          alertDriftDetected: updates.enableDriftAlerts,
          biometricEnabled: updates.enableBiometrics,
        }),
      });
    } catch (err) {
      console.warn("[AuthService] Preferences cloud sync failed:", err);
    }
  }

  static async saveSimulation(simData: {
    symbol: string;
    inputPrice: number;
    scenarioType: string;
    simulatedAdaptiveReturn: number;
    simulatedStaticReturn: number;
    simulatedAdaptivePrice: number;
    simulatedStaticPrice: number;
    simulatedErrorReduction: number;
    notes?: string;
  }): Promise<void> {
    const token = this.getAccessToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE}/user/simulations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(simData),
      });
    } catch (err) {
      console.warn("[AuthService] Save simulation cloud sync failed:", err);
    }
  }

  // ==========================================================================
  // Cache Management & Diagnostics
  // ==========================================================================

  static getCacheSizeKB(): number {
    try {
      let total = 0;
      for (const x in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
          total += ((localStorage[x].length + x.length) * 2);
        }
      }
      return Math.max(12, Math.round(total / 1024));
    } catch {
      return 18;
    }
  }

  static clearAllCache(): void {
    try {
      const user = this.getStoredUser();
      const prefs = this.getStoredPreferences();
      const accessToken = this.getAccessToken();
      const refreshToken = this.getRefreshToken();
      localStorage.clear();
      if (user) this.saveSession(user, accessToken || undefined, refreshToken || undefined);
      this.savePreferences(prefs);
    } catch (err) {
      console.warn("[AuthService] Failed to clear cache:", err);
    }
  }
}
