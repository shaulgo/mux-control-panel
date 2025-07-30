import { db } from './client';
import type { AssetMetadata } from '@prisma/client';

export async function getAssetMetadata(
  assetId: string
): Promise<AssetMetadata | null> {
  return db.assetMetadata.findUnique({
    where: { assetId },
  });
}

export async function upsertAssetMetadata(
  assetId: string,
  data: {
    title?: string;
    description?: string;
    tags?: string[];
    duration?: number;
    aspectRatio?: string;
  }
): Promise<AssetMetadata> {
  return db.assetMetadata.upsert({
    where: { assetId },
    update: data,
    create: {
      assetId,
      ...data,
    },
  });
}

export async function deleteAssetMetadata(assetId: string): Promise<void> {
  await db.assetMetadata.delete({
    where: { assetId },
  });
}

export async function searchAssetsByMetadata(query: string): Promise<string[]> {
  const results = await db.assetMetadata.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            has: query,
          },
        },
      ],
    },
    select: {
      assetId: true,
    },
  });

  return results.map(r => r.assetId);
}
