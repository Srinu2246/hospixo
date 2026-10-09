import type { Metadata } from 'next';

import { OnlineOrdersPage } from '@/features/pos/screens/online-orders/online-orders-page';

export const metadata: Metadata = { title: 'Branch | Online Orders' };

export default function BranchOnlineOrdersPage() {
  return <OnlineOrdersPage />;
}
