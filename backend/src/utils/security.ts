import crypto from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET || "sikka-stockai-super-secret-jwt-key-2026-production";
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a plain text password using PBKDF2 with SHA-512 and a random 16-byte salt.
 * Format: `<iterations>$<saltHex>$<hashHex>`
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, 64, "sha512")
    .toString("hex");
  return `${iterations}$${salt}$${hash}`;
}

/**
 * Verify a plain text password against a stored PBKDF2 hash using timing-safe comparison.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 3) return false;
    const iterations = parseInt(parts[0], 10);
    const salt = parts[1];
    const originalHash = Buffer.from(parts[2], "hex");

    const computedHash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512");
    return crypto.timingSafeEqual(originalHash, computedHash);
  } catch {
    return false;
  }
}

/**
 * Base64URL encoding helper.
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf8");
}

/**
 * Generate a signed JWT Access Token (HMAC-SHA256).
 */
export function generateAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Date.now();
  const fullPayload: JWTPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + ACCESS_TOKEN_EXPIRY_MS) / 1000),
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${headerB64}.${payloadB64}.${signature}`;
}

/**
 * Verify and decode a JWT Access Token.
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadB64));
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      return null; // Expired token
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Generate a cryptographically secure random Refresh Token string (64 characters).
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a refresh token for storage in the database (SHA-256).
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
