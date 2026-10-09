import type { Metadata } from 'next';

import { OpenOrdersPage } from '@/features/pos/screens/open-orders/open-orders-page';

export const metadata: Metadata = { title: 'All Orders | POS' };

export default function PosOpenOrdersRoutePage() {
  return <OpenOrdersPage />;
}
