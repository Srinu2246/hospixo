import type { Metadata } from 'next';

import { DineInPage } from '@/features/pos/screens/dine-in/dine-in-page';

export const metadata: Metadata = {
  title: 'Dine-In | POS',
};

export default function PosDineInRoutePage() {
  return <DineInPage />;
}
