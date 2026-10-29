import { z } from 'zod';

export const companyListItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1),
  code: z.string().nullable().optional(),
  businessType: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive']),
  branchCount: z.number().int().nonnegative(),
  userCount: z.number().int().nonnegative(),
});

export const companyListSchema = z.array(companyListItemSchema);

export type CompanyListItem = z.infer<typeof companyListItemSchema>;

/** Turn a companies API payload into the list the All Companies screen renders. */
export function parseCompanyList(payload: unknown): CompanyListItem[] {
  return unwrapCompanies(payload).flatMap((item) => {
    const parsed = companyListItemSchema.safeParse(mapCompany(item));
    return parsed.success ? [parsed.data] : [];
  });
}

function unwrapCompanies(payload: unknown): Record<string, unknown>[] {
  const unwrapped = unwrapEnvelope(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped.filter(isRecord);
  }

  if (!isRecord(unwrapped)) return [];

  if (Array.isArray(unwrapped.companies)) {
    return unwrapped.companies.filter(isRecord);
  }

  for (const key of ['items', 'companies', 'results', 'result', 'rows', 'data'] as const) {
    const value = unwrapped[key];
    if (Array.isArray(value)) return value.filter(isRecord);
    if (isRecord(value)) {
      const nested = unwrapCompanies(value);
      if (nested.length > 0) return nested;
    }
  }

  if ('id' in unwrapped || 'name' in unwrapped || 'company_id' in unwrapped) {
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

function mapCompany(raw: Record<string, unknown>): unknown {
  const statusRaw = String(raw.status ?? 'active')
    .toLowerCase()
    .trim();
  const id = raw.id ?? raw.company_id ?? raw.companyId;

  return {
    id: typeof id === 'number' || typeof id === 'string' ? id : String(id ?? ''),
    name: text(raw.name) ?? text(raw.business_name) ?? text(raw.company_name) ?? 'Company',
    code: text(raw.code) ?? text(raw.company_code) ?? null,
    businessType:
      text(raw.businessType) ??
      text(raw.business_type) ??
      text(raw.industry) ??
      text(raw.company_type) ??
      'Hospitality',
    status: statusRaw === 'inactive' || statusRaw === 'disabled' ? 'inactive' : 'active',
    branchCount: count(
      raw.branchCount ??
        raw.branch_count ??
        raw.branches_count ??
        raw.total_branches ??
        raw.totalBranches ??
        raw.branches,
    ),
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

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function count(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
