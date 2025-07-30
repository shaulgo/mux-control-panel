import { z } from 'zod';

export const uploadUrlsSchema = z.object({
  urls: z
    .string()
    .min(1, 'At least one URL is required')
    .transform((val) => val.split('\n').filter(Boolean))
    .pipe(
      z
        .array(z.string().url('Invalid URL format'))
        .min(1, 'At least one valid URL is required')
        .max(10, 'Maximum 10 URLs allowed')
    ),
});

export type UploadUrlsInput = z.input<typeof uploadUrlsSchema>;
export type UploadUrlsOutput = z.output<typeof uploadUrlsSchema>;

export const createAssetSchema = z.object({
  input: z.string().url('Invalid URL'),
  playback_policy: z.array(z.enum(['public', 'signed'])).optional(),
  mp4_support: z.enum(['none', 'standard', 'high']).optional(),
  passthrough: z.string().optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
