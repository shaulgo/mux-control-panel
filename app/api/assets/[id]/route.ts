import { NextRequest, NextResponse } from 'next/server';
import { muxVideo } from '@/lib/mux/client';
import { requireAuth } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const response = await muxVideo.getAsset(params.id);
    return NextResponse.json({ data: response.data });
  } catch (error: any) {
    console.error('Error fetching asset:', error);
    
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    await muxVideo.deleteAsset(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
