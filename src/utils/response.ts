/**
 * Response utilities for standardized API responses
 */

import type { ApiResponse } from "../types";

/**
 * Success response with data
 */
export function success<T>(data: T, status = 200, meta?: { total?: number; limit?: number; offset?: number }): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0",
      ...meta,
    },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Error response
 */
export function error(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0",
    },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * 400 Bad Request
 */
export function badRequest(message: string, details?: Record<string, unknown>): Response {
  return error("BAD_REQUEST", message, 400, details);
}

/**
 * 401 Unauthorized
 */
export function unauthorized(message = "Unauthorized"): Response {
  return error("UNAUTHORIZED", message, 401);
}

/**
 * 403 Forbidden (same as 401 to prevent API enumeration)
 */
export function forbidden(message = "Forbidden"): Response {
  return error("FORBIDDEN", message, 403);
}

/**
 * 404 Not Found
 */
export function notFound(message = "Resource not found"): Response {
  return error("NOT_FOUND", message, 404);
}

/**
 * 409 Conflict
 */
export function conflict(message: string, details?: Record<string, unknown>): Response {
  return error("CONFLICT", message, 409, details);
}

/**
 * 422 Unprocessable Entity
 */
export function unprocessable(message: string, details?: Record<string, unknown>): Response {
  return error("UNPROCESSABLE_ENTITY", message, 422, details);
}

/**
 * 500 Internal Server Error
 */
export function serverError(message = "Internal server error", requestId?: string): Response {
  const details = requestId ? { requestId } : undefined;
  return error("INTERNAL_ERROR", message, 500, details);
}

/**
 * 204 No Content (deletion success)
 */
export function noContent(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * CORS headers based on origin
 */
export function corsHeaders(
  request: Request,
  allowedOrigins: string[]
): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }

  return headers;
}

/**
 * Handle preflight OPTIONS request
 */
export function handleOptions(request: Request, allowedOrigins: string[]): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, allowedOrigins),
  });
}
