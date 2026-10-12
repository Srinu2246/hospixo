'use client';

import { PosTableSelection } from '@/features/pos/point-of-sale/tables/PosTableSelection';

/**
 * DineInPage Component
 *
 * Full-screen POS Dine-In Management screen:
 * 1. Shows the PosTableSelection floor plan with isDineIn={true}.
 * 2. Clicking any table immediately transitions into the complete Takeaway/Dine-In
 *    menu catalog & checkout flow with that table's active metadata.
 * 3. Supports instant "Back to Tables" floor plan navigation and bill settlement.
 */
export interface DineInPageProps {
  initialTableId?: string;
}

export function DineInPage({ initialTableId }: Readonly<DineInPageProps> = {}) {
  return <PosTableSelection isDineIn initialTableId={initialTableId} />;
}

export default DineInPage;
