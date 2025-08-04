import { clientResultToError, safeFetch } from '@/lib/api/client';
import type { UploadUrlsInput } from '@/lib/validations/upload';
import { uploadResponseSchema } from '@/lib/validations/upload';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { z } from 'zod';

type UploadData = Extract<
  z.infer<typeof uploadResponseSchema>,
  { ok: true }
>['data'];

export function useUpload(): UseMutationResult<
  UploadData,
  Error,
  UploadUrlsInput
> {
  const queryClient = useQueryClient();

  return useMutation<UploadData, Error, UploadUrlsInput>({
    mutationFn: async (data: UploadUrlsInput): Promise<UploadData> => {
      const result = await safeFetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify(data),
        responseSchema: uploadResponseSchema,
      });

      if (!result.ok) {
        throw clientResultToError(result);
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate assets list to show new uploads
      void queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
