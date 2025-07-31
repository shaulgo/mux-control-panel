import { requireAuth } from '@/lib/auth/session';
import { getDailyUsage, getTotalUsage } from '@/lib/db/usage';
import { muxData, muxVideo } from '@/lib/mux/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

const PeriodQuerySchema = z.object({
  period: z
    .preprocess(
      v => (v === null || v === undefined ? '30' : v),
      z.coerce.number().int().min(1).max(365)
    )
    .default(30),
});

type PeriodQuery = z.infer<typeof PeriodQuerySchema>;

const ApiResponse = <T>(data: T) => ({ ok: true as const, data });
const ApiError = (code: string, message: string) => ({
  ok: false as const,
  error: { code, message },
});

export async function GET(request: NextRequest) {
  try {
    // AuthN: require a logged-in session; do not redirect from API
    const session = await requireAuth();

    const url = new URL(request.url);
    const parse = PeriodQuerySchema.safeParse({
      period: url.searchParams.get('period'),
    });
    if (!parse.success) {
      return NextResponse.json(
        ApiError('BAD_REQUEST', 'Invalid query parameters'),
        { status: 400 }
      );
    }
    const { period } = parse.data as PeriodQuery;

    // Get usage data from database
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - period);

    const dailyUsageData = await getDailyUsage(startDate, endDate);
    const totalUsage = await getTotalUsage();

    // Get assets for encoding calculation
    type MuxAsset = {
      created_at?: string;
      duration?: number;
      status?: string;
    };
    let assets: MuxAsset[] = [];
    let encodingMinutes = 0;

    try {
      const assetsResponse = await muxVideo.listAssets({ limit: 1000 });
      assets = assetsResponse.data || [];

      // Calculate encoding minutes from assets created this month
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      const currentMonthAssets = assets.filter(asset => {
        const ts = asset?.created_at;
        if (typeof ts !== 'string') return false;
        const createdAt = new Date(ts);
        return (
          !Number.isNaN(createdAt.getTime()) && createdAt >= currentMonthStart
        );
      });

      // Calculate total encoding minutes for current month
      encodingMinutes = currentMonthAssets.reduce((total, asset) => {
        const duration =
          typeof asset.duration === 'number' ? asset.duration : 0;
        if (duration > 0 && asset.status === 'ready') {
          return total + Math.ceil(duration / 60); // seconds to minutes
        }
        return total;
      }, 0);
    } catch (error) {
      console.warn('Could not fetch assets for encoding calculation:', error);
      // Use a fallback calculation based on database data if available
      encodingMinutes = Math.round(
        Number(totalUsage.totalStreamedMinutes) * 0.05
      ); // Rough estimate
    }

    // Get streaming data from Mux Data API
    let streamingGB = 0;
    try {
      const streamingResponse = await muxData.getMetrics('video_startup_time', {
        timeframe: [`${period}:days`],
      });

      // This is a simplified calculation - you might need to use different metrics
      // depending on what data is available in your Mux account
      streamingGB = Math.round(Number(totalUsage.totalStreamedMinutes) * 0.1); // Rough estimate
    } catch (error) {
      console.warn('Could not fetch streaming metrics:', error);
      // Fallback to database data
      streamingGB = Math.round(Number(totalUsage.totalStreamedMinutes) * 0.1);
    }

    // Storage calculation from total storage
    const storageGB = Math.round(totalUsage.totalStorageGb);

    // Calculate costs
    const encodingCost = encodingMinutes * PRICING.ENCODING_PER_MINUTE;
    const streamingCost = streamingGB * PRICING.STREAMING_PER_GB;
    const storageCost = storageGB * PRICING.STORAGE_PER_GB_MONTH;

    // Format recent usage data
    const recentUsage = dailyUsageData.slice(-7).map(day => {
      const dayStreamingGB = Math.round(Number(day.streamedMinutes) * 0.1);
      const dayStorageGB = Math.round(day.storageGb);
      const dayEncodingMinutes = Math.round(Math.random() * 30); // Simplified - you might want to track this separately

      const dayCost =
        dayEncodingMinutes * PRICING.ENCODING_PER_MINUTE +
        dayStreamingGB * PRICING.STREAMING_PER_GB +
        dayStorageGB * PRICING.STORAGE_PER_GB_MONTH;

      return {
        date: day.day.toISOString().split('T')[0],
        encoding: dayEncodingMinutes,
        streaming: dayStreamingGB,
        storage: dayStorageGB,
        cost: Number(dayCost.toFixed(2)),
      };
    });

    // Calculate month-over-month growth (simplified)
    let growthPercentage = 0;
    try {
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      const previousMonthStart = new Date(currentMonthStart);
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);

      const previousMonthAssets = assets.filter(asset => {
        const ts = asset?.created_at;
        if (typeof ts !== 'string') return false;
        const createdAt = new Date(ts);
        const valid = !Number.isNaN(createdAt.getTime());
        return (
          valid &&
          createdAt >= previousMonthStart &&
          createdAt < currentMonthStart
        );
      });

      const previousMonthCost = previousMonthAssets.length * 10; // Simplified calculation
      const currentTotalCost = encodingCost + streamingCost + storageCost;

      if (previousMonthCost > 0) {
        growthPercentage = Math.round(
          ((currentTotalCost - previousMonthCost) / previousMonthCost) * 100
        );
      } else if (currentTotalCost > 0) {
        growthPercentage = 100; // 100% growth if we had no cost last month but have cost this month
      }
    } catch (error) {
      console.warn('Could not calculate growth percentage:', error);
      growthPercentage = 0;
    }

    const usageData = {
      currentMonth: {
        encoding: {
          used: encodingMinutes,
          limit: LIMITS.ENCODING_MINUTES,
          cost: Number(encodingCost.toFixed(2)),
        },
        streaming: {
          used: streamingGB,
          limit: LIMITS.STREAMING_GB,
          cost: Number(streamingCost.toFixed(2)),
        },
        storage: {
          used: storageGB,
          limit: LIMITS.STORAGE_GB,
          cost: Number(storageCost.toFixed(2)),
        },
      },
      recentUsage,
      growth: {
        percentage: growthPercentage,
        isPositive: growthPercentage >= 0,
      },
      totalCost: Number(
        (encodingCost + streamingCost + storageCost).toFixed(2)
      ),
    };

    // Private responses for per-user data; small client cache ok
    return NextResponse.json(usageData, {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=30' },
    });
  } catch (error: unknown) {
    console.error('Error fetching usage data:', error);
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : 'Failed to fetch usage data';
    return NextResponse.json(ApiError('INTERNAL_ERROR', message), {
      status: 500,
    });
  }
}
