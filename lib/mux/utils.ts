import { muxData, muxVideo, type MuxAsset } from './client';
import type {
  AssetViews,
  CountryViews,
  DeviceViews,
  DirectUpload,
  Err,
  Ok,
  Result,
} from './types';

// Asset utilities
/**
 * Create an asset from a URL.
 * Side-effecting boundary; returns Result to avoid throws in business logic.
 */
export async function createAssetFromUrl(
  url: string
): Promise<Result<MuxAsset, 'MUX_CREATE_ASSET_FAILED'>> {
  try {
    const response = await muxVideo.createAsset({
      input: url,
      playback_policy: ['public'],
    });
    return { ok: true, data: response } satisfies Ok<MuxAsset>;
  } catch (e) {
    const message =
      e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Mux createAsset failed';
    return {
      ok: false,
      error: { code: 'MUX_CREATE_ASSET_FAILED', message },
    } satisfies Err<'MUX_CREATE_ASSET_FAILED'>;
  }
}

/**
 * Poll for asset readiness with bounded retries.
 * Returns Result to avoid throwing; caller decides how to surface error.
 */
export async function waitForAssetReady(
  assetId: string,
  maxAttempts: number = 30,
  intervalMs: number = 3000
): Promise<Result<MuxAsset, 'MUX_ASSET_TIMEOUT' | 'MUX_ASSET_FAILED'>> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const asset = await muxVideo.getAsset(assetId);

    if (asset.status === 'ready') {
      return { ok: true, data: asset } satisfies Ok<MuxAsset>;
    }

    if (asset.status === 'errored') {
      const messages =
        Array.isArray(asset.errors?.messages) &&
        asset.errors.messages.length > 0
          ? asset.errors.messages.join(', ')
          : 'unknown error';
      return {
        ok: false,
        error: {
          code: 'MUX_ASSET_FAILED',
          message: `Asset ${assetId} failed to process: ${messages}`,
        },
      } satisfies Err<'MUX_ASSET_FAILED'>;
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return {
    ok: false,
    error: {
      code: 'MUX_ASSET_TIMEOUT',
      message: `Asset ${assetId} did not become ready within ${maxAttempts} attempts`,
    },
  } satisfies Err<'MUX_ASSET_TIMEOUT'>;
}

/**
 * Fetch an asset with simple retry, returning null on 404 and Result error on other failures.
 */
export async function getAssetWithRetry(
  assetId: string,
  maxRetries: number = 3
): Promise<Result<MuxAsset | null, 'MUX_GET_ASSET_FAILED'>> {
  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      const asset = await muxVideo.getAsset(assetId);
      return { ok: true, data: asset } satisfies Ok<MuxAsset>;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in (error as Record<string, unknown>) &&
        Number((error as { status?: unknown }).status) === 404
      ) {
        return { ok: true, data: null } satisfies Ok<null>;
      }

      if (retry === maxRetries) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message?: unknown }).message)
            : 'Mux getAsset failed';
        return {
          ok: false,
          error: { code: 'MUX_GET_ASSET_FAILED', message },
        } satisfies Err<'MUX_GET_ASSET_FAILED'>;
      }

      // Wait before retry with linear backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
    }
  }

  // Should not reach here
  return { ok: true, data: null } satisfies Ok<null>;
}

// Direct upload utilities
/**
 * Create a direct upload URL on Mux. Returns Result instead of throwing.
 */
export async function createDirectUploadUrl(
  corsOrigin?: string
): Promise<Result<DirectUpload, 'MUX_CREATE_DIRECT_UPLOAD_FAILED'>> {
  try {
    const params = {
      cors_origin: corsOrigin ?? '',
      new_asset_settings: {
        playback_policies: ['public' as const],
      },
    };
    const upload = await muxVideo.createDirectUpload(params);
    return { ok: true, data: upload } satisfies Ok<DirectUpload>;
  } catch (e) {
    const message =
      e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Mux createDirectUpload failed';
    return {
      ok: false,
      error: { code: 'MUX_CREATE_DIRECT_UPLOAD_FAILED', message },
    } satisfies Err<'MUX_CREATE_DIRECT_UPLOAD_FAILED'>;
  }
}

/**
 * Poll a direct upload until completion, returning Result instead of throwing.
 */
export async function pollDirectUploadStatus(
  uploadId: string,
  onStatusChange?: (upload: DirectUpload) => void,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<
  Result<DirectUpload, 'MUX_DIRECT_UPLOAD_FAILED' | 'MUX_DIRECT_UPLOAD_TIMEOUT'>
> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const upload = await muxVideo.getDirectUpload(uploadId);

    onStatusChange?.(upload);

    if (upload.status === 'asset_created') {
      return { ok: true, data: upload } satisfies Ok<DirectUpload>;
    }

    if (
      upload.status === 'errored' ||
      upload.status === 'cancelled' ||
      upload.status === 'timed_out'
    ) {
      return {
        ok: false,
        error: {
          code: 'MUX_DIRECT_UPLOAD_FAILED',
          message: `Upload ${uploadId} failed with status: ${upload.status}`,
        },
      } satisfies Err<'MUX_DIRECT_UPLOAD_FAILED'>;
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return {
    ok: false,
    error: {
      code: 'MUX_DIRECT_UPLOAD_TIMEOUT',
      message: `Upload ${uploadId} did not complete within ${maxAttempts} attempts`,
    },
  } satisfies Err<'MUX_DIRECT_UPLOAD_TIMEOUT'>;
}

// Analytics utilities with defensive typing to handle Mux SDK responses
export async function getAssetViews(
  assetId: string,
  timeframe: string[] = ['7:days']
): Promise<Result<unknown[], 'MUX_DATA_FAILED'>> {
  try {
    const response = await muxData.getVideoViews({
      filters: [`asset_id:${assetId}`],
      timeframe,
    });

    return { ok: true, data: response.data } satisfies Ok<unknown[]>;
  } catch (e) {
    const message =
      e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Mux data query failed';
    return {
      ok: false,
      error: { code: 'MUX_DATA_FAILED', message },
    } satisfies Err<'MUX_DATA_FAILED'>;
  }
}

export async function getTotalViews(
  timeframe: string[] = ['30:days']
): Promise<number> {
  try {
    const response = await muxData.getVideoViews({
      timeframe,
      measurement: 'count',
    });

    return response.data.reduce((total: number, view: unknown) => {
      if (view && typeof view === 'object' && 'value' in view) {
        const v = Number((view as { value?: unknown }).value);
        return Number.isFinite(v) ? total + v : total;
      }
      return total;
    }, 0);
  } catch (e) {
    console.warn('Failed to get total views:', e);
    return 0;
  }
}

export async function getViewsByCountry(
  timeframe: string[] = ['30:days']
): Promise<CountryViews[]> {
  try {
    const response = await muxData.getVideoViews({
      timeframe,
      group_by: 'country',
      measurement: 'count',
    });

    return response.data.map((item: unknown): CountryViews => {
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        const rawCountry = record.country;
        const country =
          typeof rawCountry === 'string' && rawCountry.trim().length > 0
            ? rawCountry
            : 'Unknown';
        const rawValue = record.value;
        const views = Number.isFinite(Number(rawValue)) ? Number(rawValue) : 0;
        return { country, views };
      }
      return { country: 'Unknown', views: 0 };
    });
  } catch (e) {
    console.warn('Failed to get views by country:', e);
    return [];
  }
}

export async function getViewsByDevice(
  timeframe: string[] = ['30:days']
): Promise<DeviceViews[]> {
  try {
    const response = await muxData.getVideoViews({
      timeframe,
      group_by: 'device_category',
      measurement: 'count',
    });

    return response.data.map((item: unknown): DeviceViews => {
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        const rawDevice = record.device_category;
        const device =
          typeof rawDevice === 'string' && rawDevice.trim().length > 0
            ? rawDevice
            : 'Unknown';
        const rawValue = record.value;
        const views = Number.isFinite(Number(rawValue)) ? Number(rawValue) : 0;
        return { device, views };
      }
      return { device: 'Unknown', views: 0 };
    });
  } catch (e) {
    console.warn('Failed to get views by device:', e);
    return [];
  }
}

export async function getTopAssetsByViews(
  limit: number = 5,
  timeframe: string[] = ['30:days']
): Promise<AssetViews[]> {
  try {
    const response = await muxData.getVideoViews({
      timeframe,
      group_by: 'asset_id',
      measurement: 'count',
      order_direction: 'desc',
    });

    const validItems: AssetViews[] = [];

    for (const item of response.data) {
      if (typeof item === 'object') {
        const record = item as unknown as Record<string, unknown>;
        const rawAssetId = record.asset_id;
        const assetId =
          typeof rawAssetId === 'string' && rawAssetId.trim().length > 0
            ? rawAssetId
            : '';
        const rawValue = record.value;
        const views = Number.isFinite(Number(rawValue)) ? Number(rawValue) : 0;

        if (assetId.length > 0) {
          validItems.push({ assetId, views });
        }
      }
    }

    // Sort by views descending and take top N
    const sortedItems = validItems.slice(); // Create a copy to avoid mutation

    sortedItems.sort((a, b) => {
      const aViews = a.views;

      const bViews = b.views;
      return bViews - aViews;
    });
    return sortedItems.slice(0, Math.max(0, limit));
  } catch (e) {
    console.warn('Failed to get top assets by views:', e);
    return [];
  }
}

// Utility functions
/**
 * Format seconds to H:MM:SS or M:SS.
 */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = Math.floor(total % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format byte size with fixed precision and unit selection.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0.0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Build a thumbnail URL for a given playback id and size.
 */
export function getAssetThumbnail(
  playbackId: string,
  width: number = 320,
  height: number = 180
): string {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${w}&height=${h}&fit_mode=crop`;
}
