/**
 * Authentication middleware for API key verification
 */

import type { Env, AuthContext } from "../types";
import { unauthorized } from "../utils/response";

/**
 * Hash an API key using SHA-256
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify API key from Authorization header
 */
export async function verifyApiKey(request: Request, env: Env): Promise<AuthContext> {
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const providedKey = match[1].trim();
  if (!providedKey) {
    return { valid: false, error: "Empty API key" };
  }

  try {
    // Hash the provided key
    const providedHash = await hashApiKey(providedKey);

    // Query D1 to check if this hash exists and is active
    const result = await env.DB.prepare(
      "SELECT id, is_active FROM admin_users WHERE api_key_hash = ? LIMIT 1"
    )
      .bind(providedHash)
      .first<{ id: string; is_active: number }>();

    if (!result) {
      return { valid: false, error: "Invalid API key" };
    }

    if (result.is_active === 0) {
      return { valid: false, error: "API key is revoked or inactive" };
    }

    // Update last_used_at
    try {
      await env.DB.prepare(
        "UPDATE admin_users SET last_used_at = ? WHERE id = ?"
      )
        .bind(new Date().toISOString(), result.id)
        .run();
    } catch (err) {
      console.warn("Failed to update last_used_at:", err);
      // Don't fail the request; this is just tracking
    }

    return { valid: true, userId: result.id };
  } catch (err) {
    console.error("Auth verification error:", err);
    return { valid: false, error: "Authentication failed" };
  }
}

/**
 * Middleware to enforce authentication on admin endpoints
 */
export async function requireAuth(request: Request, env: Env): Promise<Response | null> {
  const authContext = await verifyApiKey(request, env);

  if (!authContext.valid) {
    return unauthorized(authContext.error || "Unauthorized");
  }

  // Attach user ID to request (would need custom context passing in Workers)
  (request as any).userId = authContext.userId;

  return null; // Continue to handler
}

/**
 * Check if request is from an allowed origin
 */
export function checkCorsOrigin(request: Request, allowedOrigins: string[]): boolean {
  const origin = request.headers.get("Origin") || "";
  if (!origin) return true; // No CORS check for non-browser requests
  if (!allowedOrigins.length || allowedOrigins.includes("*")) return true;

  return allowedOrigins.some((allowed) => {
    if (allowed.includes("*")) {
      const regex = new RegExp("^" + allowed.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
      return regex.test(origin);
    }
    return allowed === origin;
  });
}
