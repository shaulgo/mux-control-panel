import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import {
  getPlaybackRestrictionSettings,
  setPlaybackRestrictionSettings,
  type PlaybackRestrictionSettings,
} from '@/lib/db/settings';
import { mux } from '@/lib/mux/client';
import { Err, Ok, type Result } from '@/lib/mux/types';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

type GetResult = Result<
  PlaybackRestrictionSettings,
  'AUTH_REQUIRED' | 'SETTINGS_READ_FAILED'
>;
type PutResult = Result<
  PlaybackRestrictionSettings,
  | 'AUTH_REQUIRED'
  | 'INVALID_JSON'
  | 'INVALID_INPUT'
  | 'MUX_CREATE_OR_UPDATE_RESTRICTION_FAILED'
  | 'SETTINGS_WRITE_FAILED'
>;

export async function GET(): Promise<NextResponse> {
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    const res: GetResult = Err('AUTH_REQUIRED');
    return resultToHttp(res, { AUTH_REQUIRED: 401, SETTINGS_READ_FAILED: 500 });
  }
  try {
    const settings = await getPlaybackRestrictionSettings();
    const res: GetResult = Ok(settings);
    return resultToHttp(res, { AUTH_REQUIRED: 401, SETTINGS_READ_FAILED: 500 });
  } catch {
    const res: GetResult = Err('SETTINGS_READ_FAILED');
    return resultToHttp(res, { AUTH_REQUIRED: 401, SETTINGS_READ_FAILED: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    const res: PutResult = Err('AUTH_REQUIRED');
    return resultToHttp(res, {
      AUTH_REQUIRED: 401,
      INVALID_JSON: 400,
      INVALID_INPUT: 400,
      MUX_CREATE_OR_UPDATE_RESTRICTION_FAILED: 502,
      SETTINGS_WRITE_FAILED: 500,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const res: PutResult = Err('INVALID_JSON');
    return resultToHttp(res, {
      AUTH_REQUIRED: 401,
      INVALID_JSON: 400,
      INVALID_INPUT: 400,
      MUX_CREATE_OR_UPDATE_RESTRICTION_FAILED: 502,
      SETTINGS_WRITE_FAILED: 500,
    });
  }

  // Minimal validation: keep it simple
  const {
    enabled = false,
    allowedDomains = [],
    allowNoReferrer = false,
    allowNoUserAgent = true,
    allowHighRiskUserAgent = true,
  } = (body ?? {}) as Partial<PlaybackRestrictionSettings>;

  if (!Array.isArray(allowedDomains) || allowedDomains.length > 10) {
    const res: PutResult = Err('INVALID_INPUT');
    return resultToHttp(res, {
      AUTH_REQUIRED: 401,
      INVALID_JSON: 400,
      INVALID_INPUT: 400,
      MUX_CREATE_OR_UPDATE_RESTRICTION_FAILED: 502,
      SETTINGS_WRITE_FAILED: 500,
    });
  }

  let restrictionId: string | undefined;
  try {
    if (enabled) {
      // Create a playback restriction in Mux if needed
      const settings = await getPlaybackRestrictionSettings();
      restrictionId = settings.restrictionId;

      if (!restrictionId) {
        const created = await mux.video.playbackRestrictions.create({
          referrer: {
            allowed_domains: allowedDomains,
            allow_no_referrer: allowNoReferrer,
          },
          user_agent: {
            allow_no_user_agent: allowNoUserAgent,
            allow_high_risk_user_agent: allowHighRiskUserAgent,
          },
        } as unknown as Parameters<
          typeof mux.video.playbackRestrictions.create
        >[0]);
        const createdAny = created as unknown as {
          id?: string;
          data?: { id?: string };
        };
        restrictionId = createdAny.id ?? createdAny.data?.id;
        if (!restrictionId) throw new Error('No restriction id returned');
      } else {
        // Update existing restriction in Mux
        await mux.video.playbackRestrictions.updateReferrer(restrictionId, {
          allowed_domains: allowedDomains,
          allow_no_referrer: allowNoReferrer,
        } as unknown as Parameters<
          typeof mux.video.playbackRestrictions.updateReferrer
        >[1]);
        await mux.video.playbackRestrictions.updateUserAgent(restrictionId, {
          allow_no_user_agent: allowNoUserAgent,
          allow_high_risk_user_agent: allowHighRiskUserAgent,
        } as unknown as Parameters<
          typeof mux.video.playbackRestrictions.updateUserAgent
        >[1]);
      }
    }
  } catch {
    const res: PutResult = Err('MUX_CREATE_OR_UPDATE_RESTRICTION_FAILED');
    return resultToHttp(res, {
      AUTH_REQUIRED: 401,
      INVALID_JSON: 400,
      INVALID_INPUT: 400,
      MUX_CREATE_OR_UPDATE_RESTRICTION_FAILED: 502,
      SETTINGS_WRITE_FAILED: 500,
    });
  }

  try {
    const base = {
      enabled,
      allowedDomains,
      allowNoReferrer,
      allowNoUserAgent,
      allowHighRiskUserAgent,
    } satisfies Omit<PlaybackRestrictionSettings, 'restrictionId'>;
    const nextObj = (
      restrictionId ? { ...base, restrictionId } : base
    ) as PlaybackRestrictionSettings;
    await setPlaybackRestrictionSettings(nextObj);
    const res: PutResult = Ok(nextObj);
    return resultToHttp(res, {
      AUTH_REQUIRED: 401,
      INVALID_JSON: 400,
      INVALID_INPUT: 400,
      MUX_CREATE_OR_UPDATE_RESTRICTION_FAILED: 502,
      SETTINGS_WRITE_FAILED: 500,
    });
  } catch {
    const res: PutResult = Err('SETTINGS_WRITE_FAILED');
    return resultToHttp(res, {
      AUTH_REQUIRED: 401,
      INVALID_JSON: 400,
      INVALID_INPUT: 400,
      MUX_CREATE_OR_UPDATE_RESTRICTION_FAILED: 502,
      SETTINGS_WRITE_FAILED: 500,
    });
  }
}
