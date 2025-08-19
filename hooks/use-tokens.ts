import {
  buildSearchParams,
  clientResultToError,
  safeFetch,
} from '@/lib/api/client';
import { tokensResponseSchema } from '@/lib/validations/tokens';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';

type TokensData = Extract<
  z.infer<typeof tokensResponseSchema>,
  { ok: true }
>['data'];

type UseTokensParams = {
  search?: string;
};

export function useTokens(
  params: UseTokensParams = {}
): UseQueryResult<TokensData, Error> {
  const { search = '' } = params;

  return useQuery<TokensData, Error, TokensData, readonly [string, string]>({
    queryKey: ['tokens', search] as const,
    queryFn: async (): Promise<TokensData> => {
      const searchParams = buildSearchParams({ ...(search && { search }) });
      const result = await safeFetch(`/api/tokens?${searchParams}`, {
        method: 'GET',
        responseSchema: tokensResponseSchema,
      });

      if (!result.ok) {
        throw clientResultToError(result);
      }

      return result.data;
    },
    staleTime: 30_000,
  });
}

export type { TokensData };
