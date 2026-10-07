import type { Metadata } from 'next';
import { BranchesListPage } from '@/features/branches';

export const metadata: Metadata = {
  title: 'Company Branches | Hospixo',
};

type CompanyBranchesPageProps = Readonly<{
  searchParams: Promise<{ company_id?: string }>;
}>;

export default async function CompanyBranchesPage({ searchParams }: CompanyBranchesPageProps) {
  const { company_id } = await searchParams;
  return <BranchesListPage companyId={company_id} scope="company" />;
}
