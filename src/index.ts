/**
 * Ratnāvali Boutique API — Cloudflare Worker entry
 */

import type { Env } from "./types";
import { handlePublicRoutes } from "./routes/public";
import { handleAdminRoutes } from "./routes/admin";
import { notFound, handleOptions } from "./utils/response";
import { checkCorsOrigin } from "./middleware/auth";
import { getMediaObject } from "./services/media";

function withCors(request: Request, response: Response, allowedOrigins: string[]): Response {
  const origin = request.headers.get("Origin") || "";
  const headers = new Headers(response.headers);

  const allowAll =
    !allowedOrigins.length ||
    allowedOrigins.includes("*") ||
    allowedOrigins.some((o) => o === "*");

  if (allowAll) {
    headers.set("Access-Control-Allow-Origin", origin || "*");
  } else if (checkCorsOrigin(request, allowedOrigins)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const allowedOrigins = (env.ALLOWED_ORIGINS || "*")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (request.method === "OPTIONS") {
      return handleOptions(request, allowedOrigins.includes("*") ? [request.headers.get("Origin") || "*", "*"] : allowedOrigins);
    }

    // Public media delivery from R2
    if (url.pathname.startsWith("/media/") && request.method === "GET") {
      const objectKey = decodeURIComponent(url.pathname.slice("/media/".length));
      if (!objectKey || objectKey.includes("..")) {
        return withCors(request, notFound("Media not found"), allowedOrigins);
      }
      const obj = await getMediaObject(env, objectKey);
      if (!obj || !obj.body) {
        return withCors(request, notFound("Media not found"), allowedOrigins);
      }
      return withCors(
        request,
        new Response(obj.body, {
          headers: {
            "Content-Type": obj.contentType,
            "Cache-Control": "public, max-age=86400, immutable",
          },
        }),
        allowedOrigins
      );
    }

    let response: Response;

    if (url.pathname.startsWith("/api/v1/admin/")) {
      response = await handleAdminRoutes(request, env);
    } else if (url.pathname.startsWith("/api/v1/")) {
      response = await handlePublicRoutes(request, env);
    } else if (url.pathname === "/" || url.pathname === "/health") {
      response = new Response(
        JSON.stringify({
          success: true,
          data: { service: "namrata-boutique-api", version: "1.0", status: "ok" },
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } else {
      response = notFound("API endpoint not found");
    }

    return withCors(request, response, allowedOrigins);
  },
};
