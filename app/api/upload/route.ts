import { NextRequest, NextResponse } from 'next/server';
import { muxVideo } from '@/lib/mux/client';
import { requireAuth } from '@/lib/auth/session';
import { uploadUrlsSchema } from '@/lib/validations/upload';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const validation = uploadUrlsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { urls } = validation.data;
    const results = [];

    // Create assets for each URL
    for (const url of urls) {
      try {
        const response = await muxVideo.createAsset({
          input: url,
          playback_policy: ['public'],
        });

        results.push({
          url,
          success: true,
          asset: response.data,
        });
      } catch (error: any) {
        results.push({
          url,
          success: false,
          error: error.message || 'Failed to create asset',
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process upload' },
      { status: 500 }
    );
  }
}
