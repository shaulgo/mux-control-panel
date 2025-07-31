import { requireAuth } from '@/lib/auth/session';
import { muxVideo } from '@/lib/mux/client';
import { uploadUrlsSchema } from '@/lib/validations/upload';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const validation = uploadUrlsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
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
          asset: response,
        });
      } catch (error) {
        results.push({
          url,
          success: false,
          error: (error as Error).message || 'Failed to create asset',
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to process upload' },
      { status: 500 }
    );
  }
}
