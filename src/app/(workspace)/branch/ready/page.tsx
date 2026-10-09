import type { Metadata } from 'next';

import { ReadyListPage } from '@/features/pos/screens/ready-list/ready-list-page';

export const metadata: Metadata = { title: 'Branch | Ready Orders' };

export default function BranchReadyOrdersPage() {
  return <ReadyListPage />;
}
