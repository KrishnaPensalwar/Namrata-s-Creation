/**
 * Centralized R2 media storage service.
 * Callers never touch R2 credentials — only this module uses the binding.
 */

import type { Env, MediaItem } from "../types";
import { rowToMedia, type MediaRow } from "../types";
import { validateImageFile } from "../utils/validation";
import { mediaIsReferenced } from "./db";

const ALLOWED_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function cdnBase(env: Env, requestUrl?: string): string {
  if (env.CDN_URL) return env.CDN_URL.replace(/\/$/, "");
  if (requestUrl) {
    const u = new URL(requestUrl);
    return `${u.origin}/media`;
  }
  return "/media";
}

function generateObjectKey(mimeType: string): string {
  const ext = ALLOWED_EXT[mimeType] || "bin";
  const id = crypto.randomUUID();
  return `${Date.now()}-${id}.${ext}`;
}

/** Magic-byte sniff for PNG / JPEG / WebP */
export function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // WebP (RIFF....WEBP)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export interface UploadInput {
  bytes: ArrayBuffer;
  claimedMimeType: string;
  altText: string;
  title?: string;
  requestUrl?: string;
}

export async function uploadMedia(env: Env, input: UploadInput): Promise<MediaItem> {
  const bytes = new Uint8Array(input.bytes);
  const sniffed = sniffImageMime(bytes);
  const mimeType = sniffed || input.claimedMimeType;

  const validation = validateImageFile(mimeType, bytes.byteLength);
  if (validation) {
    throw new Error(validation.message);
  }
  if (sniffed && input.claimedMimeType && sniffed !== input.claimedMimeType) {
    // Prefer sniffed type; reject if claimed was allowed but content differs badly
    if (!ALLOWED_EXT[sniffed]) {
      throw new Error(`Unsupported image content type: ${sniffed}`);
    }
  }

  const id = crypto.randomUUID();
  const objectKey = generateObjectKey(mimeType);
  const publicUrl = `${cdnBase(env, input.requestUrl)}/${objectKey}`;
  const now = new Date().toISOString();

  await env.MEDIA.put(objectKey, input.bytes, {
    httpMetadata: { contentType: mimeType },
    customMetadata: { mediaId: id, altText: input.altText },
  });

  try {
    await env.DB.prepare(
      `INSERT INTO media (id, object_key, public_url, mime_type, alt_text, title, width, height, file_size, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        objectKey,
        publicUrl,
        mimeType,
        input.altText,
        input.title || null,
        null,
        null,
        bytes.byteLength,
        now
      )
      .run();
  } catch (err) {
    // Roll back R2 object if D1 insert fails
    try {
      await env.MEDIA.delete(objectKey);
    } catch {
      /* ignore */
    }
    throw err;
  }

  return {
    id,
    objectKey,
    publicUrl,
    mimeType,
    altText: input.altText,
    title: input.title,
    fileSize: bytes.byteLength,
    createdAt: now,
  };
}

export async function deleteMediaSafe(env: Env, mediaId: string): Promise<{ deleted: boolean; reason?: string }> {
  const row = await env.DB.prepare("SELECT * FROM media WHERE id = ? LIMIT 1")
    .bind(mediaId)
    .first<MediaRow>();

  if (!row) {
    return { deleted: false, reason: "not_found" };
  }

  if (await mediaIsReferenced(env, mediaId)) {
    return { deleted: false, reason: "referenced" };
  }

  await env.DB.prepare("DELETE FROM media WHERE id = ?").bind(mediaId).run();
  try {
    await env.MEDIA.delete(row.object_key);
  } catch (err) {
    console.warn("R2 delete failed after D1 delete:", err);
  }

  return { deleted: true };
}

export async function getMediaObject(
  env: Env,
  objectKey: string
): Promise<{ body: ReadableStream | null; contentType: string } | null> {
  const obj = await env.MEDIA.get(objectKey);
  if (!obj) return null;
  return {
    body: obj.body,
    contentType: obj.httpMetadata?.contentType || "application/octet-stream",
  };
}

export async function getMediaById(env: Env, id: string): Promise<MediaItem | null> {
  const row = await env.DB.prepare("SELECT * FROM media WHERE id = ? LIMIT 1")
    .bind(id)
    .first<MediaRow>();
  return row ? rowToMedia(row) : null;
}
