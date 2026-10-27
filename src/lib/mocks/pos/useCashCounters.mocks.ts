import {
  cashCounterSchema,
  createCashCounterBodySchema,
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

const COUNTER_TEMPLATES: ReadonlyArray<Omit<CashCounter, 'id' | 'branch_id'>> = [
  {
    name: 'Counter Terminal',
    code: 'POS-01',
    branch_name: 'Hyderabad',
    counter_type: 'billing',
    pos_device: 'POS-01 (Counter Terminal)',
    status: 'active',
    open_shift_id: null,
    payments: { cash: true, card: true, upi: true, wallet: false, gift_card: false },
  },
  {
    name: 'Takeaway Counter',
    code: 'HYD-02',
    branch_name: 'Hyderabad',
    counter_type: 'takeaway',
    pos_device: 'POS-02 (Takeaway)',
    status: 'active',
    open_shift_id: null,
    payments: { cash: true, card: true, upi: true, wallet: false, gift_card: false },
  },
  {
    name: 'Lobby Counter',
    code: 'HYD-03',
    branch_name: 'Hyderabad',
    counter_type: 'delivery',
    pos_device: 'POS-03 (Lobby)',
    status: 'inactive',
    open_shift_id: null,
    payments: { cash: true, card: false, upi: true, wallet: false, gift_card: false },
  },
  {
    name: 'Restaurant Counter',
    code: 'BLR-01',
    branch_name: 'Hyderabad',
    counter_type: 'billing',
    pos_device: 'POS-04 (Restaurant)',
    status: 'active',
    open_shift_id: null,
    payments: { cash: true, card: true, upi: false, wallet: false, gift_card: false },
  },
];

let counters: CashCounter[] = [];
let nextId = 1;

function rowsForBranch(branchId: number): CashCounter[] {
  const existing = counters.filter((row) => row.branch_id === branchId);
  if (existing.length > 0) return existing;

  const seeded = COUNTER_TEMPLATES.map((template) =>
    cashCounterSchema.parse({
      ...template,
      id: nextId++,
      branch_id: branchId,
      payments: { ...template.payments },
    }),
  );
  counters = [...seeded, ...counters];
  return seeded;
}

/**
 * Mock resolver for GET/POST /v1/branches/{branch_id}/cash-registers
 * and GET/PATCH /v1/branches/{branch_id}/cash-registers/{register_id}.
 */
export function resolveCashRegistersMock(request: MockRequest): unknown | undefined {
  const match = CASH_REGISTERS_PATH.exec(request.path);
  if (!match?.[1]) return undefined;

  const branchId = Number(match[1]);
  const registerId = match[2] ? Number(match[2]) : undefined;
  const branchRows = rowsForBranch(branchId);

  if (registerId == null) {
    if (request.path !== branchCashRegistersPath(branchId)) return undefined;

    if (request.method === 'GET') {
      return ok(branchRows, 'OK');
    }

    if (request.method === 'POST') {
      const parsed = createCashCounterBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? 'Invalid cash register');
      }
      const created = cashCounterSchema.parse({
        id: nextId++,
        branch_id: branchId,
        open_shift_id: null,
        ...parsed.data,
        pos_device: parsed.data.pos_device || `${parsed.data.code} (${parsed.data.name})`,
      });
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
    const parsed = createCashCounterBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? 'Invalid cash register update');
    }
    const updated = cashCounterSchema.parse({
      ...current,
      ...parsed.data,
      pos_device: parsed.data.pos_device || `${parsed.data.code} (${parsed.data.name})`,
    });
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
