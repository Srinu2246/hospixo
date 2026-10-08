import type { Metadata } from 'next';

import { BranchMenuAssignmentPage } from '@/features/menu/components/page/branch-menu-assignment-page';

export const metadata: Metadata = {
  title: 'Menu Management | Hospixo',
  description: 'Assign dine-in menus to each outlet and sync branch catalogs.',
};

export default function CompanyMenuManagementPage() {
  return <BranchMenuAssignmentPage />;
}
