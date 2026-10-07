import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { OrganisationDashboardPage } from '@/features/dashboard/components/organisation';
import { buildOrganisationDashboardQueryString } from '@/features/dashboard/api/organisation-dashboard';
import { getOrganisationDashboard } from '@/features/dashboard/api/organisation-dashboard.server';
import { getServerAuthSession } from '@/lib/auth/session';
import { resolveAccessLevel, resolveDashboardHomePath } from '@/lib/auth/access-level';

export const metadata: Metadata = {
  title: 'Organisation dashboard',
  description: 'All companies statistics for your organisation.',
};

type OrganisationPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function OrganisationPage({ searchParams }: OrganisationPageProps) {
  const session = await getServerAuthSession();
  if (session) {
    const level = resolveAccessLevel(session.user);
    if (level !== 'organisation') {
      redirect(resolveDashboardHomePath(session.user));
    }
  }

  const params = (await searchParams) ?? {};
  const initialQueryString = buildOrganisationDashboardQueryString(params);
  const { data, source, loadError } = await getOrganisationDashboard(params);

  return (
    <OrganisationDashboardPage
      initialQueryString={initialQueryString}
      initialPayload={{
        data,
        source,
        loadError: loadError ?? null,
      }}
    />
  );
}
