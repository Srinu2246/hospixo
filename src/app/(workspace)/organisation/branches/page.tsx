import type { Metadata } from 'next';
import { BranchesListPage } from '@/features/branches';

export const metadata: Metadata = {
  title: 'All Branches | Hospixo',
};

type OrganisationBranchesPageProps = Readonly<{
  searchParams: Promise<{ company_id?: string }>;
}>;

export default async function OrganisationBranchesPage({
  searchParams,
}: OrganisationBranchesPageProps) {
  const { company_id } = await searchParams;
  return <BranchesListPage companyId={company_id} scope="organisation" />;
}
