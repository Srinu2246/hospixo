import type { DashboardCompany, DashboardOverview } from '@/features/dashboard/types';

export type DashboardBootstrap = Readonly<{
  data: DashboardOverview;
  companies?: readonly DashboardCompany[];
  source: 'backend' | 'fallback';
  loadError?: string | null;
}>;
