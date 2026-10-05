import { describe, expect, it } from 'vitest';

import { teamUsers } from '@/features/user-roles/config/users';
import {
  DEFAULT_BRANCH_CONTEXT,
  filterEmployeesByAccessLevel,
} from '@/features/user-roles/lib/employee-scope';

describe('filterEmployeesByAccessLevel', () => {
  it('shows all employees at organisation level', () => {
    expect(filterEmployeesByAccessLevel(teamUsers, 'organisation')).toHaveLength(teamUsers.length);
  });

  it('shows branch and company employees at company level', () => {
    const result = filterEmployeesByAccessLevel(teamUsers, 'company');
    expect(result.every((user) => user.scope !== 'organisation')).toBe(true);
    expect(result.some((user) => user.scope === 'company')).toBe(true);
    expect(result.some((user) => user.scope === 'branch')).toBe(true);
  });

  it('shows only active-branch employees at branch level', () => {
    const result = filterEmployeesByAccessLevel(teamUsers, 'branch');
    expect(result.every((user) => user.scope === 'branch')).toBe(true);
    expect(result.every((user) => user.branch === DEFAULT_BRANCH_CONTEXT)).toBe(true);
  });

  it('filters branch employees by specific activeBranch name', () => {
    const result = filterEmployeesByAccessLevel(teamUsers, 'branch', {
      activeBranch: 'Westside Cafe',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((user) => user.scope === 'branch')).toBe(true);
    expect(result.every((user) => user.branch === 'Westside Cafe')).toBe(true);
  });

  it('filters branch employees by activeBranchId', () => {
    const withIds = [
      ...teamUsers,
      {
        id: 'u-live-1',
        firstName: 'Live',
        lastName: 'BranchUser',
        email: 'live@example.com',
        role: 'Cashier' as const,
        branch: 'Branch 42',
        branchId: 42,
        scope: 'branch' as const,
        status: 'active' as const,
        lastActive: 'Now',
        avatarColor: '#10B981',
      },
    ];
    const result = filterEmployeesByAccessLevel(withIds, 'branch', {
      activeBranchId: 42,
    });
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe('live@example.com');
  });
});
