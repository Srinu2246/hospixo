import type { Metadata } from 'next';

import { DashboardScreen } from '@/features/dashboard/components/DashboardScreen';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Hospixo workspace',
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
