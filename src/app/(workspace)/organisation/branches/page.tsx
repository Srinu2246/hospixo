import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BranchesListPage } from '@/features/branches';
import { getServerAuthSession } from '@/lib/auth/session';
import { resolveAccessLevel, resolveDashboardHomePath } from '@/lib/auth/access-level';

export const metadata: Metadata = {
  title: 'All Branches | Hospixo',
};

type OrganisationBranchesPageProps = Readonly<{
  searchParams: Promise<{ company_id?: string }>;
}>;

export default async function OrganisationBranchesPage({
  searchParams,
}: OrganisationBranchesPageProps) {
  const session = await getServerAuthSession();
  if (session) {
    const level = resolveAccessLevel(session.user);
    if (level !== 'organisation') {
      redirect(resolveDashboardHomePath(session.user));
    }
  }

  const { company_id } = await searchParams;
  return <BranchesListPage companyId={company_id} scope="organisation" />;
}
