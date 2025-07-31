import { muxData, muxVideo, type MuxAsset } from './client';
import type { DirectUpload } from './types';

// Strict output types for analytics helpers to avoid any
export type MuxCountRow = { value?: number } & Record<string, unknown>;
export type MuxDeviceRow = MuxCountRow & { device_category?: string };
export type MuxAssetRow = MuxCountRow & { asset_id?: string };

// Asset utilities
export async function createAssetFromUrl(url: string): Promise<MuxAsset> {
  const response = await muxVideo.createAsset({
    input: url,
    playback_policy: ['public'],
  });
  return response;
}

export async function waitForAssetReady(
  assetId: string,
  maxAttempts: number = 30,
  intervalMs: number = 3000
): Promise<MuxAsset> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const asset = await muxVideo.getAsset(assetId);

    if (asset.status === 'ready') {
      return asset;
    }

    if (asset.status === 'errored') {
      throw new Error(
        `Asset ${assetId} failed to process: ${asset.errors?.messages?.join(', ')}`
      );
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Asset ${assetId} did not become ready within ${maxAttempts} attempts`
  );
}

export async function getAssetWithRetry(
  assetId: string,
  maxRetries: number = 3
): Promise<MuxAsset | null> {
  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      const asset = await muxVideo.getAsset(assetId);
      return asset;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 404
      ) {
        return null;
      }

      if (retry === maxRetries) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
    }
  }

  return null;
}

// Direct upload utilities
export async function createDirectUploadUrl(
  corsOrigin?: string
): Promise<DirectUpload> {
  const params = {
    cors_origin: corsOrigin || '',
    new_asset_settings: {
      playback_policies: ['public' as const],
      mp4_support: 'standard' as const,
    },
  };

  const upload = await muxVideo.createDirectUpload(params);
  return upload;
}

export async function pollDirectUploadStatus(
  uploadId: string,
  onStatusChange?: (upload: DirectUpload) => void,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<DirectUpload> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const upload = await muxVideo.getDirectUpload(uploadId);

    onStatusChange?.(upload);

    if (upload.status === 'asset_created') {
      return upload;
    }

    if (
      upload.status === 'errored' ||
      upload.status === 'cancelled' ||
      upload.status === 'timed_out'
    ) {
      throw new Error(
        `Upload ${uploadId} failed with status: ${upload.status}`
      );
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Upload ${uploadId} did not complete within ${maxAttempts} attempts`
  );
}

// Analytics utilities
export async function getAssetViews(
  assetId: string,
  timeframe: string[] = ['7:days']
): Promise<unknown[]> {
  const response = await muxData.getVideoViews({
    filters: [`asset_id:${assetId}`],
    timeframe,
  });
  return response.data;
}

export async function getTotalViews(
  timeframe: string[] = ['30:days']
): Promise<number> {
  const response = await muxData.getVideoViews({
    timeframe,
    measurement: 'count',
  });

  return response.data.reduce((total: number, view: unknown) => {
    if (view && typeof view === 'object' && 'value' in view) {
      return total + (Number(view.value) || 0);
    }
    return total;
  }, 0);
}

export async function getViewsByCountry(
  timeframe: string[] = ['30:days']
): Promise<Array<{ country: string; views: number }>> {
  const response = await muxData.getVideoViews({
    timeframe,
    group_by: 'country',
    measurement: 'count',
  });

  return (response.data as unknown as MuxCountRow[]).map(item => {
    const rec = item as Record<string, unknown>;
    const country =
      typeof rec.country === 'string' && rec.country
        ? String(rec.country)
        : 'Unknown';
    const views =
      typeof item.value === 'number'
        ? item.value
        : Number(item.value ?? 0) || 0;
    return { country, views };
  });
}

// New: views grouped by device category (Desktop/Mobile/Tablet/etc)
export async function getViewsByDevice(
  timeframe: string[] = ['30:days']
): Promise<Array<{ device: string; views: number }>> {
  const response = await muxData.getVideoViews({
    timeframe,
    group_by: 'device_category',
    measurement: 'count',
  });

  return (response.data as unknown as MuxDeviceRow[]).map(item => {
    const device =
      typeof item.device_category === 'string' && item.device_category
        ? item.device_category
        : 'Unknown';
    const views =
      typeof item.value === 'number'
        ? item.value
        : Number(item.value ?? 0) || 0;
    return { device, views };
  });
}

// New: top assets by views, with optional limit
export async function getTopAssetsByViews(
  limit: number = 5,
  timeframe: string[] = ['30:days']
): Promise<Array<{ assetId: string; views: number }>> {
  const response = await muxData.getVideoViews({
    timeframe,
    group_by: 'asset_id',
    measurement: 'count',
    order_direction: 'desc',
  });

  const items = (response.data as unknown as MuxAssetRow[])
    .map(item => ({
      assetId:
        typeof item.asset_id === 'string' && item.asset_id
          ? String(item.asset_id)
          : '',
      views:
        typeof item.value === 'number'
          ? item.value
          : Number(item.value ?? 0) || 0,
    }))
    .filter(i => i.assetId)
    .sort((a, b) => b.views - a.views)
    .slice(0, Math.max(0, limit));

  return items;
}

// Utility functions
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function getAssetThumbnail(
  playbackId: string,
  width: number = 320,
  height: number = 180
): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${width}&height=${height}&fit_mode=crop`;
}
