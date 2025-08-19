import { apiErr, resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { getPlaybackRestrictionSettings } from '@/lib/db/settings';
import { muxVideo } from '@/lib/mux/client';
import type { Result } from '@/lib/mux/types';
import { enforceRestrictionOnAsset } from '@/lib/mux/utils';
import { type NextRequest, NextResponse } from 'next/server';

const enforcedAssetIds = new Set<string>();

type UploadCreated = { id: string; url: string; status: string };

export async function POST(req: NextRequest): Promise<NextResponse> {
  await requireAuth();

  const origin =
    req.headers.get('origin') ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000';

  // Wrap the side-effect in a Result at the route boundary
  const created: Result<UploadCreated, 'MUX_CREATE_DIRECT_UPLOAD_FAILED'> =
    await (async () => {
      try {
        const upload = await muxVideo.createDirectUpload({
          cors_origin: origin,
          new_asset_settings: {
            playback_policies: ['public'],
          },
        });
        return {
          ok: true,
          data: { id: upload.id, url: upload.url, status: upload.status },
        };
      } catch (e) {
        const message =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message?: unknown }).message)
            : 'Failed to create direct upload';
        return {
          ok: false,
          error: { code: 'MUX_CREATE_DIRECT_UPLOAD_FAILED', message },
        };
      }
    })();

  return resultToHttp(created, { MUX_CREATE_DIRECT_UPLOAD_FAILED: 502 });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  await requireAuth();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(apiErr('BAD_REQUEST', 'Missing id'), {
      status: 400,
    });
  }

  const res: Result<unknown, 'MUX_GET_DIRECT_UPLOAD_FAILED'> =
    await (async () => {
      try {
        const upload = await muxVideo.getDirectUpload(id);
        // If asset is created, apply restriction if enabled
        const assetId = (upload as { asset_id?: string | null }).asset_id;
        if (assetId && !enforcedAssetIds.has(assetId)) {
          try {
            const settings = await getPlaybackRestrictionSettings();
            if (settings.enabled && settings.restrictionId) {
              await enforceRestrictionOnAsset(assetId, settings.restrictionId);
              enforcedAssetIds.add(assetId);
            }
          } catch (e) {
            if (process.env.NODE_ENV !== 'test') {
              console.error(
                'Failed to apply restriction to direct upload asset',
                assetId,
                e
              );
            }
          }
        }
        return { ok: true, data: upload };
      } catch (e) {
        const message =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message?: unknown }).message)
            : 'Failed to get direct upload';
        return {
          ok: false,
          error: { code: 'MUX_GET_DIRECT_UPLOAD_FAILED', message },
        };
      }
    })();

  return resultToHttp(
    res,
    { MUX_GET_DIRECT_UPLOAD_FAILED: 502 },
    { 'Cache-Control': 'private, max-age=3' }
  );
}
