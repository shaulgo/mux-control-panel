import { resultToHttp } from '@/lib/api/http';
import { requireAuth } from '@/lib/auth/session';
import { getAssetMetadata, upsertAssetMetadata } from '@/lib/db/asset-metadata';
import { Err, Ok, type Result } from '@/lib/mux/types';
import type { NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';
import { z } from 'zod';

const updateMetadataSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
});

type GetMetadataResult = Result<
  {
    assetId: string;
    title: string | null;
    description: string | null;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  } | null,
  'AUTH_REQUIRED' | 'INVALID_ASSET_ID'
>;

type UpdateMetadataResult = Result<
  {
    assetId: string;
    title: string | null;
    description: string | null;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  },
  'AUTH_REQUIRED' | 'INVALID_ASSET_ID' | 'INVALID_INPUT' | 'UPDATE_FAILED'
>;

async function getMetadata(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<GetMetadataResult> {
  // Check auth
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  const { id: assetId } = await params;

  if (!assetId || typeof assetId !== 'string') {
    return Err('INVALID_ASSET_ID');
  }

  try {
    const metadata = await getAssetMetadata(assetId);

    if (!metadata) {
      return Ok(null);
    }

    return Ok({
      assetId: metadata.assetId,
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      createdAt: metadata.createdAt.toISOString(),
      updatedAt: metadata.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching asset metadata:', error);
    return Err('INVALID_ASSET_ID');
  }
}

async function updateMetadata(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<UpdateMetadataResult> {
  // Check auth
  const authResult = await requireAuth().catch(() => null);
  if (!authResult) {
    return Err('AUTH_REQUIRED');
  }

  const { id: assetId } = await params;

  if (!assetId || typeof assetId !== 'string') {
    return Err('INVALID_ASSET_ID');
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Err('INVALID_INPUT');
  }

  const validation = updateMetadataSchema.safeParse(body);
  if (!validation.success) {
    return Err('INVALID_INPUT');
  }

  try {
    // Filter out undefined values to match the database function signature
    const updateData: {
      title?: string;
      description?: string;
      tags?: string[];
    } = {};

    if (validation.data.title !== undefined) {
      updateData.title = validation.data.title;
    }
    if (validation.data.description !== undefined) {
      updateData.description = validation.data.description;
    }
    if (validation.data.tags !== undefined) {
      updateData.tags = validation.data.tags;
    }

    const metadata = await upsertAssetMetadata(assetId, updateData);

    return Ok({
      assetId: metadata.assetId,
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      createdAt: metadata.createdAt.toISOString(),
      updatedAt: metadata.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating asset metadata:', error);
    return Err('UPDATE_FAILED');
  }
}

export async function GET(
  request: NextRequest,
  params: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const result = await getMetadata(request, params);
  return resultToHttp(result, {
    AUTH_REQUIRED: 401,
    INVALID_ASSET_ID: 400,
  });
}

export async function PUT(
  request: NextRequest,
  params: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const result = await updateMetadata(request, params);
  return resultToHttp(result, {
    AUTH_REQUIRED: 401,
    INVALID_ASSET_ID: 400,
    INVALID_INPUT: 400,
    UPDATE_FAILED: 500,
  });
}
