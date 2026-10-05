/**
 * Branches API types — snake_case matches backend OpenAPI.
 *
 * - ApiBranch ← BranchResponse (GET /api/v1/branches)
 * - Also used by platform org/company branch listing
 */

export type BranchStatus = 'active' | 'inactive' | 'closed' | (string & {});

/**
 * Branch list item — matches `BranchResponse`.
 * Endpoint: GET /api/v1/branches
 * BFF:      GET /api/branches
 */
export type ApiBranch = Readonly<{
  id: number;
  company_id: number;
  code?: string | null;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country: string;
  phone?: string | null;
  manager_name?: string | null;
  timezone?: string | null;
  currency?: string | null;
  is_default: boolean;
  status: BranchStatus;
  created_at?: string | null;
  updated_at?: string | null;
}>;

/** Normalized list shape used by the frontend. */
export type BranchesListResponse = Readonly<{
  items: readonly ApiBranch[];
  total: number;
}>;
