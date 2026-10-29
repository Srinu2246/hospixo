'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import type { ReceiptData } from '@/features/pos/point-of-sale/components/OrderSuccessReceipt';
import {
  mapBranchOrderBillToReceiptData,
  mapBranchOrderReceiptToReceiptData,
} from '@/lib/helpers/branchOrderSettleHelpers';
import { syncAfterWrite } from '@/lib/hooks/api/queryCacheSync';
import { useStrictActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import { branchOrderQueryKey } from '@/lib/hooks/pos/point-of-sale/all-orders/useBranchOrder';
import {
  buildPosRazorpayOrderCreateBody,
  resolvePosRazorpayChargePaise,
} from '@/lib/helpers/posRazorpayPaymentAmount';
import {
  branchOrderRazorpayConfirmBodySchema,
  parseBranchOrderBill,
  parseBranchOrderRazorpayConfirm,
  parseBranchOrderRazorpayOrder,
  parseBranchOrderReceipt,
  type BranchOrderRazorpayConfirmBody,
} from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderSettleSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

function requireOrderId(orderId: string | number | null | undefined): string | number {
  if (orderId == null || String(orderId).trim() === '' || String(orderId) === 'undefined') {
    throw new Error('Order id is required');
  }
  return orderId;
}

function requireBranchId(branchId: number | undefined): number {
  if (typeof branchId !== 'number') {
    throw new Error('Branch id is required');
  }
  return branchId;
}

const branchOrderPaidReceiptDisplayQueryKey = (
  branchId: number | undefined,
  orderId: string | number | null | undefined,
  billFallback: boolean,
) =>
  [
    'pos',
    'point-of-sale',
    'all-orders',
    'settle',
    'paid-receipt-display',
    branchId,
    orderId,
    billFallback,
  ] as const;

/** GET /v1/branches/{branch_id}/orders/{order_id}/bill */
export async function fetchBranchOrderBill(
  branchId: number,
  orderId: string | number,
  signal?: AbortSignal,
) {
  const payload = await api.get(
    ApiUrlsV1.pos.pointOfSale.allOrders.bill(branchId, orderId),
    undefined,
    signal,
  );
  return parseBranchOrderBill(payload);
}

/** GET /v1/branches/{branch_id}/orders/{order_id}/receipt */
export async function fetchBranchOrderReceipt(
  branchId: number,
  orderId: string | number,
  signal?: AbortSignal,
) {
  const payload = await api.get(
    ApiUrlsV1.pos.pointOfSale.allOrders.receipt(branchId, orderId),
    undefined,
    signal,
  );
  return parseBranchOrderReceipt(payload);
}

export type CheckoutBillReceiptFetchResult = {
  bill: Awaited<ReturnType<typeof fetchBranchOrderBill>> | null;
  receipt: Awaited<ReturnType<typeof fetchBranchOrderReceipt>> | null;
  billError: unknown;
  receiptError: unknown;
};

/** On demand (Get Bill): parallel GET bill + GET receipt. */
export async function fetchCheckoutBillAndReceipt(
  branchId: number,
  orderId: string | number,
): Promise<CheckoutBillReceiptFetchResult> {
  const [billResult, receiptResult] = await Promise.allSettled([
    fetchBranchOrderBill(branchId, orderId),
    fetchBranchOrderReceipt(branchId, orderId),
  ]);

  return {
    bill: billResult.status === 'fulfilled' ? billResult.value : null,
    receipt: receiptResult.status === 'fulfilled' ? receiptResult.value : null,
    billError: billResult.status === 'rejected' ? billResult.reason : null,
    receiptError: receiptResult.status === 'rejected' ? receiptResult.reason : null,
  };
}

export async function fetchPaidOrderReceiptDisplay(
  branchId: number,
  orderId: string | number,
  paymentMethodFallback?: string,
  billFallback = true,
): Promise<ReceiptData> {
  try {
    const paidReceipt = await fetchBranchOrderReceipt(branchId, orderId);
    return mapBranchOrderReceiptToReceiptData(paidReceipt, paymentMethodFallback);
  } catch (receiptError) {
    if (!billFallback) throw receiptError;
    const bill = await fetchBranchOrderBill(branchId, orderId);
    return mapBranchOrderBillToReceiptData(bill, paymentMethodFallback);
  }
}

export function usePaidOrderReceiptDisplay(
  orderId: string | number | null | undefined,
  options: Readonly<{
    enabled: boolean;
    billFallback?: boolean;
    paymentMethodFallback?: string;
    branchId?: number;
  }>,
) {
  const activeBranchId = useStrictActiveBranchId(options.branchId);
  const billFallback = options.billFallback ?? true;
  const hasOrderId =
    orderId != null && String(orderId).trim() !== '' && String(orderId) !== 'undefined';
  const enabled = options.enabled && typeof activeBranchId === 'number' && hasOrderId;

  return useQuery({
    queryKey: branchOrderPaidReceiptDisplayQueryKey(activeBranchId, orderId, billFallback),
    enabled,
    staleTime: 60_000,
    retry: false,
    queryFn: () =>
      fetchPaidOrderReceiptDisplay(
        activeBranchId as number,
        orderId as string | number,
        options.paymentMethodFallback,
        billFallback,
      ),
  });
}

export type CreateBranchOrderRazorpayOrderInput = {
  orderId: string | number;
  branchId?: number;
};

/** POST /v1/branches/{branch_id}/orders/{order_id}/pay/razorpay/order */
export function useCreateBranchOrderRazorpayOrder(defaultBranchId?: number) {
  const strictBranchId = useStrictActiveBranchId(defaultBranchId);

  return useMutation({
    mutationFn: async (input: CreateBranchOrderRazorpayOrderInput) => {
      const orderId = requireOrderId(input.orderId);
      const branchId = requireBranchId(input.branchId ?? strictBranchId);
      const createBody = buildPosRazorpayOrderCreateBody() ?? {};
      const payload = await api.post(
        ApiUrlsV1.pos.pointOfSale.allOrders.razorpayOrder(branchId, orderId),
        createBody,
        { silent: true },
      );
      const parsed = parseBranchOrderRazorpayOrder(payload);
      return {
        ...parsed,
        amount: resolvePosRazorpayChargePaise(parsed.amount),
      };
    },
  });
}

export type ConfirmBranchOrderRazorpayPaymentInput = {
  orderId: string | number;
  body: BranchOrderRazorpayConfirmBody;
  branchId?: number;
};

/** POST /v1/branches/{branch_id}/orders/{order_id}/pay/razorpay/confirm */
export function useConfirmBranchOrderRazorpayPayment(defaultBranchId?: number) {
  const strictBranchId = useStrictActiveBranchId(defaultBranchId);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: ConfirmBranchOrderRazorpayPaymentInput) => {
      const orderId = requireOrderId(input.orderId);
      const branchId = requireBranchId(input.branchId ?? strictBranchId);
      const body = branchOrderRazorpayConfirmBodySchema.parse(input.body);
      const payload = await api.post(
        ApiUrlsV1.pos.pointOfSale.allOrders.razorpayConfirm(branchId, orderId),
        body,
        { silent: true },
      );
      return parseBranchOrderRazorpayConfirm(payload);
    },
    onSuccess: async (_data, variables) => {
      const branchId = requireBranchId(variables.branchId ?? strictBranchId);
      await syncAfterWrite(queryClient, router, {
        queryKeys: [
          branchOrderQueryKey(branchId, variables.orderId),
          ['pos', 'point-of-sale', 'all-orders'],
          [
            'pos',
            'point-of-sale',
            'all-orders',
            'settle',
            'paid-receipt-display',
            branchId,
            variables.orderId,
          ],
        ],
      });
    },
  });
}
