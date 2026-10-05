import { Suspense } from 'react';
import type { Metadata } from 'next';

import { DashboardPageContent } from '@/components/dashboard/dashboard-page/dashboard-page';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton/dashboard-skeleton';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Enterprise overview and real-time operations telemetry.',
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
}
