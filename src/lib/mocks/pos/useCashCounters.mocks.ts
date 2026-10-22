import {
  cashCounterListEnvelopeSchema,
  createCashCounterBodySchema,
  updateCashCounterBodySchema,
  type CashCounter,
} from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { branchCashRegisterPath, branchCashRegistersPath } from '@/services/api/ApiUrlsV1';
import type { HttpMethod, QueryParams } from '@/services/api/types';

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

const CASH_REGISTERS_PATH = /^\/v1\/branches\/(\d+)\/cash-registers(?:\/(\d+))?$/;

/** Seed matches live envelope fields; branch_id 49 aligns with mock login session. */
const SEED_COUNTERS: CashCounter[] = [
  {
    id: 3,
    branch_id: 49,
    name: 'test',
    status: 'active',
    open_shift_id: null,
  },
  {
    id: 5,
    branch_id: 49,
    name: 'test111',
    status: 'active',
    open_shift_id: null,
  },
];

let counters: CashCounter[] = cashCounterListEnvelopeSchema.parse({
  success: true,
  data: SEED_COUNTERS,
  message: 'OK',
  request_id: '908cd2c6-294d-4b06-a8dc-cd909c01ad4e',
}).data;

let nextId = 100;

/**
 * Mock resolver for GET/POST /v1/branches/{branch_id}/cash-registers
 * and GET/PATCH /v1/branches/{branch_id}/cash-registers/{register_id}.
 */
export function resolveCashRegistersMock(request: MockRequest): unknown | undefined {
  const match = CASH_REGISTERS_PATH.exec(request.path);
  if (!match?.[1]) return undefined;

  const branchId = Number(match[1]);
  const registerId = match[2] ? Number(match[2]) : undefined;

  if (registerId == null) {
    if (request.path !== branchCashRegistersPath(branchId)) return undefined;

    if (request.method === 'GET') {
      return ok(
        counters.filter((row) => row.branch_id === branchId),
        'OK',
      );
    }

    if (request.method === 'POST') {
      const parsed = createCashCounterBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? 'Invalid cash register');
      }
      const created: CashCounter = {
        id: nextId++,
        branch_id: branchId,
        name: parsed.data.name,
        status: 'active',
        open_shift_id: null,
      };
      counters = [created, ...counters];
      return ok(created, 'Cash register created');
    }

    return undefined;
  }

  if (request.path !== branchCashRegisterPath(branchId, registerId)) return undefined;

  const current = counters.find((row) => row.id === registerId && row.branch_id === branchId);
  if (!current) {
    return fail('Cash register not found');
  }

  if (request.method === 'GET') {
    return ok(current, 'OK');
  }

  if (request.method === 'PATCH') {
    const parsed = updateCashCounterBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? 'Invalid cash register update');
    }
    const updated: CashCounter = {
      ...current,
      name: parsed.data.name,
      status: parsed.data.status,
    };
    counters = counters.map((row) => (row.id === updated.id ? updated : row));
    return ok(updated, 'Cash register updated');
  }

  return undefined;
}

function ok<T>(data: T, message: string) {
  return {
    success: true as const,
    data,
    message,
    request_id: 'mock-cash-registers',
  };
}

function fail(message: string) {
  return {
    success: false as const,
    data: null,
    message,
    request_id: 'mock-cash-registers',
  };
}
