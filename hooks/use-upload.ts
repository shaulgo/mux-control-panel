import type { UploadResult } from '@/lib/mux/types';
import type { UploadUrlsInput } from '@/lib/validations/upload';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadResponse {
  results: UploadResult[];
}

export function useUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadUrlsInput): Promise<UploadResponse> => {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate assets list to show new uploads
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
