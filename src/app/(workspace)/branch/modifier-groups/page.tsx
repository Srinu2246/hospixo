import type { Metadata } from 'next';
import { ModifierGroupsPage } from '@/features/modifier-groups';
import { branchModifierGroupsPageConfig } from '@/features/modifier-groups/config/modifier-groups-page-config';

export const metadata: Metadata = {
  title: 'Modifier Groups | Hospixo',
  description: 'Manage modifier groups for this branch.',
};

export default function BranchModifierGroupsPage() {
  return <ModifierGroupsPage pageConfig={branchModifierGroupsPageConfig} />;
}
