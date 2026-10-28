'use client';

import { useMutation } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import {
  buildKitchenStatusRequestBody,
  kitchenStatusNextVersion,
  parseKitchenStatusResponse,
  type KitchenStatusAction,
} from '@/lib/schemas/kitchen-display/kitchenStatusSchema';
import { parseBranchOrderDetail } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderDetailSchema';
import { api } from '@/services/api/browserClient';
import { branchKitchenStatusPath, branchOrderDetailPath } from '@/services/api/ApiUrlsV1';
import { ApiError } from '@/services/api/types';

async function resolveExpectedOrderVersion(
  branchId: number,
  orderId: string,
  fromBoard: number,
): Promise<number> {
  if (fromBoard >= 1) return fromBoard;

  const detailPayload = await api.get<unknown>(branchOrderDetailPath(branchId, orderId));
  const detail = parseBranchOrderDetail(detailPayload);
  if (detail.version != null && detail.version >= 1) {
    return detail.version;
  }

  throw new ApiError(
    'Order version is missing. Refresh the kitchen board and try again.',
    409,
    'ORDER_VERSION_MISSING',
  );
}

export type UpdateKitchenOrderStatusInput = {
  branchId: number;
  orderId: string;
  expectedVersion: number;
  action: KitchenStatusAction;
  preparationStationId?: number;
  boardQueryPath: string;
  boardQueryParams?: Record<string, string | number | boolean | null | undefined>;
};

export function useUpdateKitchenOrderStatus() {
  return useMutation({
    mutationFn: async (input: UpdateKitchenOrderStatusInput) => {
      const numericOrderId = input.orderId.replace(/^ord-/, '');
      const expectedVersion = await resolveExpectedOrderVersion(
        input.branchId,
        numericOrderId,
        input.expectedVersion,
      );
      const path = branchKitchenStatusPath(input.branchId, numericOrderId);
      const body = buildKitchenStatusRequestBody({
        expectedVersion,
        action: input.action,
        preparationStationId: input.preparationStationId,
      });

      const payload = await api.patch<unknown>(path, body, { silent: true });
      const response = parseKitchenStatusResponse(payload);
      return { response, nextVersion: kitchenStatusNextVersion(response) };
    },
    /** Board refresh is driven by the branch order-events stream (see KDS algorithm). */
  });
}

export function isKitchenOrderVersionConflict(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) return false;
  if (error.code === 'ORDER_VERSION_CONFLICT') return true;
  const message = error.message.toLowerCase();
  return message.includes('order_version') || message.includes('expected_version');
}

export function kitchenStatusErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'KITCHEN_NOTHING_TO_UPDATE') {
      return 'No kitchen lines match this action for the selected station.';
    }
    if (error.code === 'KITCHEN_STATUS_NOT_ALLOWED') {
      return 'That kitchen step is not allowed for this order right now.';
    }
    if (error.code === 'PREPARATION_STATION_NOT_FOUND') {
      return 'Preparation station not found. Refresh and try again.';
    }
    if (error.code === 'ORDER_NOT_FOUND') {
      return 'Order not found. The board may be out of date — refresh and try again.';
    }
  }
  return getErrorMessage(error);
}
