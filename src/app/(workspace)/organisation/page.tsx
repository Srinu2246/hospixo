import type { Metadata } from 'next';

import { OrganisationDashboardPage } from '@/features/dashboard/components/organisation';
import { buildOrganisationDashboardQueryString } from '@/features/dashboard/api/organisation-dashboard';
import { getOrganisationDashboard } from '@/features/dashboard/api/organisation-dashboard.server';

export const metadata: Metadata = {
  title: 'Organisation dashboard',
  description: 'All companies statistics for your organisation.',
};

type OrganisationPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function OrganisationPage({ searchParams }: OrganisationPageProps) {
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
