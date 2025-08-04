import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { muxVideo } from '@/lib/mux/client';
import { Err, Ok, type Result } from '@/lib/mux/types';
import { assetQuerySchema } from '@/lib/validations/upload';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

type AssetListResult = Result<
  {
    data: unknown[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  },
  'AUTH_REQUIRED' | 'INVALID_QUERY' | 'MUX_LIST_ASSETS_FAILED'
>;

async function listAssets(request: NextRequest): Promise<AssetListResult> {
  // Check auth
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  // Parse and validate query params
  const { searchParams } = new URL(request.url);
  const queryResult = assetQuerySchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    search: searchParams.get('search'),
  });

  if (!queryResult.success) {
    return Err('INVALID_QUERY');
  }

  const { page, limit, search } = queryResult.data;

  // Fetch assets from Mux
  try {
    const response = await muxVideo.listAssets({
      limit,
      page,
    });

    // Filter by search if provided
    const assets = search
      ? response.data.filter(asset => {
          const q = search.toLowerCase();
          const idMatch = asset.id.toLowerCase().includes(q);
          const pass = asset.passthrough?.toLowerCase().includes(q) ?? false;
          return idMatch || pass;
        })
      : response.data;

    return Ok({
      data: assets,
      pagination: {
        page,
        limit,
        total: assets.length,
        hasMore: assets.length === limit,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching assets:', error);
    return Err('MUX_LIST_ASSETS_FAILED');
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await listAssets(request);
  return resultToHttp(
    result,
    {
      AUTH_REQUIRED: 401,
      INVALID_QUERY: 400,
      MUX_LIST_ASSETS_FAILED: 500,
    },
    {
      'Cache-Control': 'private, max-age=5',
    }
  );
}
