import type { AssetId } from '@/lib/mux/types';
import { z } from 'zod';

export const uploadUrlsSchema = z.object({
  urls: z
    .string()
    .min(1, 'At least one URL is required')
    .transform(val =>
      val
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
    )
    .pipe(
      z
        .array(z.string().url('Invalid URL format'))
        .min(1, 'At least one valid URL is required')
        .max(10, 'Maximum 10 URLs allowed')
    ),
});

export type UploadUrlsInput = z.input<typeof uploadUrlsSchema>;
export type UploadUrlsOutput = z.output<typeof uploadUrlsSchema>;

export const playbackPolicyEnum = z.enum(['public', 'signed']);
export const mp4SupportEnum = z.enum(['none', 'standard', 'high']);

export const createAssetSchema = z.object({
  input: z.string().url('Invalid URL'),
  playback_policy: z.array(playbackPolicyEnum).optional(),
  mp4_support: mp4SupportEnum.optional(),
  passthrough: z.string().min(1).optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

// Schema for direct upload token creation
export const directUploadSchema = z.object({
  cors_origin: z.string().url('Must be a valid URL').optional(),
  new_asset_settings: z
    .object({
      playback_policy: z.array(playbackPolicyEnum).default(['public']),
      encoding_tier: z.enum(['baseline', 'smart']).default('smart'),
      max_resolution_tier: z.enum(['1080p', '1440p', '2160p']).optional(),
      normalize_audio: z.boolean().default(true),
      passthrough: z.string().optional(),
    })
    .optional(),
});

export type DirectUploadInput = z.infer<typeof directUploadSchema>;

// Schema for asset listing query params
export const assetQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().optional(),
});

export type AssetQueryInput = z.infer<typeof assetQuerySchema>;

// Schema for asset ID param
export const assetIdParamSchema = z.object({
  id: z.string().min(1, 'Asset ID is required'),
});

export type AssetIdParam = z.infer<typeof assetIdParamSchema>;

// Schema for usage query params
export const usageQuerySchema = z.object({
  period: z.coerce.number().int().min(1).max(365).default(30),
});

export type UsageQueryInput = z.infer<typeof usageQuerySchema>;

// Schema for analytics query params
export const analyticsQuerySchema = z.object({
  period: z.coerce.number().int().min(1).max(365).default(30),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;

// Asset schema for response validation - matches AppAsset type
const muxAssetSchema = z.object({
  id: z.string().transform(id => id as AssetId),
  status: z.enum(['preparing', 'ready', 'errored']),
  duration: z.number().optional(),
  passthrough: z.string().optional(),
  aspect_ratio: z.string().optional(),
  created_at: z.string(),
  playback_ids: z
    .array(
      z.object({
        id: z.string(),
        policy: z.enum(['public', 'signed']),
      })
    )
    .optional(),
});

// API Response wrapper schemas
const apiOkSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
): z.ZodObject<{
  ok: z.ZodLiteral<true>;
  data: T;
}> =>
  z.object({
    ok: z.literal(true),
    data: dataSchema,
  });

const apiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const apiResultSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
): z.ZodUnion<
  [
    z.ZodObject<{
      ok: z.ZodLiteral<true>;
      data: T;
    }>,
    typeof apiErrorSchema,
  ]
> => z.union([apiOkSchema(dataSchema), apiErrorSchema]);

// Response schemas for type safety
export const assetListResponseSchema = apiResultSchema(
  z.object({
    data: z.array(muxAssetSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      hasMore: z.boolean(),
    }),
  })
);

export const singleAssetResponseSchema = apiResultSchema(
  z.object({
    data: muxAssetSchema,
  })
);

export const deleteAssetResponseSchema = apiResultSchema(
  z.object({
    success: z.boolean(),
  })
);

export const uploadResponseSchema = apiResultSchema(
  z.object({
    results: z.array(
      z.object({
        url: z.string(),
        success: z.boolean(),
        asset: muxAssetSchema.optional(),
        error: z.string().optional(),
      })
    ),
  })
);

export const usageResponseSchema = apiResultSchema(
  z.object({
    currentMonth: z.object({
      encoding: z.object({
        used: z.number(),
        limit: z.number(),
        cost: z.number(),
      }),
      streaming: z.object({
        used: z.number(),
        limit: z.number(),
        cost: z.number(),
      }),
      storage: z.object({
        used: z.number(),
        limit: z.number(),
        cost: z.number(),
      }),
    }),
    recentUsage: z.array(
      z.object({
        date: z.string(),
        encoding: z.number(),
        streaming: z.number(),
        storage: z.number(),
        cost: z.number(),
      })
    ),
    growth: z.object({
      percentage: z.number(),
      isPositive: z.boolean(),
    }),
    totalCost: z.number(),
  })
);

export const analyticsResponseSchema = apiResultSchema(
  z.object({
    overview: z.object({
      totalViews: z.number(),
    }),
    topVideos: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        views: z.number(),
      })
    ),
    deviceBreakdown: z.array(
      z.object({
        device: z.string(),
        views: z.number(),
      })
    ),
    geographicData: z.array(
      z.object({
        country: z.string(),
        views: z.number(),
      })
    ),
  })
);

// Type exports for the response schemas
export type AssetListResponse = z.infer<typeof assetListResponseSchema>;
export type SingleAssetResponse = z.infer<typeof singleAssetResponseSchema>;
export type DeleteAssetResponse = z.infer<typeof deleteAssetResponseSchema>;
export type UploadResponse = z.infer<typeof uploadResponseSchema>;
export type UsageResponse = z.infer<typeof usageResponseSchema>;
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
