// Import actual Mux SDK types
import type { MuxAsset, MuxPlaybackID, MuxUpload } from './client';

// Re-export for convenience
export type { MuxAsset, MuxPlaybackID, MuxUpload };

// Mux API Response Wrappers
export interface MuxApiResponse<T> {
  data: T;
}

export interface MuxApiListResponse<T> {
  data: T[];
}

// Legacy type aliases for backward compatibility
export type PlaybackId = MuxPlaybackID;
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
export interface UploadResult {
  url: string;
  success: boolean;
  asset?: MuxAsset | undefined;
  error?: string | undefined;
}

// Analytics types
export interface VideoView {
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
}

export interface MetricValue {
  value: number;
  date?: string;
  hour?: string;
}

export interface Metric {
  name: string;
  data: MetricValue[];
  total_row_count?: number;
  timeframe?: string[];
}

// Webhook types
export interface WebhookEvent {
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
}

// Asset status helpers
export const ASSET_STATUS = {
  PREPARING: 'preparing' as const,
  READY: 'ready' as const,
  ERRORED: 'errored' as const,
} as const;

// Specific API Response Types
export type AssetResponse = MuxApiResponse<MuxAsset>;
export type AssetListResponse = MuxApiListResponse<MuxAsset>;
export type UploadResponse = MuxApiResponse<MuxUpload>;
export type UploadListResponse = MuxApiListResponse<MuxUpload>;

// Upload creation parameters
export interface UploadCreateParams {
  cors_origin?: string;
  new_asset_settings?: {
    playback_policies?: ('public' | 'signed')[];
    mp4_support?: string;
  };
}

// Asset creation parameters
export interface AssetCreateParams {
  inputs: Array<{ url: string }>;
  playback_policies?: ('public' | 'signed')[];
  mp4_support?: string;
  passthrough?: string;
}

export type AssetStatus = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];

export function isAssetReady(asset: MuxAsset): boolean {
  return asset.status === ASSET_STATUS.READY;
}

export function isAssetErrored(asset: MuxAsset): boolean {
  return asset.status === ASSET_STATUS.ERRORED;
}

export function isAssetPreparing(asset: MuxAsset): boolean {
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

export function isUploadComplete(upload: DirectUpload): boolean {
  return upload.status === UPLOAD_STATUS.ASSET_CREATED;
}

export function isUploadErrored(upload: DirectUpload): boolean {
  return upload.status === UPLOAD_STATUS.ERRORED;
}

export function isUploadWaiting(upload: DirectUpload): boolean {
  return upload.status === UPLOAD_STATUS.WAITING;
}
