import { db } from './client';
import type { UploadToken } from '@prisma/client';

export async function createUploadToken(data: {
  token: string;
  url: string;
  expiresAt: Date;
}): Promise<UploadToken> {
  return db.uploadToken.create({
    data,
  });
}

export async function getUploadTokens(): Promise<UploadToken[]> {
  return db.uploadToken.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getActiveUploadTokens(): Promise<UploadToken[]> {
  return db.uploadToken.findMany({
    where: {
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function markTokenAsUsed(id: string): Promise<UploadToken> {
  return db.uploadToken.update({
    where: { id },
    data: {
      used: true,
      usedAt: new Date(),
    },
  });
}

export async function deleteUploadToken(id: string): Promise<void> {
  await db.uploadToken.delete({
    where: { id },
  });
}

export async function cleanupExpiredTokens(): Promise<number> {
  const result = await db.uploadToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
