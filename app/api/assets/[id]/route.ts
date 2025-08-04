import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { muxVideo } from '@/lib/mux/client';
import { Err, Ok, type Result } from '@/lib/mux/types';
import { assetIdParamSchema } from '@/lib/validations/upload';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

type GetAssetResult = Result<
  { data: unknown },
  'AUTH_REQUIRED' | 'INVALID_PARAM' | 'ASSET_NOT_FOUND' | 'MUX_GET_ASSET_FAILED'
>;

type DeleteAssetResult = Result<
  { success: boolean },
  | 'AUTH_REQUIRED'
  | 'INVALID_PARAM'
  | 'ASSET_NOT_FOUND'
  | 'MUX_DELETE_ASSET_FAILED'
>;

async function getAsset(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<GetAssetResult> {
  // Check auth
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  // Parse and validate params
  const { id } = await params;
  const paramResult = assetIdParamSchema.safeParse({ id });
  if (!paramResult.success) {
    return Err('INVALID_PARAM');
  }

  // Fetch asset from Mux
  try {
    const asset = await muxVideo.getAsset(paramResult.data.id);
    return Ok({ data: asset });
  } catch (error: unknown) {
    console.error('Error fetching asset:', error);

    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 404
    ) {
      return Err('ASSET_NOT_FOUND');
    }

    return Err('MUX_GET_ASSET_FAILED');
  }
}

async function deleteAsset(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<DeleteAssetResult> {
  // Check auth
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  // Parse and validate params
  const { id } = await params;
  const paramResult = assetIdParamSchema.safeParse({ id });
  if (!paramResult.success) {
    return Err('INVALID_PARAM');
  }

  // Delete asset from Mux
  try {
    await muxVideo.deleteAsset(paramResult.data.id);
    return Ok({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting asset:', error);

    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 404
    ) {
      return Err('ASSET_NOT_FOUND');
    }

    return Err('MUX_DELETE_ASSET_FAILED');
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const result = await getAsset(request, context);
  return resultToHttp(
    result,
    {
      AUTH_REQUIRED: 401,
      INVALID_PARAM: 400,
      ASSET_NOT_FOUND: 404,
      MUX_GET_ASSET_FAILED: 500,
    },
    {
      'Cache-Control': 'private, max-age=5',
    }
  );
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const result = await deleteAsset(request, context);
  return resultToHttp(result, {
    AUTH_REQUIRED: 401,
    INVALID_PARAM: 400,
    ASSET_NOT_FOUND: 404,
    MUX_DELETE_ASSET_FAILED: 500,
  });
}
