import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CompaniesListPage } from '@/features/companies';
import { getServerAuthSession } from '@/lib/auth/session';
import { resolveAccessLevel, resolveDashboardHomePath } from '@/lib/auth/access-level';

export const metadata: Metadata = {
  title: 'All Companies | Hospixo',
};

export default async function OrganisationCompaniesPage() {
  const session = await getServerAuthSession();
  if (session) {
    const level = resolveAccessLevel(session.user);
    if (level !== 'organisation') {
      redirect(resolveDashboardHomePath(session.user));
    }
  }

  return <CompaniesListPage />;
}
