import { resolveGstSlabRates } from '@/lib/helpers/gstRatesHelpers';
import {
  createGstRateBodySchema,
  gstRateListSchema,
  type CreateGstRateBody,
  type GstRate,
} from '@/lib/schemas/menu/gstRatesSchema';
import { restaurantGstRatePath, restaurantGstRatesPath } from '@/services/api/ApiUrlsV1';
import type { HttpMethod, QueryParams } from '@/services/api/types';

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

/** Seed rows for mock mode only; validated against gstRateSchema (not used in production UI). */
export const MOCK_GST_RATES: GstRate[] = gstRateListSchema.parse([
  {
    id: 1,
    organization_id: 0,
    company_id: 0,
    code: 'GST_2',
    name: 'Main course',
    cgst_rate: 2.5,
    sgst_rate: 2.5,
    igst_rate: 5,
    total_rate: 10,
    effective_from: '2026-10-12T00:00:00.000Z',
    effective_to: null,
    is_active: true,
    created_at: '2026-10-12T10:00:00.000Z',
    updated_at: '2026-10-12T10:00:00.000Z',
  },
  {
    id: 2,
    organization_id: 0,
    company_id: 0,
    code: 'ITM',
    name: 'starters',
    cgst_rate: 1.5,
    sgst_rate: 1.5,
    igst_rate: 2,
    total_rate: 5,
    effective_from: '2026-10-08T00:00:00.000Z',
    effective_to: null,
    is_active: true,
    created_at: '2026-10-08T10:00:00.000Z',
    updated_at: '2026-10-08T10:00:00.000Z',
  },
]);

/** Mutable session copy used by mock GET/POST for GST rates. */
let gstRates: GstRate[] = [...MOCK_GST_RATES];
let nextId = Math.max(...gstRates.map((rate) => rate.id), 0) + 1;

function ok<T>(data: T, message = 'OK') {
  return {
    success: true as const,
    data,
    message,
    request_id: 'mock-gst-rates',
  };
}

function filterRates(params?: QueryParams): GstRate[] {
  const code = typeof params?.code === 'string' ? params.code.trim().toLowerCase() : '';
  const activeOnly =
    params?.active_only === true ||
    params?.active_only === 'true' ||
    params?.active_only === 1 ||
    params?.active_only === '1';

  return gstRates.filter((rate) => {
    if (activeOnly && !rate.is_active) return false;
    if (!code) return true;
    return rate.code.toLowerCase().includes(code) || rate.name.toLowerCase().includes(code);
  });
}

function createRate(body: CreateGstRateBody): GstRate {
  const now = new Date().toISOString();
  const rates = resolveGstSlabRates(body.cgst_rate, body.sgst_rate, body.igst_rate);
  const rate: GstRate = {
    id: nextId++,
    organization_id: 0,
    company_id: 0,
    code: body.code,
    name: body.name,
    cgst_rate: rates.cgst_rate,
    sgst_rate: rates.sgst_rate,
    igst_rate: rates.igst_rate,
    total_rate: rates.total_rate,
    effective_from: body.effective_from ?? now,
    effective_to: body.effective_to || null,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
  gstRates = [rate, ...gstRates];
  return rate;
}

/**
 * Mock resolver for /v1/restaurant/gst-rates and /v1/restaurant/gst-rates/{id}.
 */
export function resolveGstRatesMock(request: MockRequest): unknown | undefined {
  const listPath = restaurantGstRatesPath();

  if (request.path === listPath) {
    if (request.method === 'GET') {
      const items = filterRates(request.params);
      const page = Number(request.params?.page ?? 1) || 1;
      const pageSize = Number(request.params?.page_size ?? 15) || 15;
      const start = (page - 1) * pageSize;
      return ok({
        items: items.slice(start, start + pageSize),
        total: items.length,
        page,
        page_size: pageSize,
      });
    }

    if (request.method === 'POST') {
      const parsed = createGstRateBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return {
          success: false,
          data: null,
          message: parsed.error.issues[0]?.message ?? 'Invalid GST rate',
          request_id: 'mock-gst-rates',
        };
      }
      return ok(createRate(parsed.data), 'GST rate created');
    }

    return undefined;
  }

  if (!request.path.startsWith(`${listPath}/`)) return undefined;

  const idSegment = request.path.slice(listPath.length + 1).split('/')[0];
  const id = Number(idSegment);
  if (!Number.isFinite(id)) return undefined;

  if (request.path !== restaurantGstRatePath(id)) return undefined;

  if (request.method === 'GET') {
    const rate = gstRates.find((item) => item.id === id);
    if (!rate) {
      return {
        success: false,
        data: null,
        message: 'GST rate not found',
        request_id: 'mock-gst-rates',
      };
    }
    return ok(rate, 'GST rate retrieved');
  }

  return undefined;
}
