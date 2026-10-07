import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { BranchDashboardPage } from '@/features/dashboard/components/branch';
import { buildBranchDashboardQueryString } from '@/features/dashboard/api/branch-dashboard';
import { getBranchDashboard } from '@/features/dashboard/api/branch-dashboard.server';
import { getServerAuthSession } from '@/lib/auth/session';
import { resolveAccessLevel, resolveDashboardHomePath } from '@/lib/auth/access-level';

export const metadata: Metadata = {
  title: 'Branch dashboard',
  description: 'Branch performance, order breakdown, and operations statistics.',
};

type BranchPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function BranchPage({ searchParams }: BranchPageProps) {
  const session = await getServerAuthSession();
  if (session) {
    const level = resolveAccessLevel(session.user);
    if (level === 'counter' || level === 'captain' || level === 'kitchen') {
      redirect(resolveDashboardHomePath(session.user));
    }
  }

  const params = (await searchParams) ?? {};

  const initialQueryString = buildBranchDashboardQueryString(params);
  const { data, source, loadError } = await getBranchDashboard(params);

  return (
    <BranchDashboardPage
      initialQueryString={initialQueryString}
      initialPayload={{
        data,
        source,
        loadError: loadError ?? null,
      }}
    />
  );
}
