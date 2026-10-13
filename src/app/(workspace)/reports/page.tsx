import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ReportsPage } from '@/features/reports/reports';

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Business overview, sales, orders, and operational reports.',
};

export default function ReportsRoutePage() {
  return (
    <Suspense fallback={null}>
      <ReportsPage />
    </Suspense>
  );
}
