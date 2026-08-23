import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JWTPayload } from "../utils/security.js";

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware that strictly enforces JWT authentication.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Authentication required",
      message: "Missing or malformed Authorization header. Use format: Bearer <access_token>",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({
      error: "Invalid or expired token",
      message: "Access token is invalid, expired, or has an invalid signature. Please refresh your session.",
    });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Middleware that optionally attaches user if valid token is present, but does not block guests.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}
