import type { Metadata } from 'next';

import { CashShiftConnectedScreen } from '@/features/pos/cash-shift/components/cash-shift-connected-screen';
import { loadPosCashShiftData } from '@/features/pos/api/cash-shift.server';

export const metadata: Metadata = { title: 'Branch | Cash & Shift' };

export default async function BranchCashShiftPage() {
  const initialData = await loadPosCashShiftData();
  return <CashShiftConnectedScreen initialData={initialData} />;
}
