import { fetchDashboardFromBff } from '@/api/dashboard';

export async function loadDashboardOverview() {
  return fetchDashboardFromBff();
}
