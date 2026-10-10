import type { Metadata } from 'next';
import { MenuCreationPage, branchMenuPageConfig } from '@/features/menu';

export const metadata: Metadata = {
  title: 'Menu Creation | Hospixo',
  description: 'Manage branch menu categories and items inherited from the company catalog.',
};

export default function BranchMenuCreationPage() {
  return <MenuCreationPage pageConfig={branchMenuPageConfig} />;
}
