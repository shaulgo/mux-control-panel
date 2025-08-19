import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { getLibraries } from '@/lib/db/libraries';
import { Err, Ok, type Result } from '@/lib/mux/types';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';

type LibraryDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  assetCount: number;
};

type ListLibrariesResult = Result<
  LibraryDto[],
  'AUTH_REQUIRED' | 'DB_LIST_LIBRARIES_FAILED'
>;

async function listLibraries(
  request: NextRequest
): Promise<ListLibrariesResult> {
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('search') ?? '').trim().toLowerCase();

    const libraries = await getLibraries();
    const mapped: LibraryDto[] = libraries.map(lib => ({
      id: lib.id,
      name: lib.name,
      slug: lib.slug,
      description: lib.description ?? null,
      createdAt: lib.createdAt.toISOString(),
      assetCount: lib.assets.length,
    }));

    const filtered =
      q.length > 0
        ? mapped.filter(
            lib =>
              lib.name.toLowerCase().includes(q) ||
              lib.slug.toLowerCase().includes(q) ||
              (lib.description ?? '').toLowerCase().includes(q)
          )
        : mapped;

    return Ok(filtered);
  } catch (e) {
    console.error('Error listing libraries:', e);
    return Err('DB_LIST_LIBRARIES_FAILED');
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await listLibraries(request);
  return resultToHttp(
    result,
    {
      AUTH_REQUIRED: 401,
      DB_LIST_LIBRARIES_FAILED: 500,
    },
    { 'Cache-Control': 'private, max-age=10' }
  );
}
