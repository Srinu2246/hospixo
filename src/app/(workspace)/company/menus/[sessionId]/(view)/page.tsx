import type { Metadata } from 'next';
import { SessionDetailPage } from '@/features/menus';

export const metadata: Metadata = {
  title: 'Menu session | Hospixo',
  description: 'Assigned menu items for this meal session.',
};

export default function CompanyMenuSessionPage() {
  return <SessionDetailPage />;
}
