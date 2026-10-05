import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UsersListPage } from './users-list-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/company/employees',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/users', () => ({
  fetchUsersList: vi.fn(),
}));

vi.mock('@/lib/roles', () => ({
  fetchRolesList: vi.fn(),
}));

vi.mock('@/features/user-roles/hooks/use-users-roles-nav', () => ({
  useUsersRolesNav: () => ({
    level: 'company',
    addUser: { root: '/company/employees/add-user' },
    roles: { root: '/company/employees/roles' },
  }),
}));

vi.mock('@/features/user-roles/hooks/use-role-management-level', () => ({
  useRoleManagementLevel: () => 'company',
  withRoleScope: (path: string) => path,
}));

import { fetchUsersList } from '@/lib/users';
import { fetchRolesList } from '@/lib/roles';

describe('UsersListPage client-side JSON fetching', () => {
  beforeEach(() => {
    vi.mocked(fetchUsersList).mockReset();
    vi.mocked(fetchRolesList).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('fetches /api/users and /api/roles on mount and displays data', async () => {
    vi.mocked(fetchUsersList).mockResolvedValue({
      items: [
        {
          id: 101,
          first_name: 'Aarav',
          last_name: 'Sharma',
          email: 'aarav@example.com',
          status: 'active',
          roles: ['branch_manager'],
        },
      ],
      total: 1,
      page: 1,
      page_size: 8,
    });

    vi.mocked(fetchRolesList).mockResolvedValue({
      items: [
        {
          id: 1,
          code: 'branch_manager',
          display_name: 'Branch Manager',
          scope: 'branch',
          status: 'active',
        },
      ],
      total: 1,
    });

    render(<UsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    expect(fetchUsersList).toHaveBeenCalledTimes(1);
    expect(fetchRolesList).toHaveBeenCalledTimes(1);
    expect(screen.getByText('aarav@example.com')).toBeInTheDocument();
  });

  it('displays error message when fetching fails', async () => {
    vi.mocked(fetchUsersList).mockRejectedValue(new Error('Network Error'));
    vi.mocked(fetchRolesList).mockResolvedValue({ items: [], total: 0 });

    render(<UsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });
});
