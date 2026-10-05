import type { AdminDashboardOverview } from '@/types/dashboard';

/** Admin control-plane dashboard BFF (existing route). */
export async function fetchDashboardFromBff(): Promise<AdminDashboardOverview> {
  const response = await fetch('/api/dashboard', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard');
  }
  return response.json() as Promise<AdminDashboardOverview>;
}
