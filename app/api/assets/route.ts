import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { muxVideo } from '@/lib/mux/client';
import {
  type AppAssetWithMetadata,
  assetId,
  Err,
  Ok,
  type Result,
} from '@/lib/mux/types';
import { assetQuerySchema } from '@/lib/validations/upload';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

type AssetListResult = Result<
  {
    data: AppAssetWithMetadata[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  },
  | 'AUTH_REQUIRED'
  | 'INVALID_QUERY'
  | 'MUX_UNAUTHORIZED'
  | 'MUX_LIST_ASSETS_FAILED'
>;

async function listAssets(request: NextRequest): Promise<AssetListResult> {
  // Check auth
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  // Parse and validate query params
  const { searchParams } = new URL(request.url);
  const searchValue = searchParams.get('search');
  const queryResult = assetQuerySchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    ...(searchValue !== null ? { search: searchValue } : {}),
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
    const filteredAssets = search
      ? response.data.filter(asset => {
          const q = search.toLowerCase();
          const idMatch = asset.id.toLowerCase().includes(q);
          const pass = asset.passthrough?.toLowerCase().includes(q) ?? false;
          return idMatch || pass;
        })
      : response.data;

    // Map to app asset shape without extra metadata layer (feature removed)
    const assetsWithMetadata: AppAssetWithMetadata[] = filteredAssets.map(
      asset => ({
        ...asset,
        id: assetId(asset.id),
        metadata: null,
      })
    );

    return Ok({
      data: assetsWithMetadata,
      pagination: {
        page,
        limit,
        total: assetsWithMetadata.length,
        hasMore: assetsWithMetadata.length === limit,
      },
    });
  } catch (error: unknown) {
    // Surface clearer error for credential issues
    let status: number | undefined = undefined;
    if (error && typeof error === 'object' && 'status' in error) {
      const raw = (error as { status?: unknown }).status;
      const parsed = Number(raw);
      status = Number.isFinite(parsed) ? parsed : undefined;
    }
    if (status === 401) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Mux unauthorized: check MUX_TOKEN_ID/MUX_TOKEN_SECRET');
      }
      return Err('MUX_UNAUTHORIZED');
    }
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
      MUX_UNAUTHORIZED: 502,
      MUX_LIST_ASSETS_FAILED: 500,
    },
    {
      'Cache-Control': 'private, max-age=5',
    }
  );
}
