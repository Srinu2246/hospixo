import type { Metadata } from 'next';
import { SessionDetailPage } from '@/features/menus';

export const metadata: Metadata = {
  title: 'Menu Session | Hospixo',
  description: 'View menu session details and assigned items.',
};

export default function BranchMenuSessionDetailPage() {
  return <SessionDetailPage />;
}
