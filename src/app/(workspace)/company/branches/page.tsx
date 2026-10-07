import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BranchesListPage } from '@/features/branches';
import { getServerAuthSession } from '@/lib/auth/session';
import { resolveAccessLevel, resolveDashboardHomePath } from '@/lib/auth/access-level';

export const metadata: Metadata = {
  title: 'Company Branches | Hospixo',
};

type CompanyBranchesPageProps = Readonly<{
  searchParams: Promise<{ company_id?: string }>;
}>;

export default async function CompanyBranchesPage({ searchParams }: CompanyBranchesPageProps) {
  const session = await getServerAuthSession();
  if (session) {
    const level = resolveAccessLevel(session.user);
    if (level !== 'organisation' && level !== 'company') {
      redirect(resolveDashboardHomePath(session.user));
    }
  }

  const { company_id } = await searchParams;
  return <BranchesListPage companyId={company_id} scope="company" />;
}
