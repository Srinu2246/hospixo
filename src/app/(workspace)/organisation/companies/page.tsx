import type { Metadata } from 'next';
import { CompaniesListPage } from '@/features/companies';

export const metadata: Metadata = {
  title: 'All Companies | Hospixo',
};

export default function OrganisationCompaniesPage() {
  return <CompaniesListPage />;
}
