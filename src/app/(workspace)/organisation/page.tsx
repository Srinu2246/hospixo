import { Suspense } from 'react';
import type { Metadata } from 'next';

import {
  OrganisationDashboardPage,
  OrganisationDashboardSkeleton,
} from '@/features/dashboard/components/organisation';

export const metadata: Metadata = {
  title: 'Organisation dashboard',
  description: 'All companies statistics for your organisation.',
};

export default function OrganisationPage() {
  return (
    <Suspense fallback={<OrganisationDashboardSkeleton />}>
      <OrganisationDashboardPage />
    </Suspense>
  );
}
