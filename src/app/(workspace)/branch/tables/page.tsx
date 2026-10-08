import type { Metadata } from 'next';

import { TablesPage } from '@/features/pos/screens/tables/tables-page';

export const metadata: Metadata = { title: 'Branch | Tables' };

export default function BranchTablesPage() {
  return <TablesPage />;
}
