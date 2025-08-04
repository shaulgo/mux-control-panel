import Mux from '@mux/mux-node';
import PQueue from 'p-queue';

// Re-export Mux types for use in our application
export type MuxAsset = Mux.Video.Asset;
export type MuxUpload = Mux.Video.Upload;
export type MuxPlaybackID = Mux.Video.PlaybackIDs;

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  throw new Error('MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set');
}

// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

// Rate limiting queue (20 requests per second)
const queue = new PQueue({
  interval: 1000,
  intervalCap: 20,
});

// Wrapper function to add rate limiting to Mux API calls
async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  return queue.add(fn) as Promise<T>;
}

export const muxVideo = {
  // Assets
  async createAsset(input: {
    input: string;
    playback_policy?: ('public' | 'signed')[];
  }) {
    return withRateLimit(() =>
      mux.video.assets.create({
        inputs: [{ url: input.input }],
        playback_policies: input.playback_policy ?? ['public'],
        mp4_support: 'standard',
      })
    );
  },

  async getAsset(assetId: string) {
    return withRateLimit(() => mux.video.assets.retrieve(assetId));
  },

  async listAssets(params?: {
    limit?: number;
    page?: number;
    live_stream_id?: string;
  }) {
    return withRateLimit(() => mux.video.assets.list(params));
  },

  async deleteAsset(assetId: string) {
    return withRateLimit(() => mux.video.assets.delete(assetId));
  },

  async updateAsset(
    assetId: string,
    updates: { passthrough?: string; mp4_support?: string }
  ) {
    return withRateLimit(() => mux.video.assets.update(assetId, updates));
  },

  // Playback IDs
  async createPlaybackId(
    assetId: string,
    policy: 'public' | 'signed' = 'public'
  ) {
    return withRateLimit(() =>
      mux.video.assets.createPlaybackId(assetId, { policy })
    );
  },

  async deletePlaybackId(assetId: string, playbackId: string) {
    return withRateLimit(() =>
      mux.video.assets.deletePlaybackId(assetId, playbackId)
    );
  },

  // Direct uploads
  async createDirectUpload(params: Mux.Video.UploadCreateParams) {
    return withRateLimit(() => mux.video.uploads.create(params));
  },

  async getDirectUpload(uploadId: string) {
    return withRateLimit(() => mux.video.uploads.retrieve(uploadId));
  },

  async cancelDirectUpload(uploadId: string) {
    return withRateLimit(() => mux.video.uploads.cancel(uploadId));
  },

  async listDirectUploads(params?: { limit?: number; page?: number }) {
    return withRateLimit(() => mux.video.uploads.list(params));
  },
};

export const muxData = {
  // Video views
  async getVideoViews(params: {
    timeframe?: string[];
    filters?: string[];
    measurement?: 'count' | 'sum' | 'avg' | 'median' | 'p95' | 'p99';
    order_direction?: 'asc' | 'desc';
    group_by?: 'country' | 'device_category' | 'asset_id' | string;
  }) {
    return withRateLimit(() => mux.data.videoViews.list(params));
  },

  // Metrics
  async getMetrics(
    metricId:
      | 'video_startup_time'
      | 'player_startup_time'
      | 'rebuffer_count'
      | 'rebuffer_duration'
      | 'watch_time'
      | string,
    params?: Record<string, unknown>
  ) {
    // Narrow unsafe casts and isolate at boundary
    return withRateLimit(() =>
      mux.data.metrics.getOverallValues(
        metricId as unknown as Parameters<
          typeof mux.data.metrics.getOverallValues
        >[0],
        params as unknown as Parameters<
          typeof mux.data.metrics.getOverallValues
        >[1]
      )
    );
  },

  // Real-time metrics
  async getRealTimeMetrics() {
    return withRateLimit(() => mux.data.realTime.listMetrics());
  },
};

// Webhook verification
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  try {
    mux.webhooks.verifySignature(
      rawBody,
      { 'mux-signature': signature },
      secret
    );
    return true;
  } catch (error) {
    // Avoid console noise in production while keeping observability
    if (process.env.NODE_ENV !== 'test') {
      console.error('Webhook verification failed:', error);
    }
    return false;
  }
}

// Helper functions
export function getPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function getThumbnailUrl(
  playbackId: string,
  options?: {
    width?: number;
    height?: number;
    fit_mode?: 'preserve' | 'crop' | 'pad';
    time?: number;
  }
): string {
  const params = new URLSearchParams();

  if (options?.width !== undefined) params.set('width', String(options.width));
  if (options?.height !== undefined)
    params.set('height', String(options.height));
  if (options?.fit_mode !== undefined) params.set('fit_mode', options.fit_mode);
  if (options?.time !== undefined) params.set('time', String(options.time));

  const queryString = params.toString();
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${queryString ? `?${queryString}` : ''}`;
}

export { mux };
