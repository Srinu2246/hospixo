import { z } from 'zod';

export const USER_LIST_SORT_FIELDS = [
  'created_at',
  'name',
  'email',
  'status',
  'role',
  'company',
  'branch',
  'organization',
  'id',
] as const;

export const USER_LIST_SORT_ORDERS = ['desc', 'asc'] as const;

export const userListSortBySchema = z.enum(USER_LIST_SORT_FIELDS);
export type UserListSortBy = z.infer<typeof userListSortBySchema>;

export const userListSortOrderSchema = z.enum(USER_LIST_SORT_ORDERS);
export type UserListSortOrder = z.infer<typeof userListSortOrderSchema>;

export const userListStatusSchema = z.enum(['active', 'invited', 'inactive']);
export type UserListStatus = z.infer<typeof userListStatusSchema>;

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'inactive', label: 'Inactive' },
] as const;

export const USER_SORT_FIELD_LABELS: Record<UserListSortBy, string> = {
  created_at: 'Date Created',
  name: 'Name',
  email: 'Email',
  role: 'Role',
  status: 'Status',
  company: 'Company',
  branch: 'Branch',
  organization: 'Organization',
  id: 'User ID',
};

/** Summary card totals returned by GET /api/v1/users?include_summary=true */
export const userListSummarySchema = z.object({
  total_users: z.number().int().nonnegative().optional(),
  active_now: z.number().int().nonnegative().optional(),
  active_users: z.number().int().nonnegative().optional(),
  pending_invites: z.number().int().nonnegative().optional(),
  user_roles: z.number().int().nonnegative().optional(),
  total_roles: z.number().int().nonnegative().optional(),
});

export type UserListSummary = z.infer<typeof userListSummarySchema>;

/** Validated query parameters for GET /api/v1/users */
export const userListFilterParamsSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  role: z.string().trim().optional(),
  company_id: z.number().int().positive().optional(),
  branch_id: z.number().int().positive().optional(),
  organization_id: z.number().int().positive().optional(),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(100).default(20),
  sort_by: userListSortBySchema.default('created_at'),
  sort_order: userListSortOrderSchema.default('desc'),
  include_summary: z.boolean().default(false),
});

export type UserListFilterParams = z.infer<typeof userListFilterParamsSchema>;

/** Filter state shape used in components and hooks */
export interface UserListFilterState {
  search: string;
  status: string;
  role: string;
  companyId: number | null;
  branchId: number | null;
  organizationId: number | null;
  page: number;
  pageSize: number;
  sortBy: UserListSortBy;
  sortOrder: UserListSortOrder;
  includeSummary: boolean;
}

export const DEFAULT_USER_LIST_FILTERS: UserListFilterState = {
  search: '',
  status: '',
  role: '',
  companyId: null,
  branchId: null,
  organizationId: null,
  page: 1,
  pageSize: 20,
  sortBy: 'created_at',
  sortOrder: 'desc',
  includeSummary: false,
};

/** Serializes filter state into URL query params for GET /api/v1/users */
export function serializeUserListFilterParams(
  filters: Partial<UserListFilterState>,
  extraParams?: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  const search = filters.search?.trim();
  if (search) params.search = search;

  const status = filters.status?.trim();
  if (status && status !== 'all' && status !== 'All Statuses') params.status = status;

  const role = filters.role?.trim();
  if (role && role !== 'all' && role !== 'All Roles') params.role = role;

  if (filters.companyId != null && Number.isFinite(filters.companyId)) {
    params.company_id = Number(filters.companyId);
  }

  if (filters.branchId != null && Number.isFinite(filters.branchId)) {
    params.branch_id = Number(filters.branchId);
  }

  if (filters.organizationId != null && Number.isFinite(filters.organizationId)) {
    params.organization_id = Number(filters.organizationId);
  }

  params.page = Math.max(1, Number(filters.page) || 1);
  params.page_size = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));

  if (filters.sortBy) params.sort_by = filters.sortBy;
  if (filters.sortOrder) params.sort_order = filters.sortOrder;
  if (filters.includeSummary) params.include_summary = true;

  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    }
  }

  return params;
}
