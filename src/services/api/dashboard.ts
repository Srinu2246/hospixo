import type { AdminDashboardOverview } from '@/types/dashboard';

const DASHBOARD_BFF_PATH = '/api/dashboard';

async function adminBffJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? `BFF request failed: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchDashboardFromBff(): Promise<AdminDashboardOverview> {
  return adminBffJson<AdminDashboardOverview>(DASHBOARD_BFF_PATH);
}
