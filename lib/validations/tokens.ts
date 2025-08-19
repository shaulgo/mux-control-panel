import { z } from 'zod';

// Local ApiResult wrapper schema (duplicate to avoid cross-file coupling)
type ApiOkSchema<T extends z.ZodTypeAny> = z.ZodObject<{
  ok: z.ZodLiteral<true>;
  data: T;
}>;

type ApiErrorSchema = z.ZodObject<{
  ok: z.ZodLiteral<false>;
  error: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
  }>;
}>;

const apiOkSchema = <T extends z.ZodTypeAny>(dataSchema: T): ApiOkSchema<T> =>
  z.object({ ok: z.literal(true), data: dataSchema });

const apiErrorSchema: ApiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }),
});

type ApiResultSchema<T extends z.ZodTypeAny> = z.ZodUnion<
  [ApiOkSchema<T>, ApiErrorSchema]
>;

const apiResultSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
): ApiResultSchema<T> => z.union([apiOkSchema(dataSchema), apiErrorSchema]);

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
