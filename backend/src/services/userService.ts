import { randomUUID } from "node:crypto";
import { getSupabase } from "../config/database.js";

export interface UserProfile {
  id: string;
  email: string;
  password_hash?: string;
  google_id?: string;
  auth_provider?: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  risk_tolerance: string;
  trading_horizon: string;
  default_stock: string;
  primary_sector: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserMLPreferences {
  user_id: string;
  drift_threshold: number;
  primary_baseline: string;
  alert_volatility_spike: boolean;
  alert_drift_detected: boolean;
  biometric_enabled: boolean;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  target_entry_price?: number;
  target_stop_loss?: number;
  alert_price_threshold?: number;
  notes?: string;
  display_order: number;
  added_at: string;
}

export interface UserSimulation {
  id: string;
  user_id: string;
  symbol: string;
  input_price: number;
  scenario_type: string;
  simulated_adaptive_return: number;
  simulated_static_return: number;
  simulated_adaptive_price: number;
  simulated_static_price: number;
  simulated_error_reduction: number;
  notes?: string;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  event_type: string;
  title: string;
  description: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface AuthSession {
  id: string;
  user_id: string;
  token_hash: string;
  device_info?: string;
  ip_address?: string;
  is_revoked: boolean;
  expires_at: string;
  created_at: string;
}

// In-Memory Storage Fallback for local development / testing / offline Supabase
class InMemoryUserStore {
  users: Map<string, UserProfile> = new Map();
  preferences: Map<string, UserMLPreferences> = new Map();
  watchlists: Map<string, WatchlistItem[]> = new Map();
  simulations: Map<string, UserSimulation[]> = new Map();
  activities: Map<string, UserActivity[]> = new Map();
  sessions: Map<string, AuthSession> = new Map();

  constructor() {
    // Seed default Demo Pro Trader
    const demoId = "00000000-0000-0000-0000-000000000001";
    const now = new Date().toISOString();
    const demoUser: UserProfile = {
      id: demoId,
      email: "ariana.b@stockai.in",
      password_hash: "", // demo bypass
      full_name: "Ariana B",
      role: "pro_trader",
      risk_tolerance: "aggressive",
      trading_horizon: "swing",
      default_stock: "APOLLOHOSP.NS",
      primary_sector: "Pharma",
      created_at: now,
      updated_at: now,
      last_login_at: now,
    };
    this.users.set(demoId, demoUser);
    this.preferences.set(demoId, {
      user_id: demoId,
      drift_threshold: 2.0,
      primary_baseline: "Liu_Static",
      alert_volatility_spike: true,
      alert_drift_detected: true,
      biometric_enabled: false,
      updated_at: now,
    });
    this.watchlists.set(demoId, [
      {
        id: randomUUID(),
        user_id: demoId,
        symbol: "APOLLOHOSP.NS",
        notes: "Primary Pharma Benchmark",
        display_order: 1,
        added_at: now,
      },
      {
        id: randomUUID(),
        user_id: demoId,
        symbol: "TCS.NS",
        notes: "IT Core Stacking",
        display_order: 2,
        added_at: now,
      },
    ]);
  }
}

const memoryStore = new InMemoryUserStore();

export class UserService {
  // ==========================================================================
  // 1. User Profiles & Authentication
  // ==========================================================================

  static async createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    role?: string;
    riskTolerance?: string;
    tradingHorizon?: string;
    defaultStock?: string;
    primarySector?: string;
  }): Promise<UserProfile> {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const id = randomUUID();

    const user: UserProfile = {
      id,
      email: data.email.toLowerCase().trim(),
      password_hash: data.passwordHash,
      full_name: data.fullName.trim(),
      role: data.role || "pro_trader",
      risk_tolerance: data.riskTolerance || "moderate",
      trading_horizon: data.tradingHorizon || "swing",
      default_stock: data.defaultStock || "APOLLOHOSP.NS",
      primary_sector: data.primarySector || "Pharma",
      created_at: now,
      updated_at: now,
      last_login_at: now,
    };

    if (supabase) {
      try {
        const { error } = await supabase.from("user_profiles").insert(user);
        if (error) throw error;

        // Create default ML preferences
        await supabase.from("user_ml_preferences").insert({
          user_id: id,
          drift_threshold: 2.0,
          primary_baseline: "Liu_Static",
          alert_volatility_spike: true,
          alert_drift_detected: true,
          biometric_enabled: false,
        });

        return user;
      } catch (err) {
        console.warn("[UserService] Supabase insert failed, falling back to in-memory:", err);
      }
    }

    // Memory store fallback
    memoryStore.users.set(id, user);
    memoryStore.preferences.set(id, {
      user_id: id,
      drift_threshold: 2.0,
      primary_baseline: "Liu_Static",
      alert_volatility_spike: true,
      alert_drift_detected: true,
      biometric_enabled: false,
      updated_at: now,
    });
    memoryStore.watchlists.set(id, []);
    memoryStore.simulations.set(id, []);
    memoryStore.activities.set(id, []);

    return user;
  }

  static async findUserByEmail(email: string): Promise<UserProfile | null> {
    const cleanEmail = email.toLowerCase().trim();
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("email", cleanEmail)
          .single();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        console.warn("[UserService] Supabase lookup error:", err);
      }
    }

    for (const user of memoryStore.users.values()) {
      if (user.email === cleanEmail) return user;
    }
    return null;
  }

  static async findUserById(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        console.warn("[UserService] Supabase lookup error:", err);
      }
    }

    return memoryStore.users.get(userId) || null;
  }

  static async findUserByGoogleId(googleId: string): Promise<UserProfile | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("google_id", googleId)
          .single();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        console.warn("[UserService] Supabase lookup error by google_id:", err);
      }
    }

    for (const user of memoryStore.users.values()) {
      if (user.google_id === googleId) return user;
    }
    return null;
  }

  static async upsertGoogleUser(data: {
    email: string;
    fullName: string;
    avatarUrl?: string;
    googleId: string;
  }): Promise<UserProfile> {
    const cleanEmail = data.email.toLowerCase().trim();
    const now = new Date().toISOString();

    // 1. Check if user exists by google_id
    let existing = await this.findUserByGoogleId(data.googleId);
    if (existing) {
      const updated = await this.updateUserProfile(existing.id, {
        avatar_url: data.avatarUrl || existing.avatar_url,
        last_login_at: now,
      });
      return updated || existing;
    }

    // 2. Check if user exists by email (link Google ID)
    existing = await this.findUserByEmail(cleanEmail);
    if (existing) {
      const updated = await this.updateUserProfile(existing.id, {
        google_id: data.googleId,
        auth_provider: "google",
        avatar_url: data.avatarUrl || existing.avatar_url,
        last_login_at: now,
      });
      return updated || existing;
    }

    // 3. New Google User provisioning
    const id = randomUUID();
    const newUser: UserProfile = {
      id,
      email: cleanEmail,
      google_id: data.googleId,
      auth_provider: "google",
      full_name: data.fullName.trim() || "Google Trader",
      avatar_url: data.avatarUrl,
      role: "pro_trader",
      risk_tolerance: "moderate",
      trading_horizon: "swing",
      default_stock: "APOLLOHOSP.NS",
      primary_sector: "Pharma",
      created_at: now,
      updated_at: now,
      last_login_at: now,
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from("user_profiles").insert(newUser);
        if (!error) {
          await supabase.from("user_ml_preferences").insert({
            user_id: id,
            drift_threshold: 2.0,
            primary_baseline: "Liu_Static",
            alert_volatility_spike: true,
            alert_drift_detected: true,
            biometric_enabled: false,
          });
          return newUser;
        }
      } catch (err) {
        console.warn("[UserService] Supabase insert Google user error:", err);
      }
    }

    memoryStore.users.set(id, newUser);
    memoryStore.preferences.set(id, {
      user_id: id,
      drift_threshold: 2.0,
      primary_baseline: "Liu_Static",
      alert_volatility_spike: true,
      alert_drift_detected: true,
      biometric_enabled: false,
      updated_at: now,
    });
    memoryStore.watchlists.set(id, []);
    memoryStore.simulations.set(id, []);
    memoryStore.activities.set(id, []);

    return newUser;
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updated_at: now };
    delete (cleanUpdates as any).id;
    delete (cleanUpdates as any).email;
    delete (cleanUpdates as any).password_hash;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .update(cleanUpdates)
          .eq("id", userId)
          .select()
          .single();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        console.warn("[UserService] Supabase update error:", err);
      }
    }

    const existing = memoryStore.users.get(userId);
    if (!existing) return null;
    const updated = { ...existing, ...cleanUpdates };
    memoryStore.users.set(userId, updated);
    return updated;
  }

  // ==========================================================================
  // 2. ML Preferences & Custom Drift Sensitivity
  // ==========================================================================

  static async getUserPreferences(userId: string): Promise<UserMLPreferences> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_ml_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();
        if (!error && data) return data as UserMLPreferences;
      } catch (err) {
        console.warn("[UserService] Supabase preferences lookup error:", err);
      }
    }

    const pref = memoryStore.preferences.get(userId);
    if (pref) return pref;

    // Default if not initialized
    const defaultPref: UserMLPreferences = {
      user_id: userId,
      drift_threshold: 2.0,
      primary_baseline: "Liu_Static",
      alert_volatility_spike: true,
      alert_drift_detected: true,
      biometric_enabled: false,
      updated_at: new Date().toISOString(),
    };
    memoryStore.preferences.set(userId, defaultPref);
    return defaultPref;
  }

  static async updateUserPreferences(
    userId: string,
    updates: Partial<UserMLPreferences>
  ): Promise<UserMLPreferences> {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updated_at: now };
    delete (cleanUpdates as any).user_id;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_ml_preferences")
          .upsert({ user_id: userId, ...cleanUpdates })
          .select()
          .single();
        if (!error && data) return data as UserMLPreferences;
      } catch (err) {
        console.warn("[UserService] Supabase preferences update error:", err);
      }
    }

    const existing = await this.getUserPreferences(userId);
    const updated = { ...existing, ...cleanUpdates };
    memoryStore.preferences.set(userId, updated);
    return updated;
  }

  // ==========================================================================
  // 3. User Watchlists
  // ==========================================================================

  static async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_watchlists")
          .select("*")
          .eq("user_id", userId)
          .order("display_order", { ascending: true });
        if (!error && data) return data as WatchlistItem[];
      } catch (err) {
        console.warn("[UserService] Supabase watchlist lookup error:", err);
      }
    }

    return memoryStore.watchlists.get(userId) || [];
  }

  static async addToWatchlist(
    userId: string,
    symbol: string,
    notes?: string,
    targetPrice?: number,
    stopLoss?: number
  ): Promise<WatchlistItem> {
    const cleanSymbol = symbol.toUpperCase().trim();
    const supabase = getSupabase();
    const now = new Date().toISOString();

    const item: WatchlistItem = {
      id: randomUUID(),
      user_id: userId,
      symbol: cleanSymbol,
      notes,
      target_entry_price: targetPrice,
      target_stop_loss: stopLoss,
      display_order: 0,
      added_at: now,
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_watchlists")
          .insert(item)
          .select()
          .single();
        if (!error && data) return data as WatchlistItem;
      } catch (err) {
        console.warn("[UserService] Supabase watchlist insert error:", err);
      }
    }

    const list = memoryStore.watchlists.get(userId) || [];
    const filtered = list.filter((i) => i.symbol !== cleanSymbol);
    filtered.push(item);
    memoryStore.watchlists.set(userId, filtered);
    return item;
  }

  static async removeFromWatchlist(userId: string, symbol: string): Promise<boolean> {
    const cleanSymbol = symbol.toUpperCase().trim();
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { error } = await supabase
          .from("user_watchlists")
          .delete()
          .eq("user_id", userId)
          .eq("symbol", cleanSymbol);
        if (!error) return true;
      } catch (err) {
        console.warn("[UserService] Supabase watchlist delete error:", err);
      }
    }

    const list = memoryStore.watchlists.get(userId) || [];
    const filtered = list.filter((i) => i.symbol !== cleanSymbol);
    memoryStore.watchlists.set(userId, filtered);
    return true;
  }

  // ==========================================================================
  // 4. Saved Simulations
  // ==========================================================================

  static async getSimulations(userId: string): Promise<UserSimulation[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_simulations")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (!error && data) return data as UserSimulation[];
      } catch (err) {
        console.warn("[UserService] Supabase simulations lookup error:", err);
      }
    }

    return memoryStore.simulations.get(userId) || [];
  }

  static async saveSimulation(
    userId: string,
    data: Omit<UserSimulation, "id" | "user_id" | "created_at">
  ): Promise<UserSimulation> {
    const supabase = getSupabase();
    const id = randomUUID();
    const now = new Date().toISOString();

    const sim: UserSimulation = {
      id,
      user_id: userId,
      ...data,
      created_at: now,
    };

    if (supabase) {
      try {
        const { data: resData, error } = await supabase
          .from("user_simulations")
          .insert(sim)
          .select()
          .single();
        if (!error && resData) return resData as UserSimulation;
      } catch (err) {
        console.warn("[UserService] Supabase simulation insert error:", err);
      }
    }

    const list = memoryStore.simulations.get(userId) || [];
    list.unshift(sim);
    memoryStore.simulations.set(userId, list);
    return sim;
  }

  // ==========================================================================
  // 5. Activity Feed
  // ==========================================================================

  static async logActivity(
    userId: string,
    eventType: string,
    title: string,
    description: string,
    payload: Record<string, any> = {}
  ): Promise<UserActivity> {
    const supabase = getSupabase();
    const id = randomUUID();
    const now = new Date().toISOString();

    const activity: UserActivity = {
      id,
      user_id: userId,
      event_type: eventType,
      title,
      description,
      payload,
      created_at: now,
    };

    if (supabase) {
      try {
        await supabase.from("user_activity_feed").insert(activity);
      } catch (err) {
        console.warn("[UserService] Supabase activity log error:", err);
      }
    }

    const list = memoryStore.activities.get(userId) || [];
    list.unshift(activity);
    if (list.length > 100) list.pop();
    memoryStore.activities.set(userId, list);
    return activity;
  }

  static async getActivityFeed(userId: string, limit = 20): Promise<UserActivity[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("user_activity_feed")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit);
        if (!error && data) return data as UserActivity[];
      } catch (err) {
        console.warn("[UserService] Supabase activity lookup error:", err);
      }
    }

    const list = memoryStore.activities.get(userId) || [];
    return list.slice(0, limit);
  }

  // ==========================================================================
  // 6. Refresh Token Sessions (RTR)
  // ==========================================================================

  static async createSession(
    userId: string,
    tokenHash: string,
    deviceInfo?: string,
    ipAddress?: string,
    expiresAtMs: number = Date.now() + 7 * 24 * 60 * 60 * 1000
  ): Promise<AuthSession> {
    const supabase = getSupabase();
    const id = randomUUID();
    const now = new Date().toISOString();
    const expiresAt = new Date(expiresAtMs).toISOString();

    const session: AuthSession = {
      id,
      user_id: userId,
      token_hash: tokenHash,
      device_info: deviceInfo,
      ip_address: ipAddress,
      is_revoked: false,
      expires_at: expiresAt,
      created_at: now,
    };

    if (supabase) {
      try {
        await supabase.from("auth_sessions").insert(session);
      } catch (err) {
        console.warn("[UserService] Supabase session insert error:", err);
      }
    }

    memoryStore.sessions.set(tokenHash, session);
    return session;
  }

  static async findSession(tokenHash: string): Promise<AuthSession | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("auth_sessions")
          .select("*")
          .eq("token_hash", tokenHash)
          .single();
        if (!error && data) return data as AuthSession;
      } catch (err) {
        console.warn("[UserService] Supabase session lookup error:", err);
      }
    }

    return memoryStore.sessions.get(tokenHash) || null;
  }

  static async revokeSession(tokenHash: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from("auth_sessions")
          .update({ is_revoked: true })
          .eq("token_hash", tokenHash);
      } catch (err) {
        console.warn("[UserService] Supabase session revoke error:", err);
      }
    }

    const session = memoryStore.sessions.get(tokenHash);
    if (session) {
      session.is_revoked = true;
      memoryStore.sessions.set(tokenHash, session);
    }
  }
}
