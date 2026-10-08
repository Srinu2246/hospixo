import type { Metadata } from 'next';

import { MenuBuilderPage } from '@/features/menu/components/page/menu-builder-page';
import { companyMenuBuilderPageConfig } from '@/features/menu/config/menu-builder-page-config';

export const metadata: Metadata = {
  title: 'Menu Builder | Hospixo',
  description: 'Create and manage restaurant menus, category assignments, and menu trees.',
};

export default function CompanyMenuFieldsPage() {
  return <MenuBuilderPage pageConfig={companyMenuBuilderPageConfig} />;
}
