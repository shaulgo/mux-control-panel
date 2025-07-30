// Mux Asset types
export interface MuxAsset {
  id: string;
  status: 'preparing' | 'ready' | 'errored';
  duration?: number;
  aspect_ratio?: string;
  created_at: string;
  playback_ids?: PlaybackId[];
  mp4_support?: 'none' | 'standard' | 'high';
  master_access?: 'none' | 'temporary';
  tracks?: Track[];
  errors?: {
    type: string;
    messages: string[];
  };
  passthrough?: string;
}

export interface PlaybackId {
  id: string;
  policy: 'public' | 'signed';
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'text';
  duration?: number;
  max_width?: number;
  max_height?: number;
  max_frame_rate?: number;
}

// Direct Upload types
export interface DirectUpload {
  id: string;
  url: string;
  status: 'waiting' | 'asset_created' | 'errored' | 'cancelled' | 'timed_out';
  new_asset_settings: {
    playback_policy?: string[];
    mp4_support?: string;
  };
  asset_id?: string;
  error?: {
    type: string;
    message: string;
  };
  cors_origin?: string;
  created_at: string;
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
  data: any;
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

export type AssetStatus = typeof ASSET_STATUS[keyof typeof ASSET_STATUS];

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

export type UploadStatus = typeof UPLOAD_STATUS[keyof typeof UPLOAD_STATUS];

export function isUploadComplete(upload: DirectUpload): boolean {
  return upload.status === UPLOAD_STATUS.ASSET_CREATED;
}

export function isUploadErrored(upload: DirectUpload): boolean {
  return upload.status === UPLOAD_STATUS.ERRORED;
}

export function isUploadWaiting(upload: DirectUpload): boolean {
  return upload.status === UPLOAD_STATUS.WAITING;
}
