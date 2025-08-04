import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { Err, Ok, type Result } from '@/lib/mux/types';
import {
  getTopAssetsByViews,
  getTotalViews,
  getViewsByCountry,
  getViewsByDevice,
} from '@/lib/mux/utils';
import { analyticsQuerySchema } from '@/lib/validations/upload';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

type AnalyticsSummary = {
  overview: {
    totalViews: number;
  };
  topVideos: Array<{
    id: string;
    title: string;
    views: number;
  }>;
  deviceBreakdown: Array<{ device: string; views: number }>;
  geographicData: Array<{ country: string; views: number }>;
};

type GetAnalyticsSummaryResult = Result<
  { ok: true; data: AnalyticsSummary },
  'AUTH_REQUIRED' | 'INVALID_QUERY' | 'MUX_ANALYTICS_FAILED'
>;

async function getAnalyticsSummary(
  request: NextRequest
): Promise<GetAnalyticsSummaryResult> {
  // Check auth
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  // Parse and validate query params
  const url = new URL(request.url);
  const queryResult = analyticsQuerySchema.safeParse({
    period: url.searchParams.get('period'),
  });

  if (!queryResult.success) {
    return Err('INVALID_QUERY');
  }

  const { period } = queryResult.data;
  const timeframe = [`${period}:days`];

  // Fetch analytics data
  try {
    const [totalViews, byCountry, byDevice, topAssets] = await Promise.all([
      getTotalViews(timeframe),
      getViewsByCountry(timeframe),
      getViewsByDevice(timeframe),
      getTopAssetsByViews(5, timeframe),
    ]);

    // Note: We do not have asset titles without an extra join. For now, return id only.
    const topVideos = topAssets.map(a => ({
      id: a.assetId,
      title: a.assetId,
      views: a.views,
    }));

    const payload: AnalyticsSummary = {
      overview: { totalViews },
      topVideos,
      deviceBreakdown: byDevice,
      geographicData: byCountry,
    };

    return Ok({ ok: true, data: payload });
  } catch (e) {
    console.error('Error fetching analytics summary:', e);
    return Err('MUX_ANALYTICS_FAILED');
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await getAnalyticsSummary(request);
  return resultToHttp(
    result,
    {
      AUTH_REQUIRED: 401,
      INVALID_QUERY: 400,
      MUX_ANALYTICS_FAILED: 500,
    },
    {
      'Cache-Control': 'private, max-age=30',
    }
  );
}
