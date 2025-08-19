import { z } from 'zod';

// Local ApiResult wrapper schema (duplicate to avoid cross-file coupling)
const apiOkSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ ok: z.literal(true), data: dataSchema });

const apiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }),
});

const apiResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([apiOkSchema(dataSchema), apiErrorSchema]);

export const librarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  assetCount: z.number(),
});

export const librariesResponseSchema = apiResultSchema(z.array(librarySchema));

export type LibrariesResponse = z.infer<typeof librariesResponseSchema>;
