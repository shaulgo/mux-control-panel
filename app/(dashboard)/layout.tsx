import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { requireAuth } from '@/lib/auth/session';

import React from 'react';

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  await requireAuth();

  return <DashboardLayout>{children}</DashboardLayout>;
}
