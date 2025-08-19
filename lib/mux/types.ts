// Import actual Mux SDK types
import type { MuxAsset, MuxPlaybackID, MuxUpload } from './client';

// Re-export for convenience
export type { MuxAsset, MuxPlaybackID, MuxUpload };

// Result type for typed error handling
export type Ok<T> = { ok: true; data: T };
export type Err<E extends string = string> = {
  ok: false;
  error: { code: E; message: string };
};
export type Result<T, E extends string = string> = Ok<T> | Err<E>;

// Result constructor functions
export function Ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function Err<E extends string>(code: E, message?: string): Err<E> {
  return { ok: false, error: { code, message: message ?? code } };
}

// Branded/opaque ids
export type AssetId = string & { readonly brand: unique symbol };
export type PlaybackId = MuxPlaybackID;

// AssetId constructor function
export function assetId(id: string): AssetId {
  return id as AssetId;
}

// Narrow MuxAsset shape we rely on (helps avoid any from SDK internals)
export type AppAsset = {
  id: AssetId;
  status: MuxAsset['status'];
  duration?: MuxAsset['duration'];
  passthrough?: MuxAsset['passthrough'];
  aspect_ratio?: MuxAsset['aspect_ratio'];
  created_at: MuxAsset['created_at'];
  playback_ids?: MuxAsset['playback_ids'];
};

// Extended asset type with metadata
export type AppAssetWithMetadata = AppAsset & {
  metadata?: {
    title: string | null;
    description: string | null;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  } | null;
};

// Mux API Response Wrappers
export type MuxApiResponse<T> = {
  data: T;
};

export type MuxApiListResponse<T> = {
  data: T[];
};

// Track type used in UI
export type Track = {
  id: string;
  type: 'video' | 'audio' | 'text';
  duration?: number;
  max_width?: number;
  max_height?: number;
  max_frame_rate?: number;
};

// Legacy alias for backward compatibility
export type DirectUpload = MuxUpload;

// Upload Result types for API responses
export type UploadResult = {
  url: string;
  success: boolean;
  asset?: AppAsset | undefined;
  error?: string | undefined;
};

// Analytics types with strict discriminated unions
export type VideoView = {
  view_id: string;
  viewer_time: number;
  video_title?: string;
  asset_id?: string;
  live_stream_id?: string;
  country_code?: string;
  region?: string;
  viewer_device_name?: string;
  viewer_os_family?: string;
  player_name?: string;
  player_version?: string;
  video_quality?: string;
  used_fullscreen?: boolean;
  page_load_time?: number;
  player_startup_time?: number;
  video_startup_time?: number;
  seek_count?: number;
  rebuffer_count?: number;
  rebuffer_duration?: number;
  rebuffer_frequency?: number;
  rebuffer_percentage?: number;
  upscaling_percentage?: number;
  downscaling_percentage?: number;
  max_downscale_percentage?: number;
  max_upscale_percentage?: number;
  startup_time_score?: number;
  view_session_id?: string;
  watch_time?: number;
  view_start?: string;
  view_end?: string;
};

export type MetricValue = {
  value: number;
  date?: string;
  hour?: string;
};

export type Metric = {
  name: string;
  data: MetricValue[];
  total_row_count?: number;
  timeframe?: string[];
};

// Mux Data API response types with proper discriminated unions
export type MuxDataResponse<T = unknown> = {
  data: T[];
  total_row_count?: number;
  timeframe?: string[];
};

// Specific analytics row types
export type MuxViewRow = {
  value: number;
};

export type MuxCountryRow = MuxViewRow & {
  country: string;
};

export type MuxDeviceRow = MuxViewRow & {
  device_category: string;
};

export type MuxAssetRow = MuxViewRow & {
  asset_id: string;
};

// Analytics aggregation results
export type CountryViews = {
  country: string;
  views: number;
};

export type DeviceViews = {
  device: string;
  views: number;
};

export type AssetViews = {
  assetId: string;
  views: number;
};

// Webhook types
export type WebhookEvent = {
  type: string;
  object: {
    type: string;
    id: string;
  };
  id: string;
  created_at: string;
  data: Record<string, unknown>;
  accessor?: string;
  accessor_source?: string;
  request_id?: string;
};

// Asset status helpers (discriminated union)
export const ASSET_STATUS = {
  PREPARING: 'preparing' as const,
  READY: 'ready' as const,
  ERRORED: 'errored' as const,
} as const;
export type AssetStatus = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];

export function isAssetReady(asset: {
  status: AssetStatus;
}): asset is { status: 'ready' } {
  return asset.status === ASSET_STATUS.READY;
}

export function isAssetErrored(asset: {
  status: AssetStatus;
}): asset is { status: 'errored' } {
  return asset.status === ASSET_STATUS.ERRORED;
}

export function isAssetPreparing(asset: {
  status: AssetStatus;
}): asset is { status: 'preparing' } {
  return asset.status === ASSET_STATUS.PREPARING;
}

// Upload status helpers
export const UPLOAD_STATUS = {
  WAITING: 'waiting' as const,
  ASSET_CREATED: 'asset_created' as const,
  ERRORED: 'errored' as const,
  CANCELLED: 'cancelled' as const,
  TIMED_OUT: 'timed_out' as const,
} as const;

export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS];

export function isUploadComplete(upload: { status: UploadStatus }): boolean {
  return upload.status === UPLOAD_STATUS.ASSET_CREATED;
}

export function isUploadErrored(upload: { status: UploadStatus }): boolean {
  return upload.status === UPLOAD_STATUS.ERRORED;
}

export function isUploadWaiting(upload: { status: UploadStatus }): boolean {
  return upload.status === UPLOAD_STATUS.WAITING;
}
