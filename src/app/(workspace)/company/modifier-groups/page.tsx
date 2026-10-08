import type { Metadata } from 'next';
import { ModifierGroupsPage } from '@/features/modifier-groups';
import { companyModifierGroupsPageConfig } from '@/features/modifier-groups';

export const metadata: Metadata = {
  title: 'Modifier Groups | Hospixo',
  description: 'Configure modifier groups and options for customizable dishes.',
};

export default function CompanyModifierGroupsPage() {
  return <ModifierGroupsPage pageConfig={companyModifierGroupsPageConfig} />;
}
