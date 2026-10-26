import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  serializeUserListFilterParams,
  userListSortBySchema,
  userListSortOrderSchema,
  userListStatusSchema,
  userListSummarySchema,
  userListFilterParamsSchema,
  USER_LIST_SORT_FIELDS,
  type UserListStatus,
  type UserListFilterParams,
} from './userListFilterSchema';

describe('userListFilterSchema and serializer', () => {
  describe('userListSortBySchema', () => {
    it('accepts all valid sort fields', () => {
      for (const field of USER_LIST_SORT_FIELDS) {
        const result = userListSortBySchema.safeParse(field);
        assert.equal(result.success, true);
      }
    });

    it('rejects unsupported sort fields', () => {
      const invalid = userListSortBySchema.safeParse('unsupported_column');
      assert.equal(invalid.success, false);
    });
  });

  describe('userListSortOrderSchema', () => {
    it('accepts asc and desc', () => {
      assert.equal(userListSortOrderSchema.safeParse('asc').success, true);
      assert.equal(userListSortOrderSchema.safeParse('desc').success, true);
    });

    it('rejects invalid sort orders', () => {
      assert.equal(userListSortOrderSchema.safeParse('ascending').success, false);
      assert.equal(userListSortOrderSchema.safeParse('up').success, false);
    });
  });

  describe('userListStatusSchema', () => {
    it('accepts active, invited, inactive', () => {
      assert.equal(userListStatusSchema.safeParse('active').success, true);
      assert.equal(userListStatusSchema.safeParse('invited').success, true);
      assert.equal(userListStatusSchema.safeParse('inactive').success, true);
      const typedStatus: UserListStatus = 'active';
      assert.equal(typedStatus, 'active');
    });

    it('rejects unknown status strings', () => {
      assert.equal(userListStatusSchema.safeParse('pending').success, false);
    });
  });

  describe('userListSummarySchema', () => {
    it('parses valid summary counts', () => {
      const summary = userListSummarySchema.safeParse({
        total_users: 42,
        active_now: 30,
        pending_invites: 5,
        user_roles: 8,
      });
      assert.equal(summary.success, true);
      if (summary.success) {
        assert.equal(summary.data.total_users, 42);
        assert.equal(summary.data.active_now, 30);
        assert.equal(summary.data.pending_invites, 5);
        assert.equal(summary.data.user_roles, 8);
      }
    });
  });

  describe('userListFilterParamsSchema', () => {
    it('parses query params and applies defaults', () => {
      const parsed = userListFilterParamsSchema.parse({
        search: 'john',
        role: 'admin',
      });
      assert.equal(parsed.search, 'john');
      assert.equal(parsed.role, 'admin');
      assert.equal(parsed.page, 1);
      assert.equal(parsed.page_size, 20);
      assert.equal(parsed.sort_by, 'created_at');
      assert.equal(parsed.sort_order, 'desc');
      assert.equal(parsed.include_summary, false);
      const typedParams: UserListFilterParams = parsed;
      assert.equal(typedParams.search, 'john');
    });
  });

  describe('serializeUserListFilterParams', () => {
    it('serializes default filter values into clean API query params', () => {
      const params = serializeUserListFilterParams({
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
        includeSummary: true,
      });

      assert.equal(params.page, 1);
      assert.equal(params.page_size, 20);
      assert.equal(params.sort_by, 'created_at');
      assert.equal(params.sort_order, 'desc');
      assert.equal(params.include_summary, true);
      assert.equal(params.search, undefined);
      assert.equal(params.status, undefined);
      assert.equal(params.role, undefined);
    });

    it('sanitizes and includes active search, status, and role filter', () => {
      const params = serializeUserListFilterParams({
        search: '   jane.doe@hospixo.com   ',
        status: 'active',
        role: 'branch_manager',
        page: 2,
        pageSize: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      assert.equal(params.search, 'jane.doe@hospixo.com');
      assert.equal(params.status, 'active');
      assert.equal(params.role, 'branch_manager');
      assert.equal(params.page, 2);
      assert.equal(params.page_size, 10);
      assert.equal(params.sort_by, 'name');
      assert.equal(params.sort_order, 'asc');
    });

    it('ignores "all" and "All Statuses" / "All Roles" placeholder values', () => {
      const params = serializeUserListFilterParams({
        status: 'all',
        role: 'All Roles',
      });

      assert.equal(params.status, undefined);
      assert.equal(params.role, undefined);
    });

    it('includes numeric company_id, branch_id, and organization_id', () => {
      const params = serializeUserListFilterParams({
        companyId: 94,
        branchId: 12,
        organizationId: 1,
      });

      assert.equal(params.company_id, 94);
      assert.equal(params.branch_id, 12);
      assert.equal(params.organization_id, 1);
    });

    it('clamps page to minimum 1 and page_size to max 100', () => {
      const params = serializeUserListFilterParams({
        page: -5,
        pageSize: 500,
      });

      assert.equal(params.page, 1);
      assert.equal(params.page_size, 100);
    });

    it('merges extra parameters cleanly', () => {
      const params = serializeUserListFilterParams(
        { page: 1 },
        { scope: 'branch', scope_type: 'branch', extraFlag: true },
      );

      assert.equal(params.scope, 'branch');
      assert.equal(params.scope_type, 'branch');
      assert.equal(params.extraFlag, true);
    });
  });
});
