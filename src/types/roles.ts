/**
 * Roles & Permissions API types — snake_case matches backend OpenAPI.
 *
 * Integrated shapes:
 * - ApiRole ← RoleResponse (GET /api/v1/roles list items)
 * - ApiRoleDetail ← RoleDetailResponse (GET /api/v1/roles/{role_id})
 * - RolesListResponse ← RolesListResponse
 */

import type { ScopeType } from './users';

export type RoleStatus = 'active' | 'inactive' | (string & {});

/**
 * Role list item — matches `RoleResponse`.
 * Endpoint: GET /api/v1/roles
 * BFF:      GET /api/roles
 */
export type ApiRole = Readonly<{
  id?: number | null;
  code: string;
  display_name: string;
  scope: ScopeType;
  default_vertical?: string | null;
  description?: string | null;
  status: RoleStatus;
  organization_id?: number | null;
  is_system_role?: boolean;
}>;

/**
 * Normalized list shape used by the frontend.
 * Endpoint: GET /api/v1/roles
 * Backend `RolesListResponse` uses `roles`; we also accept `items` or a bare array.
 */
export type RolesListResponse = Readonly<{
  items: readonly ApiRole[];
  total: number;
}>;

/**
 * Raw backend list payload before normalization.
 * Endpoint: GET /api/v1/roles
 */
export type RolesListApiPayload = Readonly<{
  roles?: readonly ApiRole[];
  items?: readonly ApiRole[];
  total?: number;
}>;

/**
 * Role detail — matches `RoleDetailResponse` (includes permission_codes).
 * Endpoint: GET /api/v1/roles/{role_id}
 * BFF:      GET /api/roles/[roleId]
 */
export type ApiRoleDetail = Readonly<
  ApiRole & {
    permission_codes?: readonly string[];
  }
>;

/**
 * templates
 * Endpoint: GET /api/v1/roles/templates
 * BFF:      GET /api/roles/templates
 */
export type ApiRoleTemplate = Readonly<{
  code: string;
  display_name: string;
  description?: string | null;
  scope: ScopeType;
  default_permissions: readonly string[];
}>;

export type RolesTemplatesResponse = Readonly<{
  templates: readonly ApiRoleTemplate[];
}>;

/**
 * Create custom role — matches `RoleCreateRequest`.
 * Endpoint: POST /api/v1/roles
 * BFF:      POST /api/roles
 */
export type CreateRoleInput = Readonly<{
  display_name: string;
  code: string;
  scope: ScopeType;
  permission_codes: readonly string[];
  description?: string | null;
  /** Optional template used for UX prefill only. */
  template_code?: string | null;
}>;

/** Update role — matches `RoleUpdateRequest`.
 * Endpoint: PUT /api/v1/roles/{role_id}
 * BFF:      PUT /api/roles/[roleId]
 *
 * `permission_codes` is required (full replacement set).
 */
export type UpdateRoleInput = Readonly<{
  permission_codes: readonly string[];
  display_name?: string | null;
  code?: string | null;
  description?: string | null;
  scope?: ScopeType | null;
  template_code?: string | null;
}>;

/** DELETE /api/roles/[roleId] → delete custom role. */
export type DeleteRoleInput = Readonly<{
  role_id: number | string;
}>;

/** PATCH /api/roles/[roleId] → partial update. */
export type PatchRoleInput = Readonly<{
  status: 'active' | 'inactive';
}>;

/**
 * Permission catalog item — matches `PermissionItemResponse`.
 * Endpoint: GET /api/v1/permissions/grouped
 */
export type ApiPermissionItem = Readonly<{
  code: string;
  action: string;
  description?: string | null;
  /** False when gated by a capability the company does not have. */
  available?: boolean;
}>;

/**
 * Permission group — matches `PermissionGroupResponse`.
 */
export type ApiPermissionGroup = Readonly<{
  module: string;
  resource: string;
  permissions: readonly ApiPermissionItem[];
}>;

/**
 * Grouped catalog — matches `GroupedPermissionsResponse`.
 * Endpoint: GET /api/v1/permissions/grouped
 * BFF:      GET /api/permissions/grouped
 */
export type GroupedPermissionsResponse = Readonly<{
  groups: readonly ApiPermissionGroup[];
}>;
