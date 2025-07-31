import { requireAuth } from '@/lib/auth/session';
import { muxVideo } from '@/lib/mux/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const response = await muxVideo.getAsset(id);
    return NextResponse.json({ data: response });
  } catch (error: unknown) {
    console.error('Error fetching asset:', error);

    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 404
    ) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Failed to fetch asset';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    await muxVideo.deleteAsset(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting asset:', error);

    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 404
    ) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Failed to delete asset';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
