import type { AssetId } from '@/lib/mux/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type AssetMetadata = {
  assetId: string;
  title: string | null;
  description: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateAssetMetadataInput = {
  title?: string;
  description?: string;
  tags?: string[];
};

export function useAssetMetadata(assetId: AssetId) {
  return useQuery({
    queryKey: ['asset', assetId, 'metadata'],
    queryFn: async (): Promise<AssetMetadata | null> => {
      const response = await fetch(`/api/assets/${assetId}/metadata`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!assetId,
  });
}

export function useUpdateAssetMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assetId,
      metadata,
    }: {
      assetId: AssetId;
      metadata: UpdateAssetMetadataInput;
    }): Promise<AssetMetadata> => {
      const response = await fetch(`/api/assets/${assetId}/metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Failed to update metadata: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: data => {
      // Invalidate and refetch the metadata
      queryClient.invalidateQueries({
        queryKey: ['asset', data.assetId, 'metadata'],
      });
      // Also invalidate the assets list to reflect any title changes
      queryClient.invalidateQueries({
        queryKey: ['assets'],
      });
    },
  });
}
