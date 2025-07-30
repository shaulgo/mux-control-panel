import { requireAuth } from '@/lib/auth/session';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <DashboardLayout>{children}</DashboardLayout>;
}
