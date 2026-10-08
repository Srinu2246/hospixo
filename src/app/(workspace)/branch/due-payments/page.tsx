import type { Metadata } from 'next';

import { DuePaymentsPage } from '@/features/pos/screens/due-payments/due-payments-page';

export const metadata: Metadata = { title: 'Branch | Due Payments' };

export default function BranchDuePaymentsPage() {
  return <DuePaymentsPage />;
}
