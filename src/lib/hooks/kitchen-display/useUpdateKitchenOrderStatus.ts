'use client';

import { useMutation } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import {
  buildKitchenStatusRequestBody,
  kitchenStatusNextVersion,
  parseKitchenStatusResponse,
  type KitchenStatusAction,
} from '@/lib/schemas/kitchen-display/kitchenStatusSchema';
import {
  readBranchOrderVersion,
  rememberBranchOrderVersion,
} from '@/lib/hooks/pos/point-of-sale/order-events/branchOrderEventsConnection';
import { api } from '@/services/api/browserClient';
import { branchKitchenStatusPath } from '@/services/api/ApiUrlsV1';
import { ApiError } from '@/services/api/types';

export type UpdateKitchenOrderStatusInput = {
  branchId: number;
  orderId: string;
  expectedVersion: number;
  action: KitchenStatusAction;
  /** Board `order_item_id`. Omit when the card-level button updates the whole order. */
  itemId?: number;
  preparationStationId?: number;
  boardQueryPath: string;
  boardQueryParams?: Record<string, string | number | boolean | null | undefined>;
};

async function patchKitchenStatus(
  path: string,
  input: UpdateKitchenOrderStatusInput,
  expectedVersion: number,
) {
  const body = buildKitchenStatusRequestBody({
    expectedVersion,
    action: input.action,
    itemId: input.itemId,
    preparationStationId: input.preparationStationId,
  });
  const payload = await api.patch<unknown>(path, body, { silent: true });
  const response = parseKitchenStatusResponse(payload);
  const reported = kitchenStatusNextVersion(response) ?? 0;
  return { response, nextVersion: Math.max(reported, expectedVersion + 1) };
}

export function useUpdateKitchenOrderStatus() {
  return useMutation({
    mutationFn: async (input: UpdateKitchenOrderStatusInput) => {
      const numericOrderId = input.orderId.replace(/^ord-/, '');
      const orderIdNumber = Number(numericOrderId);
      const cachedVersion =
        Number.isInteger(orderIdNumber) && orderIdNumber > 0
          ? (readBranchOrderVersion(input.branchId, orderIdNumber) ?? 0)
          : 0;
      const fromInput = input.expectedVersion >= 1 ? input.expectedVersion : 0;
      const knownVersion = Math.max(fromInput, cachedVersion);
      const expectedVersion = knownVersion >= 1 ? knownVersion : 1;
      const path = branchKitchenStatusPath(input.branchId, numericOrderId);

      try {
        const result = await patchKitchenStatus(path, input, expectedVersion);
        if (Number.isInteger(orderIdNumber)) {
          rememberBranchOrderVersion(input.branchId, orderIdNumber, result.nextVersion);
        }
        return result;
      } catch (error) {
        const serverVersion = kitchenConflictExpectedVersion(error);
        if (serverVersion == null || serverVersion === expectedVersion) throw error;
        if (Number.isInteger(orderIdNumber)) {
          rememberBranchOrderVersion(input.branchId, orderIdNumber, serverVersion);
        }
        const result = await patchKitchenStatus(path, input, serverVersion);
        if (Number.isInteger(orderIdNumber)) {
          rememberBranchOrderVersion(input.branchId, orderIdNumber, result.nextVersion);
        }
        return result;
      }
    },
    /** Board refresh is driven by the branch order-events stream (see KDS algorithm). */
  });
}

export function isKitchenOrderVersionConflict(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) return false;
  if (error.code === 'ORDER_VERSION_CONFLICT') return true;
  if (kitchenConflictExpectedVersion(error) != null) return true;
  const message = error.message.toLowerCase();
  return message.includes('order_version') || message.includes('expected_version');
}

/** Version the server says the client should send, from `{ detail: { expected_version } }`. */
export function kitchenConflictExpectedVersion(error: unknown): number | undefined {
  if (!(error instanceof ApiError) || !error.details || typeof error.details !== 'object') {
    return undefined;
  }
  const record = error.details as Record<string, unknown>;
  const detail =
    record.detail && typeof record.detail === 'object' && !Array.isArray(record.detail)
      ? (record.detail as Record<string, unknown>)
      : record;
  const code = typeof detail.code === 'string' ? detail.code : error.code;
  if (code !== 'ORDER_VERSION_CONFLICT') return undefined;
  const raw = detail.expected_version;
  const version = typeof raw === 'number' ? raw : Number(raw);
  return Number.isInteger(version) && version >= 1 ? version : undefined;
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
    if (error.code === 'ORDER_ITEM_NOT_FOUND') {
      return 'That order line was not found. Refresh the board and try again.';
    }
    if (error.code === 'KITCHEN_PREPARATION_STATION_MISMATCH') {
      return 'This item is not routed to the selected preparation station.';
    }
    if (error.code === 'KITCHEN_STATUS_ACTION_FORBIDDEN') {
      return 'You do not have permission for this kitchen action.';
    }
  }
  return getErrorMessage(error);
}
