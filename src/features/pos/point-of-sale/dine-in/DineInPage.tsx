'use client';

import { PosTableSelection } from '@/features/pos/point-of-sale/tables/PosTableSelection';

/**
 * DineInPage Component
 *
 * POS Dine-In screen:
 * 1. Lists only reserved / occupied / billing tables (not the full floor plan).
 * 2. Empty state links to Tables when nothing is active.
 * 3. Selecting a table opens the dine-in menu & checkout for that table.
 */
export interface DineInPageProps {
  initialTableId?: string;
}

export function DineInPage({ initialTableId }: Readonly<DineInPageProps> = {}) {
  return <PosTableSelection isDineIn initialTableId={initialTableId} />;
}
