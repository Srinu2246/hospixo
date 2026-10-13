import { z } from 'zod';

export const branchListItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1),
  companyId: z.union([z.string(), z.number()]),
  code: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive']),
});

export const branchListSchema = z.array(branchListItemSchema);

export type BranchListItem = z.infer<typeof branchListItemSchema>;

/** Turn a branches API payload into the list the dashboards render. */
export function parseBranchList(
  payload: unknown,
  fallbackCompanyId?: number | string,
): BranchListItem[] {
  return unwrapBranches(payload).flatMap((item) => {
    const parsed = branchListItemSchema.safeParse(mapBranch(item, fallbackCompanyId));
    return parsed.success ? [parsed.data] : [];
  });
}

function unwrapBranches(payload: unknown): Record<string, unknown>[] {
  const unwrapped = unwrapEnvelope(payload);
  if (Array.isArray(unwrapped)) return unwrapped.filter(isRecord);
  if (!isRecord(unwrapped)) return [];

  for (const key of ['items', 'branches', 'results', 'result', 'rows', 'data'] as const) {
    const value = unwrapped[key];
    if (Array.isArray(value)) return value.filter(isRecord);
    if (isRecord(value)) {
      const nested = unwrapBranches(value);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

function unwrapEnvelope(payload: unknown): unknown {
  if (isRecord(payload) && payload.success === true && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

function mapBranch(raw: Record<string, unknown>, fallbackCompanyId?: number | string): unknown {
  const statusRaw = String(raw.status ?? 'active')
    .toLowerCase()
    .trim();
  const id = raw.id ?? raw.branch_id ?? raw.branchId;
  const companyId = raw.company_id ?? raw.companyId ?? fallbackCompanyId ?? 0;

  return {
    id: typeof id === 'number' || typeof id === 'string' ? id : String(id ?? ''),
    name: text(raw.name) ?? text(raw.branch_name) ?? text(raw.outlet_name) ?? 'Branch',
    companyId:
      typeof companyId === 'number' || typeof companyId === 'string'
        ? companyId
        : String(companyId),
    code: text(raw.code) ?? text(raw.branch_code) ?? null,
    city: text(raw.city) ?? null,
    status: statusRaw === 'inactive' || statusRaw === 'disabled' ? 'inactive' : 'active',
  };
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
