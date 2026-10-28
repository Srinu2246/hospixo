import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { branchDashboardDataSchema, parseBranchDashboardResponse } from './branchDashboardSchema';
import {
  MOCK_BRANCH_DASHBOARD,
  resolveBranchDashboardMock,
} from '@/lib/mocks/dashboard/dashboard.mocks';
import { branchDashboardHref } from '@/lib/helpers/routing/routingHelpers';
import type { SidebarContext } from '@/app/sidebar';

describe('branchDashboard validation and routing', () => {
  describe('branchDashboardDataSchema', () => {
    it('validates mock branch dashboard data', () => {
      const parsed = branchDashboardDataSchema.safeParse(MOCK_BRANCH_DASHBOARD);
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data.branch_id, 1);
        assert.equal(parsed.data.summary.total_sales, '887260.00');
        assert.equal(parsed.data.sales_statistics.total_orders, 932);
        assert.equal(parsed.data.sales_statistics.by_order_type.length, 3);
      }
    });

    it('parses branch dashboard API response envelope via parseBranchDashboardResponse', () => {
      const envelope = {
        success: true,
        data: MOCK_BRANCH_DASHBOARD,
        message: 'OK',
      };
      const result = parseBranchDashboardResponse(envelope);
      assert.equal(result.branch_id, 1);
      assert.equal(result.summary.net_sales, '848582.00');
    });

    it('throws error when envelope success is false', () => {
      const envelope = {
        success: false,
        data: MOCK_BRANCH_DASHBOARD,
        message: 'Branch not found',
      };
      assert.throws(() => parseBranchDashboardResponse(envelope), /Branch not found/);
    });

    it('throws error when envelope structure is invalid', () => {
      assert.throws(
        () => parseBranchDashboardResponse({ unexpected: 'shape' }),
        /Invalid branch dashboard response/,
      );
    });
  });

  describe('resolveBranchDashboardMock', () => {
    it('matches GET /v1/branches/:id/dashboard and returns dynamic branch_id', () => {
      const result = resolveBranchDashboardMock({
        method: 'GET',
        path: '/v1/branches/42/dashboard',
        params: { start_date: '2026-10-01', end_date: '2026-10-28' },
      });
      assert.ok(result);
      const res = result as {
        success: boolean;
        data: { branch_id: number; date_range: { start_date: string; end_date: string } };
      };
      assert.equal(res.success, true);
      assert.equal(res.data.branch_id, 42);
      assert.equal(res.data.date_range.start_date, '2026-10-01');
      assert.equal(res.data.date_range.end_date, '2026-10-28');
    });

    it('returns undefined for non-GET requests', () => {
      const result = resolveBranchDashboardMock({
        method: 'POST',
        path: '/v1/branches/42/dashboard',
      });
      assert.equal(result, undefined);
    });

    it('returns undefined for non-matching paths', () => {
      const result = resolveBranchDashboardMock({
        method: 'GET',
        path: '/v1/branches/42/floors',
      });
      assert.equal(result, undefined);
    });
  });

  describe('branchDashboardHref', () => {
    it('generates branch-scoped dashboard route with branch code', () => {
      const context: SidebarContext = { companyId: 94, companyName: 'Acme Corp' };
      const branch = { id: 10, name: 'Downtown Branch', code: 'DT01' };
      const href = branchDashboardHref(branch, context, 'company');
      assert.equal(href, '/DT01/dashboard');
    });

    it('generates branch-scoped dashboard route using branch id when code is absent', () => {
      const context: SidebarContext = { companyId: 94, companyName: 'Acme Corp' };
      const branch = { id: 10, name: 'Downtown Branch', code: null };
      const href = branchDashboardHref(branch, context, 'company');
      assert.equal(href, '/10/dashboard');
    });
  });
});
