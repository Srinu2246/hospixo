import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { CompanyDashboardPage } from '@/features/dashboard/components/company';
import { buildCompanyDashboardQueryString } from '@/features/dashboard/api/company-dashboard';
import {
  ensureCompanyDashboardScope,
  getCompanyDashboard,
} from '@/features/dashboard/api/company-dashboard.server';
import { getServerAuthSession } from '@/lib/auth/session';
import { resolveAccessLevel, resolveDashboardHomePath } from '@/lib/auth/access-level';

export const metadata: Metadata = {
  title: 'Company dashboard',
  description: 'All branches statistics for your company.',
};

type CompanyPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function CompanyPage({ searchParams }: CompanyPageProps) {
  const session = await getServerAuthSession();
  if (session) {
    const level = resolveAccessLevel(session.user);
    if (level !== 'organisation' && level !== 'company') {
      redirect(resolveDashboardHomePath(session.user));
    }
  }

  const params = (await searchParams) ?? {};
  await ensureCompanyDashboardScope(params);

  const initialQueryString = buildCompanyDashboardQueryString(params);
  const { data, source, loadError } = await getCompanyDashboard(params);

  return (
    <CompanyDashboardPage
      initialQueryString={initialQueryString}
      initialPayload={{
        data,
        source,
        loadError: loadError ?? null,
      }}
    />
  );
}
