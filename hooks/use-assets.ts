import type { MuxAsset } from '@/lib/mux/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface AssetsResponse {
  data: MuxAsset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface UseAssetsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useAssets(params: UseAssetsParams = {}) {
  const { page = 1, limit = 25, search = '' } = params;

  return useQuery({
    queryKey: ['assets', { page, limit, search }],
    queryFn: async (): Promise<AssetsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/assets?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: async (): Promise<{ data: MuxAsset }> => {
      const response = await fetch(`/api/assets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch asset');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch assets list
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useAssetPolling(assetId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['asset', assetId, 'polling'],
    queryFn: async (): Promise<{ data: MuxAsset }> => {
      const response = await fetch(`/api/assets/${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch asset');
      }
      return response.json();
    },
    enabled: enabled && !!assetId,
    refetchInterval: queryData => {
      // Stop polling if asset is ready or errored
      const asset = (queryData as { data: MuxAsset } | undefined)?.data;
      if (asset?.status === 'ready' || asset?.status === 'errored') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    staleTime: 0, // Always consider stale for polling
  });
}
