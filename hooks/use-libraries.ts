import {
  buildSearchParams,
  clientResultToError,
  safeFetch,
} from '@/lib/api/client';
import { librariesResponseSchema } from '@/lib/validations/libraries';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';

type LibrariesData = Extract<
  z.infer<typeof librariesResponseSchema>,
  { ok: true }
>['data'];

type UseLibrariesParams = {
  search?: string;
};

export function useLibraries(
  params: UseLibrariesParams = {}
): UseQueryResult<LibrariesData, Error> {
  const { search = '' } = params;

  return useQuery<
    LibrariesData,
    Error,
    LibrariesData,
    readonly [string, string]
  >({
    queryKey: ['libraries', search] as const,
    queryFn: async (): Promise<LibrariesData> => {
      const searchParams = buildSearchParams({ ...(search && { search }) });
      const result = await safeFetch(`/api/libraries?${searchParams}`, {
        method: 'GET',
        responseSchema: librariesResponseSchema,
      });

      if (!result.ok) {
        throw clientResultToError(result);
      }

      return result.data;
    },
    staleTime: 30_000,
  });
}

export type { LibrariesData };
