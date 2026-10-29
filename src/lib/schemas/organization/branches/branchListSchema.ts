import { z } from 'zod';

/**
 * Branch list item — matches GET /v1/branches item shape:
 * { id, name, companyId, companyName, code, city, status, isDefault }
 */
export const branchListItemSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  companyId: z.number().int(),
  companyName: z.string().min(1),
  code: z.string().min(1),
  city: z.string().min(1),
  status: z.enum(['active', 'inactive']),
  isDefault: z.boolean(),
  userCount: z.number().int().nonnegative().default(0),
});

export const branchListSchema = z.array(branchListItemSchema);

export type BranchListItem = z.infer<typeof branchListItemSchema>;

export type BranchListParams = {
  company_id?: number;
  organization_id?: number;
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  page_size?: number;
};

export type PagedBranchListData = {
  items: BranchListItem[];
  total: number;
  page: number;
  page_size: number;
};

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

/** GET /v1/branches?company_id&search&status&page&page_size */
export function parsePagedBranchList(
  payload: unknown,
  fallbackCompanyId?: number | string,
): PagedBranchListData {
  const items = parseBranchList(payload, fallbackCompanyId);
  return {
    items,
    total: readPagedNumber(payload, ['total', 'total_count', 'totalCount', 'count'], items.length),
    page: readPagedNumber(payload, ['page'], 1),
    page_size: readPagedNumber(payload, ['page_size', 'pageSize'], items.length || 15),
  };
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

  // Single branch object
  if ('id' in unwrapped || 'branch_id' in unwrapped || 'branchId' in unwrapped) {
    return [unwrapped];
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
  const id = toInt(raw.id ?? raw.branch_id ?? raw.branchId);
  const companyId = toInt(raw.company_id ?? raw.companyId ?? fallbackCompanyId);

  const name = text(raw.name) ?? text(raw.branch_name) ?? text(raw.outlet_name) ?? 'Branch';
  const rawCompanyName = text(raw.companyName) ?? text(raw.company_name);
  const companyName =
    rawCompanyName && !isNumericEntityLabel(rawCompanyName)
      ? rawCompanyName
      : companyId != null
        ? `Company #${companyId}`
        : 'Company';
  const code = text(raw.code) ?? text(raw.branch_code) ?? (id != null ? String(id) : 'BR');
  const city = text(raw.city) ?? text(raw.location) ?? '—';

  return {
    id: id ?? 0,
    name,
    companyId: companyId ?? 0,
    companyName,
    code,
    city,
    status:
      statusRaw === 'inactive' || statusRaw === 'disabled' || statusRaw === 'closed'
        ? 'inactive'
        : 'active',
    isDefault: Boolean(raw.isDefault ?? raw.is_default),
    userCount: count(
      raw.userCount ??
        raw.user_count ??
        raw.users_count ??
        raw.usersCount ??
        raw.total_users ??
        raw.totalUsers ??
        raw.employees_count ??
        raw.employee_count ??
        raw.members_count ??
        raw.staff_count ??
        raw.users,
    ),
  };
}

function count(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function toInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return undefined;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isNumericEntityLabel(value: string): boolean {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readPagedNumber(payload: unknown, keys: readonly string[], fallback: number): number {
  let node: unknown = payload;
  for (let depth = 0; depth < 4; depth += 1) {
    node = unwrapEnvelope(node);
    if (!isRecord(node)) break;
    for (const key of keys) {
      const value = node[key];
      const parsed = typeof value === 'number' ? value : Number(value);
      if (Number.isFinite(parsed) && parsed >= 0) return Math.trunc(parsed);
    }
    if (isRecord(node.meta)) {
      for (const key of keys) {
        const value = node.meta[key];
        const parsed = typeof value === 'number' ? value : Number(value);
        if (Number.isFinite(parsed) && parsed >= 0) return Math.trunc(parsed);
      }
    }
    if (isRecord(node.pagination)) {
      for (const key of keys) {
        const value = node.pagination[key];
        const parsed = typeof value === 'number' ? value : Number(value);
        if (Number.isFinite(parsed) && parsed >= 0) return Math.trunc(parsed);
      }
    }
  }
  return fallback;
}
