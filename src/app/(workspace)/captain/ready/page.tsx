import type { Metadata } from 'next';

import { CaptainReadyListPage } from '@/features/pos/captain-flow';

export const metadata: Metadata = { title: 'Ready Orders | Captain' };

export default function CaptainReadyOrdersRoutePage() {
  return <CaptainReadyListPage />;
}
