import type { Result } from '@/lib/mux/types';
import { NextResponse } from 'next/server';

/**
 * ApiOk/ApiError helpers to standardize API payloads at boundaries.
 */

export type ApiOk<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: { code: string; message: string } };
export type ApiResult<T> = ApiOk<T> | ApiError;

export function apiOk<T>(data: T): ApiOk<T> {
  return { ok: true, data };
}

export function apiErr(code: string, message: string): ApiError {
  return { ok: false, error: { code, message } };
}

/**
 * Map a domain Result<T,E> to an HTTP response with a provided code->status map.
 * Enforces explicit handling of each error code at the route layer.
 */
export function resultToHttp<T, E extends string>(
  result: Result<T, E>,
  statusMap: Record<E, number>,
  headers?: Record<string, string>
): NextResponse {
  const init: ResponseInit = {
    status: result.ok ? 200 : statusMap[result.error.code] || 500,
    ...(headers ? { headers: new Headers(headers) } : {}),
  };

  if (result.ok) {
    return NextResponse.json(apiOk(result.data), init);
  }

  return NextResponse.json(
    apiErr(result.error.code, result.error.message),
    init
  );
}

/**
 * Utility to clamp number query parameters within bounds.
 */
export function clampInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  const n = Number.parseInt(raw ?? `${fallback}`, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
