/**
 * Shared User, Invitation, and Role types across Hospixo frontend apps.
 */

export type ScopeType = 'organization' | 'company' | 'branch';

export type UserStatus = 'active' | 'disabled' | 'pending' | 'suspended' | 'invited' | 'inactive';

export type UserRole =
  | 'admin'
  | 'manager'
  | 'staff'
  | 'cashier'
  | 'tenant_admin'
  | 'org_admin'
  | 'platform_admin'
  | 'branch_manager'
  | 'kitchen_staff'
  | (string & {});

export type ApiUserRoleAssignment = Readonly<{
  id?: number;
  user_id?: number;
  role_id?: number;
  role_code?: string;
  role_name?: string;
  scope?: string;
  created_at?: string;
}>;

export type ApiUserBranch = Readonly<{
  id?: number;
  branch_id?: number;
  name?: string;
  is_active?: boolean;
}>;

export type ApiUser = Readonly<{
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  status: UserStatus;
  company_id?: number | null;
  branch_id?: number | null;
  branch_name?: string | null;
  organization_id?: number | null;
  org_id?: number | null;
  branches?: readonly ApiUserBranch[] | null;
  quick_pin?: string | null;
  last_login_at?: string | null;
  last_active_at?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: readonly (string | ApiUserRoleAssignment)[];
}>;

export type ListUsersQuery = Readonly<{
  q?: string;
  search?: string;
  role?: string;
  status?: UserStatus;
  branch_id?: number;
  page?: number;
  page_size?: number;
}>;

export type UsersListResponse = Readonly<{
  items: readonly ApiUser[];
  total: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}>;

/** Raw list payload from OpenAPI (`users` vs `items`). */
export type UsersListApiPayload = Readonly<{
  users?: readonly ApiUser[];
  items?: readonly ApiUser[];
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}>;

/** Input for creating a new user */
export type CreateUserInput = Readonly<{
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  /** System or custom role code, e.g. "cashier", "branch_manager" */
  role_code: string;
  organization_id?: number | null;
  company_id?: number | null;
  /** Required for branch-scoped roles */
  branch_id?: number | null;
  quick_pin?: string | null;
}>;

/** Input for sending an invitation */
export type SendInvitationInput = Readonly<{
  email: string;
  role_code: string;
  company_id?: number | null;
  branch_id?: number | null;
}>;

export type UpdateUserInput = Readonly<{
  first_name?: string;
  last_name?: string | null;
  email?: string;
  phone?: string | null;
  branch_id?: number | null;
}>;

/** Input for updating a user's status */
export type UpdateUserStatusInput = Readonly<{
  status: UserStatus;
}>;

export type AssignUserRolesInput = Readonly<{
  role_ids?: readonly number[];
  roles?: readonly string[];
}>;

export type UserRoleAssignment = Readonly<{
  id: number;
  role_id?: number;
  role?: string;
  user_id?: number;
}>;

export type InvitationStatus =
  | 'pending'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'expired'
  | 'revoked'
  | (string & {});

export type ListInvitationsQuery = Readonly<{
  status?: InvitationStatus;
  page?: number;
  page_size?: number;
}>;

export type ApiInvitation = Readonly<{
  id: number | string;
  email: string;
  status: InvitationStatus;
  roles?: readonly string[];
  role_code?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  invitee_email?: string | null;
  company_id?: number | null;
  branch_id?: number | null;
  created_at?: string;
  expires_at?: string | null;
}>;

export type InvitationsListResponse = Readonly<{
  items: readonly ApiInvitation[];
  total: number;
  page?: number;
  page_size?: number;
}>;

/** Raw list payload from OpenAPI (`invitations`) before normalize. */
export type InvitationsListApiPayload = Readonly<{
  invitations?: readonly ApiInvitation[];
  items?: readonly ApiInvitation[];
  total?: number;
  page?: number;
  page_size?: number;
}>;

/** Input for accepting an invitation */
export type AcceptInvitationInput = Readonly<{
  token: string;
  password?: string;
  first_name?: string;
  last_name?: string | null;
  phone?: string | null;
  enable_mfa?: boolean;
}>;

export type RejectInvitationInput = Readonly<{
  token: string;
}>;
