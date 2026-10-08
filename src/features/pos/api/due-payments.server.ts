import 'server-only';

import { mapDuePaymentRecord } from '@/features/pos/lib/map-restaurant-pos-records';
import type { DuePayment } from '@/features/pos/config/due-payments';
import { listBranchDuePayments } from '@/lib/api/restaurant-branch-pos';
import { resolveFloorRequestContext, type FloorRequestOptions } from '@/lib/floors-server';

export type DuePaymentsPayload = Readonly<{
  payments: DuePayment[];
  branchId: number | null;
  loadError: string | null;
}>;

export async function loadDuePaymentsData(
  options: FloorRequestOptions = {},
): Promise<DuePaymentsPayload> {
  const ctx = await resolveFloorRequestContext(options);
  if (!ctx.token) {
    return { payments: [], branchId: ctx.branchId, loadError: 'Sign in required.' };
  }
  if (ctx.branchId == null) {
    return { payments: [], branchId: null, loadError: ctx.error };
  }

  try {
    const records = await listBranchDuePayments(ctx.token, ctx.branchId);
    const payments = records
      .map(mapDuePaymentRecord)
      .filter((payment): payment is DuePayment => payment != null);
    return { payments, branchId: ctx.branchId, loadError: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to load due payments.';
    return { payments: [], branchId: ctx.branchId, loadError: message };
  }
}
