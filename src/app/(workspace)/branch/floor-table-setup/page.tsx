import type { Metadata } from 'next';

import { FloorTableSetupScreen } from '@/features/floor-table-setup';

export const metadata: Metadata = { title: 'Floor & Table Set-up' };

export default function FloorTableSetupPage() {
  return <FloorTableSetupScreen />;
}
