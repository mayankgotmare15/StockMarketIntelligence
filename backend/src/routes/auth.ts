import { Router, Request, Response } from "express";
import { z } from "zod";
import { UserService } from "../services/userService.js";
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/security.js";

export const authRouter: Router = Router();

const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.string().optional(),
  riskTolerance: z.string().optional(),
  tradingHorizon: z.string().optional(),
  defaultStock: z.string().optional(),
  primarySector: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * POST /api/auth/register
 * Register a new user with investor preferences and credentials.
 */
authRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const parseRes = RegisterSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parseRes.error.format(),
      });
      return;
    }

    const { email, password, fullName, role, riskTolerance, tradingHorizon, defaultStock, primarySector } =
      parseRes.data;

    // Check if email already registered
    const existing = await UserService.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        error: "Email already registered",
        message: "An account with this email address already exists. Please log in.",
      });
      return;
    }

    // Hash password & create user
    const passwordHash = hashPassword(password);
    const user = await UserService.createUser({
      email,
      passwordHash,
      fullName,
      role,
      riskTolerance,
      tradingHorizon,
      defaultStock,
      primarySector,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    // Save refresh session
    await UserService.createSession(
      user.id,
      tokenHash,
      req.headers["user-agent"],
      req.ip
    );

    // Audit log
    await UserService.logActivity(
      user.id,
      "register",
      "Account Created",
      `User ${user.full_name} joined StockAI platform as ${user.role}.`
    );

    // Safe user object (exclude password hash)
    const { password_hash: _, ...safeUser } = user;

    res.status(201).json({
      message: "Registration successful",
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error("[Auth] Registration error:", err);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user credentials and issue stateless JWT + rotated refresh token.
 */
authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const parseRes = LoginSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parseRes.error.format(),
      });
      return;
    }

    const { email, password } = parseRes.data;
    const user = await UserService.findUserByEmail(email);

    if (!user || !user.password_hash) {
      res.status(401).json({
        error: "Invalid credentials",
        message: "Incorrect email or password.",
      });
      return;
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({
        error: "Invalid credentials",
        message: "Incorrect email or password.",
      });
      return;
    }

    // Generate fresh tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await UserService.createSession(
      user.id,
      tokenHash,
      req.headers["user-agent"],
      req.ip
    );

    // Update last login
    await UserService.updateUserProfile(user.id, {
      last_login_at: new Date().toISOString(),
    });

    await UserService.logActivity(
      user.id,
      "login",
      "User Login",
      `Authenticated via mobile terminal.`
    );

    const { password_hash: _, ...safeUser } = user;

    res.json({
      message: "Login successful",
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error("[Auth] Login error:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh Token Rotation (RTR): Invalidate old refresh token and return fresh pair.
 */
authRouter.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const parseRes = RefreshSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({ error: "Validation failed", details: parseRes.error.format() });
      return;
    }

    const { refreshToken } = parseRes.data;
    const tokenHash = hashToken(refreshToken);

    const session = await UserService.findSession(tokenHash);
    if (!session || session.is_revoked) {
      res.status(401).json({
        error: "Invalid refresh token",
        message: "Refresh token is invalid or has been revoked.",
      });
      return;
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      res.status(401).json({
        error: "Expired refresh token",
        message: "Your session has expired. Please log in again.",
      });
      return;
    }

    // Rotate: Revoke the used refresh token immediately
    await UserService.revokeSession(tokenHash);

    const user = await UserService.findUserById(session.user_id);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Issue fresh pair
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashToken(newRefreshToken);

    await UserService.createSession(
      user.id,
      newTokenHash,
      req.headers["user-agent"],
      req.ip
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    console.error("[Auth] Refresh token error:", err);
    res.status(500).json({ error: "Token refresh failed", details: err.message });
  }
});

/**
 * POST /api/auth/logout
 * Revoke active refresh token session.
 */
authRouter.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await UserService.revokeSession(tokenHash);
    }
    res.json({ message: "Logged out successfully" });
  } catch (err: any) {
    console.error("[Auth] Logout error:", err);
    res.status(500).json({ error: "Logout failed", details: err.message });
  }
});

/**
 * POST /api/auth/demo
 * 1-Tap Pro Trader Demo Session.
 */
authRouter.post("/demo", async (req: Request, res: Response): Promise<void> => {
  try {
    const demoId = "00000000-0000-0000-0000-000000000001";
    let user = await UserService.findUserById(demoId);
    if (!user) {
      user = await UserService.createUser({
        email: "ariana.b@stockai.in",
        passwordHash: "",
        fullName: "Ariana B",
        role: "pro_trader",
        riskTolerance: "aggressive",
        tradingHorizon: "swing",
        defaultStock: "APOLLOHOSP.NS",
        primarySector: "Pharma",
      });
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await UserService.createSession(
      user.id,
      tokenHash,
      req.headers["user-agent"],
      req.ip
    );

    const { password_hash: _, ...safeUser } = user;

    res.json({
      message: "Demo session initialized",
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error("[Auth] Demo session error:", err);
    res.status(500).json({ error: "Demo initialization failed", details: err.message });
  }
});

const GoogleAuthSchema = z.object({
  email: z.string().email("Invalid Google email address"),
  fullName: z.string().min(1, "Full name is required"),
  avatarUrl: z.string().optional(),
  googleId: z.string().min(1, "Google ID is required"),
});

/**
 * POST /api/auth/google
 * Authenticate or register a user via Google OAuth 2.0 / Supabase.
 */
authRouter.post("/google", async (req: Request, res: Response): Promise<void> => {
  try {
    const parseRes = GoogleAuthSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parseRes.error.format(),
      });
      return;
    }

    const { email, fullName, avatarUrl, googleId } = parseRes.data;

    // Upsert user profile using Google identity
    const user = await UserService.upsertGoogleUser({
      email,
      fullName,
      avatarUrl,
      googleId,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await UserService.createSession(
      user.id,
      tokenHash,
      req.headers["user-agent"],
      req.ip
    );

    await UserService.logActivity(
      user.id,
      "google_login",
      "Google Sign-In",
      `Authenticated via Google OAuth 2.0 (${email}).`
    );

    const { password_hash: _, ...safeUser } = user;

    res.json({
      message: "Google authentication successful",
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error("[Auth] Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed", details: err.message });
  }
});

