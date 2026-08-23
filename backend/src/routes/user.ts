import { Router, Request, Response } from "express";
import { z } from "zod";
import { UserService } from "../services/userService.js";
import { requireAuth } from "../middleware/auth.js";

export const userRouter: Router = Router();

// All user routes require authentication
userRouter.use(requireAuth);

// ============================================================================
// 1. Profile Management
// ============================================================================

const ProfileUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).optional(),
  tradingHorizon: z.enum(["intraday", "swing", "positional"]).optional(),
  defaultStock: z.string().optional(),
  primarySector: z.string().optional(),
});

userRouter.get("/profile", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await UserService.findUserById(userId);

    if (!user) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }

    const { password_hash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err: any) {
    console.error("[User] Get profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile", details: err.message });
  }
});

userRouter.put("/profile", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const parseRes = ProfileUpdateSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({ error: "Validation failed", details: parseRes.error.format() });
      return;
    }

    const updates: any = {};
    if (parseRes.data.fullName) updates.full_name = parseRes.data.fullName;
    if (parseRes.data.avatarUrl) updates.avatar_url = parseRes.data.avatarUrl;
    if (parseRes.data.riskTolerance) updates.risk_tolerance = parseRes.data.riskTolerance;
    if (parseRes.data.tradingHorizon) updates.trading_horizon = parseRes.data.tradingHorizon;
    if (parseRes.data.defaultStock) updates.default_stock = parseRes.data.defaultStock;
    if (parseRes.data.primarySector) updates.primary_sector = parseRes.data.primarySector;

    const updated = await UserService.updateUserProfile(userId, updates);
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await UserService.logActivity(
      userId,
      "profile_update",
      "Profile Updated",
      `Investor profile settings updated.`
    );

    const { password_hash: _, ...safeUser } = updated;
    res.json({ message: "Profile updated successfully", user: safeUser });
  } catch (err: any) {
    console.error("[User] Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
});

// ============================================================================
// 2. ML Preferences & Custom Drift Sensitivity
// ============================================================================

const PreferencesUpdateSchema = z.object({
  driftThreshold: z.number().min(1.0).max(4.0).optional(),
  primaryBaseline: z.string().optional(),
  alertVolatilitySpike: z.boolean().optional(),
  alertDriftDetected: z.boolean().optional(),
  biometricEnabled: z.boolean().optional(),
});

userRouter.get("/preferences", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const preferences = await UserService.getUserPreferences(userId);
    res.json({ preferences });
  } catch (err: any) {
    console.error("[User] Get preferences error:", err);
    res.status(500).json({ error: "Failed to fetch preferences", details: err.message });
  }
});

userRouter.put("/preferences", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const parseRes = PreferencesUpdateSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({ error: "Validation failed", details: parseRes.error.format() });
      return;
    }

    const updates: any = {};
    if (parseRes.data.driftThreshold !== undefined)
      updates.drift_threshold = parseRes.data.driftThreshold;
    if (parseRes.data.primaryBaseline !== undefined)
      updates.primary_baseline = parseRes.data.primaryBaseline;
    if (parseRes.data.alertVolatilitySpike !== undefined)
      updates.alert_volatility_spike = parseRes.data.alertVolatilitySpike;
    if (parseRes.data.alertDriftDetected !== undefined)
      updates.alert_drift_detected = parseRes.data.alertDriftDetected;
    if (parseRes.data.biometricEnabled !== undefined)
      updates.biometric_enabled = parseRes.data.biometricEnabled;

    const preferences = await UserService.updateUserPreferences(userId, updates);

    await UserService.logActivity(
      userId,
      "preferences_update",
      "ML Settings Updated",
      `Drift threshold set to |z| > ${preferences.drift_threshold}.`
    );

    res.json({ message: "Preferences updated", preferences });
  } catch (err: any) {
    console.error("[User] Update preferences error:", err);
    res.status(500).json({ error: "Failed to update preferences", details: err.message });
  }
});

// ============================================================================
// 3. User Watchlist Management
// ============================================================================

const WatchlistAddSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  notes: z.string().optional(),
  targetEntryPrice: z.number().optional(),
  targetStopLoss: z.number().optional(),
});

userRouter.get("/watchlist", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const watchlist = await UserService.getWatchlist(userId);
    res.json({ watchlist });
  } catch (err: any) {
    console.error("[User] Get watchlist error:", err);
    res.status(500).json({ error: "Failed to fetch watchlist", details: err.message });
  }
});

userRouter.post("/watchlist", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const parseRes = WatchlistAddSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({ error: "Validation failed", details: parseRes.error.format() });
      return;
    }

    const { symbol, notes, targetEntryPrice, targetStopLoss } = parseRes.data;
    const item = await UserService.addToWatchlist(
      userId,
      symbol,
      notes,
      targetEntryPrice,
      targetStopLoss
    );

    await UserService.logActivity(
      userId,
      "watchlist_add",
      "Added to Watchlist",
      `Added ${symbol} to active tracking portfolio.`
    );

    res.status(201).json({ message: "Added to watchlist", item });
  } catch (err: any) {
    console.error("[User] Add to watchlist error:", err);
    res.status(500).json({ error: "Failed to add to watchlist", details: err.message });
  }
});

userRouter.delete("/watchlist/:symbol", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const symbol = (Array.isArray(req.params.symbol) ? req.params.symbol[0] : req.params.symbol) as string;
    await UserService.removeFromWatchlist(userId, symbol);

    await UserService.logActivity(
      userId,
      "watchlist_remove",
      "Removed from Watchlist",
      `Removed ${symbol} from active tracking portfolio.`
    );

    res.json({ message: `Removed ${symbol} from watchlist` });
  } catch (err: any) {
    console.error("[User] Remove from watchlist error:", err);
    res.status(500).json({ error: "Failed to remove from watchlist", details: err.message });
  }
});

// ============================================================================
// 4. Saved Simulations (Keypad Scenarios)
// ============================================================================

const SimulationSaveSchema = z.object({
  symbol: z.string().min(1),
  inputPrice: z.number(),
  scenarioType: z.string(),
  simulatedAdaptiveReturn: z.number(),
  simulatedStaticReturn: z.number(),
  simulatedAdaptivePrice: z.number(),
  simulatedStaticPrice: z.number(),
  simulatedErrorReduction: z.number(),
  notes: z.string().optional(),
});

userRouter.get("/simulations", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const simulations = await UserService.getSimulations(userId);
    res.json({ simulations });
  } catch (err: any) {
    console.error("[User] Get simulations error:", err);
    res.status(500).json({ error: "Failed to fetch simulations", details: err.message });
  }
});

userRouter.post("/simulations", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const parseRes = SimulationSaveSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({ error: "Validation failed", details: parseRes.error.format() });
      return;
    }

    const {
      symbol,
      inputPrice,
      scenarioType,
      simulatedAdaptiveReturn,
      simulatedStaticReturn,
      simulatedAdaptivePrice,
      simulatedStaticPrice,
      simulatedErrorReduction,
      notes,
    } = parseRes.data;

    const simulation = await UserService.saveSimulation(userId, {
      symbol,
      input_price: inputPrice,
      scenario_type: scenarioType,
      simulated_adaptive_return: simulatedAdaptiveReturn,
      simulated_static_return: simulatedStaticReturn,
      simulated_adaptive_price: simulatedAdaptivePrice,
      simulated_static_price: simulatedStaticPrice,
      simulated_error_reduction: simulatedErrorReduction,
      notes,
    });

    await UserService.logActivity(
      userId,
      "simulation_run",
      "Scenario Simulated",
      `Executed ${scenarioType} scenario for ${symbol} at ₹${inputPrice}.`
    );

    res.status(201).json({ message: "Simulation saved successfully", simulation });
  } catch (err: any) {
    console.error("[User] Save simulation error:", err);
    res.status(500).json({ error: "Failed to save simulation", details: err.message });
  }
});

// ============================================================================
// 5. Activity Feed
// ============================================================================

userRouter.get("/activity", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const activity = await UserService.getActivityFeed(userId, limit);
    res.json({ activity });
  } catch (err: any) {
    console.error("[User] Get activity error:", err);
    res.status(500).json({ error: "Failed to fetch activity", details: err.message });
  }
});
