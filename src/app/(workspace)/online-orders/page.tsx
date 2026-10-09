import type { Metadata } from 'next';

import { OnlineOrdersPage } from '@/features/pos/screens/online-orders/online-orders-page';

export const metadata: Metadata = { title: 'Online Orders | POS' };

export default function PosOnlineOrdersRoutePage() {
  return <OnlineOrdersPage />;
}
