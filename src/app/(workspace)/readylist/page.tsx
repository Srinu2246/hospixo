import type { Metadata } from 'next';

import { ReadyListPage } from '@/features/pos/screens/ready-list/ready-list-page';

export const metadata: Metadata = { title: 'Ready Orders | POS' };

export default function PosReadyListRoutePage() {
  return <ReadyListPage />;
}
