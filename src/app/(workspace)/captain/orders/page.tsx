import type { Metadata } from 'next';

import { CaptainAllOrdersPage } from '@/features/pos/captain-flow';

export const metadata: Metadata = { title: 'All Orders | Captain' };

export default function CaptainAllOrdersRoutePage() {
  return <CaptainAllOrdersPage />;
}
