import { db } from './client';
import type { DailyUsage } from '@prisma/client';

export async function getDailyUsage(
  startDate: Date,
  endDate: Date
): Promise<DailyUsage[]> {
  return db.dailyUsage.findMany({
    where: {
      day: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      day: 'asc',
    },
  });
}

export async function upsertDailyUsage(
  day: Date,
  data: {
    streamedMinutes?: bigint;
    storageGb?: number;
  }
): Promise<DailyUsage> {
  return db.dailyUsage.upsert({
    where: { day },
    update: data,
    create: {
      day,
      ...data,
    },
  });
}

export async function getTotalUsage(): Promise<{
  totalStreamedMinutes: bigint;
  totalStorageGb: number;
}> {
  const result = await db.dailyUsage.aggregate({
    _sum: {
      streamedMinutes: true,
      storageGb: true,
    },
  });

  return {
    totalStreamedMinutes: result._sum.streamedMinutes ?? BigInt(0),
    totalStorageGb: result._sum.storageGb ?? 0,
  };
}

export async function getUsageForPeriod(
  days: number
): Promise<DailyUsage[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  return getDailyUsage(startDate, endDate);
}
