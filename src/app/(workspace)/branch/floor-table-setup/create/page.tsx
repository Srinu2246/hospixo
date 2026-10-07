import type { Metadata } from 'next';

import { FloorCreateScreen } from '@/features/floor-table-setup';

export const metadata: Metadata = { title: 'Create Floor' };

export default function FloorCreatePage() {
  return <FloorCreateScreen />;
}
