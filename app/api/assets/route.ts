import { requireAuth } from '@/lib/auth/session';
import { muxVideo } from '@/lib/mux/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';

    const response = await muxVideo.listAssets({
      limit,
      page,
    });

    // Filter by search if provided
    let assets = response.data;
    if (search) {
      assets = assets.filter(
        asset =>
          asset.id.toLowerCase().includes(search.toLowerCase()) ||
          asset.passthrough?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
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

    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Failed to fetch assets';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
