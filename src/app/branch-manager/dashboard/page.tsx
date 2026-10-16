import type { Metadata } from 'next';
import { DashboardScreen } from '@/features/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Hospixo',
  description: 'Multi-level statistics and operational analytics for Hospixo Hospital Management.',
};

export default function BranchManagerDashboardPage() {
  return <DashboardScreen initialLevel="branch" hideLevelSwitcher />;
}
