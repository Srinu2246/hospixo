import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

export function parseRange(value: string | null): OrganisationDateRangeId {
  if (
    value === 'today' ||
    value === 'last-7-days' ||
    value === 'last-30-days' ||
    value === 'custom'
  ) {
    return value;
  }
  return 'last-7-days';
}

export function parseIsoDate(value: string | null, fallback: string): string {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

export function syncDashboardSearchParams(
  pathname: string,
  searchParams: { toString(): string },
  updates: Record<string, string | undefined>,
): void {
  const params = new URLSearchParams(searchParams.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const query = params.toString();
  const nextUrl = query ? `${pathname}?${query}` : pathname;
  window.history.replaceState(window.history.state, '', nextUrl);
}
