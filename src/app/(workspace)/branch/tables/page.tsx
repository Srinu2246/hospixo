import type { Metadata } from 'next';

import { BranchTablesScreen } from '@/features/pos';

export const metadata: Metadata = { title: 'Branch Tables' };

export default function BranchTablesPage() {
  return <BranchTablesScreen />;
}
