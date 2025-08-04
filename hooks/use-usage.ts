import {
  buildSearchParams,
  clientResultToError,
  safeFetch,
} from '@/lib/api/client';
import { usageResponseSchema } from '@/lib/validations/upload';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';

type UsageData = Extract<
  z.infer<typeof usageResponseSchema>,
  { ok: true }
>['data'];

type UseUsageParams = {
  period?: number; // days
};

export function useUsage(
  params: UseUsageParams = {}
): UseQueryResult<UsageData, Error> {
  const { period = 30 } = params;

  return useQuery<UsageData, Error, UsageData, readonly [string, number]>({
    queryKey: ['usage', period] as const,
    queryFn: async (): Promise<UsageData> => {
      const searchParams = buildSearchParams({ period });
      const result = await safeFetch(`/api/usage?${searchParams}`, {
        method: 'GET',
        responseSchema: usageResponseSchema,
      });

      if (!result.ok) {
        throw clientResultToError(result);
      }

      return result.data;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: failureCount => failureCount < 2,
  });
}

// Re-export the type for convenience
export type { UsageData };
