import { db } from './client';
import type { Library, LibraryAsset } from '@prisma/client';

export type LibraryWithAssets = Library & {
  assets: LibraryAsset[];
};

export async function getLibraries(): Promise<LibraryWithAssets[]> {
  return db.library.findMany({
    include: {
      assets: {
        orderBy: {
          position: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getLibraryBySlug(
  slug: string
): Promise<LibraryWithAssets | null> {
  return db.library.findUnique({
    where: { slug },
    include: {
      assets: {
        orderBy: {
          position: 'asc',
        },
      },
    },
  });
}

export async function createLibrary(data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<Library> {
  return db.library.create({
    data,
  });
}

export async function updateLibrary(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
  }
): Promise<Library> {
  return db.library.update({
    where: { id },
    data,
  });
}

export async function deleteLibrary(id: string): Promise<void> {
  await db.library.delete({
    where: { id },
  });
}

export async function addAssetToLibrary(
  libraryId: string,
  assetId: string
): Promise<LibraryAsset> {
  // Get the next position
  const lastAsset = await db.libraryAsset.findFirst({
    where: { libraryId },
    orderBy: { position: 'desc' },
  });

  const position = (lastAsset?.position ?? 0) + 1;

  return db.libraryAsset.create({
    data: {
      libraryId,
      assetId,
      position,
    },
  });
}

export async function removeAssetFromLibrary(
  libraryId: string,
  assetId: string
): Promise<void> {
  await db.libraryAsset.delete({
    where: {
      libraryId_assetId: {
        libraryId,
        assetId,
      },
    },
  });
}

export async function reorderLibraryAssets(
  libraryId: string,
  assetIds: string[]
): Promise<void> {
  await db.$transaction(
    assetIds.map((assetId, index) =>
      db.libraryAsset.update({
        where: {
          libraryId_assetId: {
            libraryId,
            assetId,
          },
        },
        data: {
          position: index + 1,
        },
      })
    )
  );
}
