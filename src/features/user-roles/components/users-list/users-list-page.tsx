'use client';

import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  StatsCards,
  type UsersKpiId,
} from '@/features/user-roles/components/users-list/stats-cards';
import { UsersTable } from '@/features/user-roles/components/users-list/users-table';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import { withRoleScope } from '@/features/user-roles/hooks/use-role-management-level';

import { routes } from '@/config/routes';
import { fetchUsersList } from '@/lib/users';
import { fetchRolesList } from '@/lib/roles';
import { mapApiUserToTeamUser } from '@/lib/users-map';
import type { UsersListPageData } from '@/lib/users-server';

import styles from './users-list-page.module.css';

const defaultUsersListPageData: UsersListPageData = {
  users: [],
  total: 0,
  page: 1,
  pageSize: 8,
  totalPages: 1,
  search: '',
  stats: { totalUsers: 0, activeNow: 0, pendingInvites: 0, userRoles: 0 },
  error: null,
};

type UsersListPageProps = Readonly<{
  data?: UsersListPageData;
  /** When SSR already loaded the list, skip a redundant client refetch on mount. */
  preferServerData?: boolean;
}>;

/**
 * Users & Roles list UI.
 *
 * SSR-first list with optional client refresh (retry / manual reload).
 */
export function UsersListPage({
  data: initialData = defaultUsersListPageData,
  preferServerData = false,
}: UsersListPageProps) {
  const [data, setData] = useState<UsersListPageData>(initialData);
  const [isLoading, setIsLoading] = useState(
    !preferServerData && initialData.users.length === 0 && !initialData.error,
  );
  const [selectedKpi, setSelectedKpi] = useState<UsersKpiId>('total');
  const { level, addUser } = useUsersRolesNav();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([fetchUsersList(), fetchRolesList()]);

      const users = usersRes.items.map(mapApiUserToTeamUser);
      const total = usersRes.total ?? users.length;
      const page = usersRes.page ?? 1;
      const pageSize = usersRes.page_size ?? 8;
      const activeCount = users.filter((u) => u.status === 'active').length;
      const pendingCount = users.filter((u) => u.status === 'invited').length;

      setData({
        users,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        search: '',
        stats: {
          totalUsers: total,
          activeNow: activeCount,
          pendingInvites: pendingCount,
          userRoles: rolesRes.items?.length ?? 0,
        },
        error: null,
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unable to load users.',
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (preferServerData && !initialData.error) return;
    void loadData();
  }, [loadData, preferServerData, initialData.error]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Users & Roles</h1>

          <p className={styles.subtitle}>
            Manage your team members and their system access levels.
          </p>
        </div>

        <Link href={withRoleScope(addUser.root, level)} className={styles.addBtn}>
          <UserPlus size={16} />
          Add User
        </Link>
      </header>

      {data.error ? (
        <p className={styles.subtitle} role="alert">
          {data.error}{' '}
          {/sign in required/i.test(data.error) ? (
            <Link href={routes.auth.login}>Go to login</Link>
          ) : (
            <button type="button" onClick={() => void loadData()} disabled={isLoading}>
              {isLoading ? 'Retrying…' : 'Retry'}
            </button>
          )}
        </p>
      ) : null}

      <StatsCards
        {...data.stats}
        selectedId={selectedKpi}
        onSelect={(id) => {
          setSelectedKpi(id);
          document.getElementById('users-roles-table')?.scrollIntoView({
            block: 'start',
          });
        }}
      />

      <div className={styles.tableSection}>
        <UsersTable
          users={data.users}
          totalUsers={data.total}
          page={data.page}
          totalPages={data.totalPages}
          search={data.search}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
