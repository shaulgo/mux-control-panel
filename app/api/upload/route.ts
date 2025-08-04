import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { muxVideo } from '@/lib/mux/client';
import { Err, Ok, type Result } from '@/lib/mux/types';
import { uploadUrlsSchema } from '@/lib/validations/upload';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

type UploadResult = {
  url: string;
  success: boolean;
  asset?: unknown;
  error?: string;
};

type CreateAssetsResult = Result<
  { results: UploadResult[] },
  | 'AUTH_REQUIRED'
  | 'INVALID_INPUT'
  | 'INVALID_JSON'
  | 'MUX_CREATE_ASSETS_FAILED'
>;

async function createAssets(request: NextRequest): Promise<CreateAssetsResult> {
  // Check auth
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  // Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Invalid JSON body:', error);
    return Err('INVALID_JSON');
  }

  // Validate input
  const validation = uploadUrlsSchema.safeParse(body);
  if (!validation.success) {
    return Err('INVALID_INPUT');
  }

  const { urls } = validation.data;
  const results: UploadResult[] = [];

  // Create assets for each URL
  for (const url of urls) {
    try {
      const asset = await muxVideo.createAsset({
        input: url,
        playback_policy: ['public'],
      });

      results.push({
        url,
        success: true,
        asset,
      });
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Failed to create asset';
      results.push({
        url,
        success: false,
        error: message,
      });
    }
  }

  return Ok({ results });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const result = await createAssets(request);
  return resultToHttp(result, {
    AUTH_REQUIRED: 401,
    INVALID_INPUT: 400,
    INVALID_JSON: 400,
    MUX_CREATE_ASSETS_FAILED: 500,
  });
}
