import type { Metadata } from 'next';

import { TablesPage } from '@/features/pos/screens/tables/tables-page';

export const metadata: Metadata = {
  title: 'Tables | POS',
};

export default function PosTablesRoutePage() {
  return <TablesPage />;
}
