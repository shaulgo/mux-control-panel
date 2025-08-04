import { type z } from 'zod';
import type { ApiResult } from './http';

/**
 * Typed HTTP client utilities for React hooks
 * Provides consistent error handling and response validation
 */

export type FetchError =
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'API_ERROR'; code: string; message: string }
  | { type: 'HTTP_ERROR'; status: number; message: string };

export type ClientResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: FetchError };

/**
 * Safe fetch with typed error handling and zod validation
 */
export async function safeFetch<T>(
  url: string,
  options: RequestInit & {
    responseSchema: z.ZodSchema<ApiResult<T>>;
  }
): Promise<ClientResult<T>> {
  const { responseSchema, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return {
        ok: false,
        error: {
          type: 'HTTP_ERROR',
          status: response.status,
          message: `HTTP ${response.status}: Invalid JSON response`,
        },
      };
    }

    // Validate response structure
    const parseResult = responseSchema.safeParse(json);
    if (!parseResult.success) {
      return {
        ok: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: `Invalid response format: ${parseResult.error.message}`,
        },
      };
    }

    const apiResult = parseResult.data;

    // Handle API-level errors
    if (!apiResult.ok) {
      return {
        ok: false,
        error: {
          type: 'API_ERROR',
          code: apiResult.error.code,
          message: apiResult.error.message,
        },
      };
    }

    // Handle HTTP-level errors (after successful JSON parse)
    if (!response.ok) {
      return {
        ok: false,
        error: {
          type: 'HTTP_ERROR',
          status: response.status,
          message: `HTTP ${response.status}: Request failed`,
        },
      };
    }

    return { ok: true, data: apiResult.data };
  } catch (error) {
    return {
      ok: false,
      error: {
        type: 'NETWORK_ERROR',
        message:
          error instanceof Error ? error.message : 'Network request failed',
      },
    };
  }
}

/**
 * Query parameters builder with proper encoding
 */
export function buildSearchParams(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

/**
 * Helper to convert ClientResult to standard Error for React Query
 */
export function clientResultToError(result: ClientResult<unknown>): Error {
  if (result.ok) {
    throw new Error('Cannot convert successful result to error');
  }

  const { error } = result;
  switch (error.type) {
    case 'API_ERROR':
      return new Error(`${error.code}: ${error.message}`);
    case 'HTTP_ERROR':
      return new Error(`HTTP ${error.status}: ${error.message}`);
    case 'VALIDATION_ERROR':
      return new Error(`Validation Error: ${error.message}`);
    case 'NETWORK_ERROR':
      return new Error(`Network Error: ${error.message}`);
  }
}
