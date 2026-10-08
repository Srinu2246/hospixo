import type { Metadata } from 'next';

import { DineInPage } from '@/features/pos/screens/dine-in/dine-in-page';

export const metadata: Metadata = { title: 'Branch | Dine-In' };

export default function BranchDineInPage() {
  return <DineInPage />;
}
