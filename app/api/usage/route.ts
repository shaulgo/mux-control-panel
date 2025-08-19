import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { muxData, muxVideo } from '@/lib/mux/client';
import { Err, Ok, type Result } from '@/lib/mux/types';
import { usageQuerySchema } from '@/lib/validations/upload';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

// Pricing constants (adjust these based on your actual Mux pricing)
const PRICING = {
  ENCODING_PER_MINUTE: 0.2, // $0.20 per minute
  STREAMING_PER_GB: 0.02, // $0.02 per GB
  STORAGE_PER_GB_MONTH: 0.01, // $0.01 per GB per month
};

// Usage limits (adjust these based on your plan)
const LIMITS = {
  ENCODING_MINUTES: 1000, // 1000 minutes per month
  STREAMING_GB: 50000, // 50TB per month
  STORAGE_GB: 10000, // 10TB storage
};

type UsageData = {
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
};

type GetUsageResult = Result<
  UsageData,
  | 'AUTH_REQUIRED'
  | 'INVALID_QUERY'
  | 'MUX_LIST_ASSETS_FAILED'
  | 'MUX_METRICS_FAILED'
>;

async function getUsage(request: NextRequest): Promise<GetUsageResult> {
  // Check auth
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  // Parse and validate query params
  const url = new URL(request.url);
  const queryResult = usageQuerySchema.safeParse({
    period: url.searchParams.get('period'),
  });

  if (!queryResult.success) {
    return Err('INVALID_QUERY');
  }

  const { period } = queryResult.data;

  // Build timeframe and period
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - period);
  const timeframe = [`${period}:days`];

  // 1) Encoding minutes: approximate by summing durations of assets created this month
  type MuxAsset = { created_at?: string; duration?: number; status?: string };
  let assets: MuxAsset[] = [];
  try {
    const assetsResponse = await muxVideo.listAssets({ limit: 1000 });
    assets = Array.isArray(assetsResponse.data) ? assetsResponse.data : [];
  } catch (e) {
    console.warn('Mux listAssets failed:', e);
    return Err('MUX_LIST_ASSETS_FAILED');
  }

  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);
  const encodingMinutes = assets
    .filter(a => {
      const ts = a.created_at;
      if (typeof ts !== 'string') return false;
      const createdAt = new Date(ts);
      return (
        !Number.isNaN(createdAt.getTime()) && createdAt >= currentMonthStart
      );
    })
    .reduce((sum, a) => {
      const seconds = typeof a.duration === 'number' ? a.duration : 0;
      return a.status === 'ready' && seconds > 0
        ? sum + Math.ceil(seconds / 60)
        : sum;
    }, 0);

  // 2) Watch time (minutes): use a Mux Data metric as overall playback time (seconds) and map to minutes
  let watchMinutes = 0;
  const dailyWatchTime: { date: string; value: number }[] = [];
  try {
    const overall = (await muxData.getMetrics('playback_time', {
      timeframe,
    })) as unknown as { data: Array<{ value?: number }> | undefined };

    const dataArr = overall.data;
    const first = dataArr && dataArr.length > 0 ? dataArr[0] : undefined;
    const v =
      first && typeof first.value !== 'undefined' ? first.value : undefined;
    const totalSeconds = Number.isFinite(Number(v)) ? Number(v) : 0;
    watchMinutes = Math.max(0, Math.round(totalSeconds / 60));

    // Build a simple daily series by spreading evenly across period
    const days = Math.max(1, period);
    const perDayMinutes = watchMinutes / days;
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const iso = d.toISOString();
      const dateStr = (iso.includes('T') ? iso.split('T')[0] : iso) as string;
      dailyWatchTime.push({
        date: dateStr,
        value: Number.isFinite(perDayMinutes)
          ? Number(perDayMinutes.toFixed(2))
          : 0,
      });
    }
  } catch (e) {
    console.warn('Mux metrics playback_time failed:', e);
    // Keep zeros if metric unavailable
    const days = Math.max(1, period);
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const iso = d.toISOString();
      const dateStr = (iso.includes('T') ? iso.split('T')[0] : iso) as string;
      dailyWatchTime.push({
        date: dateStr,
        value: 0,
      });
    }
  }

  // 3) Storage GB: not available via live API -> set to 0 (authoritative data should come from Mux Exports)
  const storageGB = 0;

  // Pricing
  const encodingCost = encodingMinutes * PRICING.ENCODING_PER_MINUTE;
  const streamingCost = 0;
  const storageCost = 0;

  // recentUsage: last up-to-7 days from the period
  const recentDays: {
    date: string;
    encoding: number;
    streaming: number;
    storage: number;
    cost: number;
  }[] = [];
  const recentSlice = dailyWatchTime.slice(-7);
  for (const day of recentSlice) {
    const dayEncoding = Math.round(
      encodingMinutes / Math.max(7, recentSlice.length)
    );
    const dayStreaming = Math.round(Number.isFinite(day.value) ? day.value : 0);
    const dayStorage = Math.round(storageGB / Math.max(7, recentSlice.length));
    const dayCost = dayEncoding * PRICING.ENCODING_PER_MINUTE + 0 + 0;
    recentDays.push({
      date: day.date,
      encoding: dayEncoding,
      streaming: dayStreaming,
      storage: dayStorage,
      cost: Number(dayCost.toFixed(2)),
    });
  }

  // Growth: not calculated without authoritative cost history
  const growthPercentage = 0;

  const usageData: UsageData = {
    currentMonth: {
      encoding: {
        used: encodingMinutes,
        limit: LIMITS.ENCODING_MINUTES,
        cost: Number(encodingCost.toFixed(2)),
      },
      streaming: {
        // NOTE: we treat "streaming" as watch time (minutes) from Mux Data
        used: watchMinutes,
        limit: LIMITS.STREAMING_GB,
        cost: Number(streamingCost.toFixed(2)),
      },
      storage: {
        used: storageGB,
        limit: LIMITS.STORAGE_GB,
        cost: Number(storageCost.toFixed(2)),
      },
    },
    recentUsage: recentDays,
    growth: {
      percentage: growthPercentage,
      isPositive: true,
    },
    totalCost: Number((encodingCost + streamingCost + storageCost).toFixed(2)),
  };

  return Ok(usageData);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await getUsage(request);
  return resultToHttp(
    result,
    {
      AUTH_REQUIRED: 401,
      INVALID_QUERY: 400,
      MUX_LIST_ASSETS_FAILED: 500,
      MUX_METRICS_FAILED: 500,
    },
    {
      'Cache-Control': 'private, max-age=30',
    }
  );
}
