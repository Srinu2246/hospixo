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
  success: z.boolean(),
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
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().nullable().optional(),
});

export function readLoginUser(payload: unknown): LoginUser | null {
  for (const record of collectUserRecords(payload)) {
    const roles = readRoles(record.roles ?? record.role);
    const scope = typeof record.scope === 'string' ? record.scope : '';
    const firstName = readText(record.first_name) ?? readText(record.firstName);
    const id = readNumber(record.id);
    if (id == null || !firstName || (roles.length === 0 && !scope)) continue;

    const account = loginUserSchema.safeParse({
      id,
      first_name: firstName,
      last_name: readText(record.last_name) ?? readText(record.lastName) ?? null,
      email: readText(record.email) ?? null,
      scope: scope || roles[0],
      roles: roles.length > 0 ? roles : [scope],
      company_id: readNumber(record.company_id),
      branch_id: readNumber(record.branch_id),
      org_id: readNumber(record.org_id),
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
  if (isRecord(payload.data)) {
    records.unshift(payload.data);
    if (isRecord(payload.data.user)) records.unshift(payload.data.user);
  }

  return records;
}

function readRoles(value: unknown): string[] {
  if (typeof value === 'string' && value) return [value];
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === 'string' && item) return [item];
    if (!isRecord(item)) return [];
    const name = readText(item.name) ?? readText(item.key) ?? readText(item.role);
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
