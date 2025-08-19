import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { Err, Ok, type Result } from '@/lib/mux/types';
import { getAssetViews } from '@/lib/mux/utils';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

type GetAssetViewsResult = Result<
  unknown[],
  'AUTH_REQUIRED' | 'MUX_DATA_FAILED' | 'BAD_REQUEST'
>;

async function getViews(request: NextRequest): Promise<GetAssetViewsResult> {
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) return Err('AUTH_REQUIRED');

  const { pathname } = new URL(request.url);
  const parts = pathname.split('/');
  const id = parts[parts.length - 1];
  if (!id) return Err('BAD_REQUEST', 'Missing asset id');

  const res = await getAssetViews(id);
  if (!res.ok) return Err('MUX_DATA_FAILED', 'Failed to get asset views');
  return Ok(res.data);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await getViews(request);
  return resultToHttp(result, {
    AUTH_REQUIRED: 401,
    MUX_DATA_FAILED: 502,
    BAD_REQUEST: 400,
  });
}
