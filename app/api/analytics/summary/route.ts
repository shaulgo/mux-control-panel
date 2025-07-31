import { requireAuth } from '@/lib/auth/session';
import {
  getTopAssetsByViews,
  getTotalViews,
  getViewsByCountry,
  getViewsByDevice,
} from '@/lib/mux/utils';
import { NextRequest, NextResponse } from 'next/server';

type ApiError = {
  ok: false;
  error: { code: string; message: string };
};

type ApiOk<T> = {
  ok: true;
  data: T;
};

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

function error(code: string, message: string): ApiError {
  return { ok: false, error: { code, message } };
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const url = new URL(request.url);
    const periodParam = url.searchParams.get('period') ?? '30';
    const period = Math.max(
      1,
      Math.min(365, Number.parseInt(periodParam, 10) || 30)
    );
    const timeframe = [`${period}:days`];

    const [totalViews, byCountry, byDevice, topAssets] = await Promise.all([
      getTotalViews(timeframe),
      getViewsByCountry(timeframe),
      getViewsByDevice(timeframe),
      getTopAssetsByViews(5, timeframe),
    ]);

    // Note: We do not have asset titles without an extra join. For now, return id only.
    // The UI can render the id or later enrich via DB metadata if desired.
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

    const res: ApiOk<AnalyticsSummary> = { ok: true, data: payload };

    return NextResponse.json(res, {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=30' },
    });
  } catch (e) {
    const message =
      e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Failed to fetch analytics summary';
    return NextResponse.json(error('INTERNAL_ERROR', message), { status: 500 });
  }
}
