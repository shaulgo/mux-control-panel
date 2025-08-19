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

export const tokenSchema = z.object({
  id: z.string(),
  token: z.string(),
  url: z.string().url(),
  expiresAt: z.string(),
  used: z.boolean(),
  usedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const tokensResponseSchema = apiResultSchema(z.array(tokenSchema));

export type TokensResponse = z.infer<typeof tokensResponseSchema>;
