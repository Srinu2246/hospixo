import type { Metadata } from 'next';

import { PosDashboardPage } from '@/features/pos/screens/dashboard/pos-dashboard-page';

export const metadata: Metadata = {
  title: 'POS Dashboard',
  description: 'Live orders, floor status, and branch operations overview.',
};

export default function PosDashboardRoutePage() {
  return <PosDashboardPage />;
}
