import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { getUploadTokens } from '@/lib/db/upload-tokens';
import { Err, Ok, type Result } from '@/lib/mux/types';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

type TokenDto = {
  id: string;
  token: string;
  url: string;
  expiresAt: string;
  used: boolean;
  usedAt: string | null;
  createdAt: string;
};

type ListTokensResult = Result<
  TokenDto[],
  'AUTH_REQUIRED' | 'DB_LIST_TOKENS_FAILED'
>;

async function listTokens(request: NextRequest): Promise<ListTokensResult> {
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('search') ?? '').trim().toLowerCase();

    const tokens = await getUploadTokens();
    const mapped: TokenDto[] = tokens.map(t => ({
      id: t.id,
      token: t.token,
      url: t.url,
      expiresAt: t.expiresAt.toISOString(),
      used: t.used,
      usedAt: t.usedAt ? t.usedAt.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
    }));

    const filtered =
      q.length > 0
        ? mapped.filter(
            t =>
              t.id.toLowerCase().includes(q) ||
              t.token.toLowerCase().includes(q) ||
              t.url.toLowerCase().includes(q)
          )
        : mapped;

    return Ok(filtered);
  } catch (e) {
    console.error('Error listing upload tokens:', e);
    return Err('DB_LIST_TOKENS_FAILED');
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await listTokens(request);
  return resultToHttp(
    result,
    {
      AUTH_REQUIRED: 401,
      DB_LIST_TOKENS_FAILED: 500,
    },
    { 'Cache-Control': 'private, max-age=10' }
  );
}
