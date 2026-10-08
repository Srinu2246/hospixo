import type { Metadata } from 'next';
import { MenuCreationPage } from '@/features/menu';
import { companyMenuPageConfig } from '@/features/menu';

export const metadata: Metadata = {
  title: 'Menu Creation | Hospixo',
  description: 'Create the company menu template shared across all branches.',
};

export default function CompanyMenuCreationPage() {
  return <MenuCreationPage pageConfig={companyMenuPageConfig} />;
}
