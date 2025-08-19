import {
  buildSearchParams,
  clientResultToError,
  safeFetch,
} from '@/lib/api/client';
import type { AssetId } from '@/lib/mux/types';
import {
  assetListResponseSchema,
  deleteAssetResponseSchema,
  singleAssetResponseSchema,
} from '@/lib/validations/upload';
import type {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { z } from 'zod';

type AssetListData = Extract<
  z.infer<typeof assetListResponseSchema>,
  { ok: true }
>['data'];
type SingleAssetData = Extract<
  z.infer<typeof singleAssetResponseSchema>,
  { ok: true }
>['data'];
type DeleteAssetData = Extract<
  z.infer<typeof deleteAssetResponseSchema>,
  { ok: true }
>['data'];

type UseAssetsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export function useAssets(
  params: UseAssetsParams = {}
): UseQueryResult<AssetListData, Error> {
  const { page = 1, limit = 25, search = '' } = params;

  return useQuery({
    queryKey: ['assets', { page, limit, search }],
    queryFn: async (): Promise<AssetListData> => {
      const searchParams = buildSearchParams({
        page,
        limit,
        ...(search && { search }),
      });

      const result = await safeFetch(`/api/assets?${searchParams}`, {
        method: 'GET',
        responseSchema: assetListResponseSchema,
      });

      if (!result.ok) {
        throw clientResultToError(result);
      }

      return result.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

type UseInfiniteAssetsParams = {
  limit?: number;
  search?: string;
};

export function useInfiniteAssets(
  params: UseInfiniteAssetsParams = {}
): UseInfiniteQueryResult<InfiniteData<AssetListData>, Error> {
  const { limit = 25, search = '' } = params;

  return useInfiniteQuery({
    queryKey: ['assets', 'infinite', { limit, search }],
    initialPageParam: 1,
    getNextPageParam: (lastPage: AssetListData) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<AssetListData> => {
      const searchParams = buildSearchParams({
        page: pageParam,
        limit,
        ...(search && { search }),
      });

      const result = await safeFetch(`/api/assets?${searchParams}`, {
        method: 'GET',
        responseSchema: assetListResponseSchema,
      });

      if (!result.ok) {
        throw clientResultToError(result);
      }

      return result.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAsset(id: AssetId): UseQueryResult<SingleAssetData, Error> {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: async (): Promise<SingleAssetData> => {
      const result = await safeFetch(`/api/assets/${id}`, {
        method: 'GET',
        responseSchema: singleAssetResponseSchema,
      });

      if (!result.ok) {
        throw clientResultToError(result);
      }

      return result.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useDeleteAsset(): UseMutationResult<
  DeleteAssetData,
  Error,
  AssetId
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: AssetId): Promise<DeleteAssetData> => {
      const result = await safeFetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
        responseSchema: deleteAssetResponseSchema,
      });

      if (!result.ok) {
        throw clientResultToError(result);
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch assets list
      void queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useAssetPolling(
  assetId: AssetId,
  enabled: boolean = true
): UseQueryResult<SingleAssetData, Error> {
  return useQuery({
    queryKey: ['asset', assetId, 'polling'],
    queryFn: async (): Promise<SingleAssetData> => {
      const result = await safeFetch(`/api/assets/${assetId}`, {
        method: 'GET',
        responseSchema: singleAssetResponseSchema,
      });

      if (!result.ok) {
        throw clientResultToError(result);
      }

      return result.data;
    },
    enabled: enabled && !!assetId,
    refetchInterval: query => {
      // Stop polling if asset is ready or errored
      const data = query.state.data;
      const asset = data?.data;
      if (asset?.status === 'ready' || asset?.status === 'errored') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    staleTime: 0, // Always consider stale for polling
  });
}

// Re-export types for convenience
export type { AssetListData, DeleteAssetData, SingleAssetData };
