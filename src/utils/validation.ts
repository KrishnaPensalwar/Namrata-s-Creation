/**
 * Input validation utilities
 */

import type { ValidationError } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// ID VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

export function isValidProductId(id: string): boolean {
  return /^(coll|feat)-\d+(-[a-z0-9]+)?$/i.test(id);
}

export function isValidServiceId(id: string): boolean {
  return /^svc-[a-z0-9-]+$/i.test(id);
}

export function isValidGalleryId(id: string): boolean {
  return /^gal-\d+$/i.test(id);
}

export function isValidCategoryId(id: string): boolean {
  return /^cat-[a-z0-9-]+$/i.test(id);
}

export function isValidTestimonialId(id: string): boolean {
  return /^test-\d+$/i.test(id);
}

export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// ═══════════════════════════════════════════════════════════════════════════
// STRING VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

export function isNotEmpty(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateRequired(value: unknown, fieldName: string): ValidationError | null {
  if (!isNotEmpty(value)) {
    return { field: fieldName, message: `${fieldName} is required and must be non-empty` };
  }
  return null;
}

export function validateString(value: unknown, fieldName: string, minLength = 1, maxLength = 10000): ValidationError | null {
  if (typeof value !== "string") {
    return { field: fieldName, message: `${fieldName} must be a string` };
  }
  if (value.length < minLength) {
    return { field: fieldName, message: `${fieldName} must be at least ${minLength} character(s)` };
  }
  if (value.length > maxLength) {
    return { field: fieldName, message: `${fieldName} must not exceed ${maxLength} character(s)` };
  }
  return null;
}

export function validateEmail(value: unknown): ValidationError | null {
  const email = String(value).trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: "email", message: "Invalid email address" };
  }
  return null;
}

export function validateHexColor(value: unknown): ValidationError | null {
  const hex = String(value).trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return { field: "color", message: "Invalid hex color format (e.g., #5b0218)" };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// NUMBER VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

export function validateInteger(value: unknown, fieldName: string): ValidationError | null {
  if (!Number.isInteger(value)) {
    return { field: fieldName, message: `${fieldName} must be an integer` };
  }
  return null;
}

export function validateNonNegative(value: unknown, fieldName: string): ValidationError | null {
  if (typeof value !== "number" || value < 0) {
    return { field: fieldName, message: `${fieldName} must be non-negative` };
  }
  return null;
}

export function validatePriceRange(
  priceMin: unknown,
  priceMax: unknown
): ValidationError | null {
  if (priceMin !== undefined && priceMax !== undefined) {
    if (typeof priceMin !== "number" || typeof priceMax !== "number") {
      return { field: "priceRange", message: "Prices must be numbers (paise)" };
    }
    if (priceMin < 0 || priceMax < 0) {
      return { field: "priceRange", message: "Prices must be non-negative" };
    }
    if (priceMin > priceMax) {
      return { field: "priceRange", message: "priceMin must be <= priceMax" };
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILE VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

const ALLOWED_IMAGE_MIMES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateImageMimeType(mimeType: string): ValidationError | null {
  if (!ALLOWED_IMAGE_MIMES.includes(mimeType)) {
    return {
      field: "mimeType",
      message: `Unsupported image type: ${mimeType}. Allowed: PNG, JPEG, WebP`,
    };
  }
  return null;
}

export function validateImageFileSize(fileSize: number): ValidationError | null {
  if (fileSize > MAX_FILE_SIZE) {
    return {
      field: "fileSize",
      message: `File too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB (max 10MB)`,
    };
  }
  if (fileSize === 0) {
    return { field: "fileSize", message: "File is empty" };
  }
  return null;
}

export function validateImageFile(
  mimeType: string,
  fileSize: number
): ValidationError | null {
  let error = validateImageMimeType(mimeType);
  if (error) return error;

  error = validateImageFileSize(fileSize);
  if (error) return error;

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

export function validatePaginationParams(
  limit?: unknown,
  offset?: unknown
): { limit: number; offset: number; error?: ValidationError } {
  let parsedLimit = 50;
  let parsedOffset = 0;
  let error: ValidationError | undefined;

  // URLSearchParams.get() returns null when absent — treat as missing
  const limitVal = limit === null || limit === "" ? undefined : limit;
  const offsetVal = offset === null || offset === "" ? undefined : offset;

  if (limitVal !== undefined) {
    const l = Number(limitVal);
    if (!Number.isInteger(l) || l < 1 || l > 1000) {
      error = { field: "limit", message: "limit must be an integer between 1 and 1000" };
      parsedLimit = 50;
    } else {
      parsedLimit = l;
    }
  }

  if (offsetVal !== undefined) {
    const o = Number(offsetVal);
    if (!Number.isInteger(o) || o < 0) {
      error = error || { field: "offset", message: "offset must be a non-negative integer" };
      parsedOffset = 0;
    } else {
      parsedOffset = o;
    }
  }

  return { limit: parsedLimit, offset: parsedOffset, error };
}

// ═══════════════════════════════════════════════════════════════════════════
// QUERY PARAMETER VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

export function getStringParam(params: URLSearchParams, key: string): string | null {
  const value = params.get(key);
  return value ? value.trim() : null;
}

export function getNumberParam(params: URLSearchParams, key: string): number | null {
  const value = params.get(key);
  if (!value) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

export function validateGalleryFilter(filter: string | null): ValidationError | null {
  if (!filter) return null;

  const validFilters = ["all", "floral", "festive", "bridal", "decor"];
  if (!validFilters.includes(filter)) {
    return {
      field: "filter",
      message: `Invalid gallery filter. Allowed: ${validFilters.join(", ")}`,
    };
  }
  return null;
}

export function validateSortParam(sort: string | null): ValidationError | null {
  if (!sort) return null;

  const validSorts = ["displayOrder", "createdAt", "priceMin"];
  if (!validSorts.includes(sort)) {
    return {
      field: "sort",
      message: `Invalid sort. Allowed: ${validSorts.join(", ")}`,
    };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Collect all validation errors
 */
export function collectErrors(...errors: (ValidationError | null)[]): ValidationError[] {
  return errors.filter((e): e is ValidationError => e !== null);
}

/**
 * Check if there are any errors
 */
export function hasErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

/**
 * Format errors for API response
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  const result: Record<string, string> = {};
  errors.forEach((err) => {
    result[err.field] = err.message;
  });
  return result;
}
