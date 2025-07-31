import { muxData, muxVideo, type MuxAsset } from './client';
import type { DirectUpload } from './types';

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

  return response.data.map((item: unknown) => {
    if (item && typeof item === 'object') {
      const country = 'country' in item ? String(item.country) : 'Unknown';
      const views = 'value' in item ? Number(item.value) || 0 : 0;
      return { country, views };
    }
    return { country: 'Unknown', views: 0 };
  });
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
