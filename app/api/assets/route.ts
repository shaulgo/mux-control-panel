import { NextRequest, NextResponse } from 'next/server';
import { muxVideo } from '@/lib/mux/client';
import { requireAuth } from '@/lib/auth/session';

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
      assets = assets.filter((asset: any) =>
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
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}
