import { useQuery } from '@tanstack/react-query';

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: { code: string; message: string } };
type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export interface UsageData {
  currentMonth: {
    encoding: {
      used: number;
      limit: number;
      cost: number;
    };
    streaming: {
      used: number;
      limit: number;
      cost: number;
    };
    storage: {
      used: number;
      limit: number;
      cost: number;
    };
  };
  recentUsage: Array<{
    date: string;
    encoding: number;
    streaming: number;
    storage: number;
    cost: number;
  }>;
  growth: {
    percentage: number;
    isPositive: boolean;
  };
  totalCost: number;
}

interface UseUsageParams {
  period?: number; // days
}

export function useUsage(params: UseUsageParams = {}) {
  const { period = 30 } = params;

  return useQuery<UsageData, Error, UsageData, (string | number)[]>({
    queryKey: ['usage', period],
    queryFn: async (): Promise<UsageData> => {
      const searchParams = new URLSearchParams({ period: String(period) });
      const res = await fetch(`/api/usage?${searchParams}`, {
        headers: { Accept: 'application/json' },
      });
      const json = (await res.json()) as ApiResult<UsageData>;

      if (!res.ok) {
        const message =
          (json as ApiFailure)?.error?.message ??
          `HTTP ${res.status}: Failed to fetch usage data`;
        throw new Error(message);
      }
      if (!('ok' in json) || json.ok !== true) {
        const message =
          (json as ApiFailure)?.error?.message ?? 'Unknown server response';
        throw new Error(message);
      }
      return json.data;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: failureCount => failureCount < 2,
  });
}
