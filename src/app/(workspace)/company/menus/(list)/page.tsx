import type { Metadata } from 'next';
import { MenusListPage } from '@/features/menus';

export const metadata: Metadata = {
  title: 'Menus | Hospixo',
  description: 'Define meal sessions and assign menu items by time of day.',
};

export default function CompanyMenusPage() {
  return <MenusListPage />;
}
