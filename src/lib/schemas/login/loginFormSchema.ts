import { z } from 'zod';

export const loginFormSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const loginUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  scope: z.string(),
  roles: z.array(z.string()),
  company_id: z.number().nullable().optional(),
  branch_id: z.number().nullable().optional(),
  org_id: z.number().nullable().optional(),
  must_change_password: z.boolean().optional(),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

export const loginResultSchema = z.object({
  success: z.boolean().optional().default(true),
  message: z.string().optional(),
  data: z
    .object({
      mfa_required: z.boolean().optional(),
      must_change_password: z.boolean().optional(),
      user: loginUserSchema.nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const logoutRequestSchema = z.object({
  refresh_token: z.string().min(32).nullable(),
  revoke_all: z.literal(false),
});

export const currentUserResponseSchema = z.object({
  success: z.boolean().optional().default(true),
  message: z.string().optional(),
  data: z.unknown().nullable().optional(),
});

export function readLoginUser(payload: unknown): LoginUser | null {
  for (const record of collectUserRecords(payload)) {
    const roles = readRoles(record.roles ?? record.role ?? record.role_name ?? record.role_code);
    const scope = typeof record.scope === 'string' ? record.scope : '';
    const fullName = readText(record.name) ?? readText(record.full_name);
    const firstName =
      readText(record.first_name) ??
      readText(record.firstName) ??
      fullName?.split(' ')[0] ??
      readText(record.username) ??
      readText(record.email)?.split('@')[0];
    const id = readNumber(record.id) ?? readNumber(record.user_id) ?? readNumber(record.userId);
    if (id == null || !firstName) continue;

    const resolvedScope =
      scope ||
      (roles[0]
        ? roles[0]
        : record.branch_id != null || record.branchId != null
          ? 'branch'
          : record.company_id != null || record.companyId != null
            ? 'company'
            : 'organization');
    const resolvedRoles = roles.length > 0 ? roles : [resolvedScope];

    const account = loginUserSchema.safeParse({
      id,
      first_name: firstName,
      last_name:
        readText(record.last_name) ??
        readText(record.lastName) ??
        (fullName ? fullName.split(' ').slice(1).join(' ') || null : null),
      email: readText(record.email) ?? null,
      scope: resolvedScope,
      roles: resolvedRoles,
      company_id: readNumber(record.company_id) ?? readNumber(record.companyId),
      branch_id: readNumber(record.branch_id) ?? readNumber(record.branchId),
      org_id:
        readNumber(record.org_id) ?? readNumber(record.orgId) ?? readNumber(record.organization_id),
      must_change_password: record.must_change_password === true,
    });
    if (account.success) return account.data;
  }

  return null;
}

export function accountFromCurrentUser(payload: unknown): LoginUser {
  const parsed = currentUserResponseSchema.safeParse(payload);
  if (parsed.success && !parsed.data.success) {
    throw new Error(parsed.data.message || 'Unable to load your profile');
  }

  const account = readLoginUser(payload);
  if (account) return account;

  throw new Error('Unable to load your profile');
}

function collectUserRecords(payload: unknown): Record<string, unknown>[] {
  if (!isRecord(payload)) return [];

  const records = [payload];
  if (isRecord(payload.user)) records.unshift(payload.user);
  if (isRecord(payload.profile)) records.unshift(payload.profile);
  if (isRecord(payload.employee)) records.unshift(payload.employee);
  if (isRecord(payload.data)) {
    records.unshift(payload.data);
    if (isRecord(payload.data.user)) records.unshift(payload.data.user);
    if (isRecord(payload.data.profile)) records.unshift(payload.data.profile);
    if (isRecord(payload.data.employee)) records.unshift(payload.data.employee);
  }

  return records;
}

function readRoles(value: unknown): string[] {
  if (typeof value === 'string' && value) return [value];
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === 'string' && item) return [item];
    if (!isRecord(item)) return [];
    const name =
      readText(item.name) ??
      readText(item.key) ??
      readText(item.role) ??
      readText(item.code) ??
      readText(item.role_name) ??
      readText(item.role_code);
    return name ? [name] : [];
  });
}

function readText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | null | undefined {
  if (value == null || value === '') return value === undefined ? undefined : null;
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
