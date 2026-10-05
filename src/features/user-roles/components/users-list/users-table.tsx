'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MoreVertical, Pencil, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import { useAuth } from '@/context/auth';
import { updateUserStatusAction } from '@/lib/users-actions';

import { roleOptions, getTeamUserAvatarSrc } from '@/features/user-roles/config/users';
import type { TeamUser, UserRole, UserStatus } from '@/features/user-roles/config/users';
import { UserAvatar } from '@/features/user-roles/components/shared/user-avatar';
import type { UsersKpiId } from '@/features/user-roles/components/users-list/stats-cards';
import { useMergedTeamUsers } from '@/features/user-roles/hooks/use-merged-team-users';
import { useRoleManagementLevel } from '@/features/user-roles/hooks/use-role-management-level';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import {
  filterEmployeesByAccessLevel,
  getScopedBranchOptions,
} from '@/features/user-roles/lib/employee-scope';
import type { HierarchyAccessLevel } from '@/lib/auth/access-level';

import styles from './users-table.module.css';

const LAST_VIEWED_KEY = 'hospixo.last-viewed-staff';

type StatusFilter = UserStatus | 'all';
type RoleFilter = UserRole | 'all';
type BranchFilter = string;

function getHierarchyLevel(level: string): HierarchyAccessLevel {
  if (level === 'organisation' || level === 'company' || level === 'branch') {
    return level;
  }
  return 'company';
}

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'disabled', label: 'Disabled' },
];

function getRoleBadgeClass(role: UserRole) {
  if (role === 'Company Manager' || role === 'Branch Manager') return styles.roleTenantAdmin;
  if (role === 'Inventory') return styles.roleInventory;
  return styles.roleDefault;
}

function isInvitationRow(user: TeamUser) {
  return user.id.startsWith('invite-');
}

function getStatusDotClass(status: TeamUser['status']) {
  if (status === 'active') return styles.statusActive;
  if (status === 'invited') return styles.statusInvited;
  return styles.statusDisabled;
}

export type UsersTableProps = Readonly<{
  users?: TeamUser[];
  totalUsers?: number;
  page?: number;
  totalPages?: number;
  search?: string;
  isLoading?: boolean;
  kpiFilter?: UsersKpiId;
  onSearchChange?: (search: string) => void;
  onPageChange?: (page: number) => void;
}>;

export function UsersTable({
  users: serverUsers,
  search: initialSearch = '',
  kpiFilter = 'total',
}: UsersTableProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();
  const level = useRoleManagementLevel();
  const hierarchyLevel = getHierarchyLevel(level);
  const { viewStaffPrefix, editStaffPrefix, invitations } = useUsersRolesNav();
  const fallbackUsers = useMergedTeamUsers();
  const teamUsers = serverUsers !== undefined ? serverUsers : fallbackUsers;

  const rawBranchParam = searchParams?.get('outlet') ?? searchParams?.get('branch_id');
  const activeBranchId = authUser?.branch_id ?? (rawBranchParam ? Number(rawBranchParam) : null);

  const scopedUsers = useMemo(
    () =>
      filterEmployeesByAccessLevel(teamUsers, hierarchyLevel, {
        activeBranchId,
        activeCompanyId: authUser?.company_id ?? null,
      }),
    [teamUsers, hierarchyLevel, activeBranchId, authUser?.company_id],
  );
  const branchOptions = useMemo(
    () => getScopedBranchOptions(hierarchyLevel, scopedUsers),
    [hierarchyLevel, scopedUsers],
  );
  const [pendingStatusUserId, setPendingStatusUserId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, UserStatus>>({});
  const [, startTransition] = useTransition();

  function handleToggleRowStatus(user: TeamUser) {
    const current = statusOverrides[user.id] ?? user.status;
    const nextStatus: UserStatus = current === 'active' ? 'disabled' : 'active';
    setPendingStatusUserId(user.id);
    setOpenMenuId(null);

    startTransition(async () => {
      try {
        const res = await updateUserStatusAction(user.id, { status: nextStatus });
        if (res.ok) {
          setStatusOverrides((prev) => ({ ...prev, [user.id]: nextStatus }));
          router.refresh();
        }
      } finally {
        setPendingStatusUserId(null);
      }
    });
  }

  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [branchFilter, setBranchFilter] = useState<BranchFilter>('all');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 8;

  const [prevLevel, setPrevLevel] = useState(level);
  if (prevLevel !== level) {
    setPrevLevel(level);
    setBranchFilter('all');
    setPage(1);
  }

  const [prevKpi, setPrevKpi] = useState(kpiFilter);
  if (prevKpi !== kpiFilter) {
    setPrevKpi(kpiFilter);
    setPage(1);
    if (kpiFilter === 'active') setStatusFilter('active');
    else if (kpiFilter === 'invited') setStatusFilter('invited');
    else setStatusFilter('all');
  }

  const activeFilterCount = [
    roleFilter !== 'all',
    statusFilter !== 'all',
    branchFilter !== 'all',
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const kpiStatus: StatusFilter =
      kpiFilter === 'active' ? 'active' : kpiFilter === 'invited' ? 'invited' : statusFilter;

    const rows = scopedUsers.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (kpiStatus !== 'all' && user.status !== kpiStatus) return false;
      if (branchFilter !== 'all' && user.branch !== branchFilter) return false;
      if (!query) return true;
      return (
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.branch.toLowerCase().includes(query)
      );
    });

    if (kpiFilter !== 'roles') return rows;

    return [...rows].sort((a, b) => {
      const roleCmp = a.role.localeCompare(b.role);
      if (roleCmp !== 0) return roleCmp;
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });
  }, [search, roleFilter, statusFilter, branchFilter, scopedUsers, kpiFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target)) setOpenMenuId(null);
      if (!filterRef.current?.contains(target)) setFiltersOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function clearFilters() {
    setRoleFilter('all');
    setStatusFilter('all');
    setBranchFilter('all');
    setPage(1);
  }

  function rememberStaff(id: string) {
    try {
      sessionStorage.setItem(LAST_VIEWED_KEY, id);
    } catch {
      /* ignore */
    }
  }

  function openProfile(user: TeamUser) {
    if (isInvitationRow(user)) {
      router.push(`${invitations}/${user.id.slice('invite-'.length)}`);
      return;
    }
    rememberStaff(user.id);
    router.push(`${viewStaffPrefix}/${user.id}`);
  }

  return (
    <div className={styles.container} id="users-roles-table">
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className={styles.filterWrap} ref={filterRef}>
          <button
            type="button"
            className={`${styles.filterBtn} ${filtersOpen || activeFilterCount > 0 ? styles.filterBtnActive : ''}`}
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 ? (
              <span className={styles.filterCount}>{activeFilterCount}</span>
            ) : null}
          </button>
          {filtersOpen ? (
            <div className={styles.filterPanel}>
              <label className={styles.filterField}>
                <span>Role</span>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as RoleFilter);
                    setPage(1);
                  }}
                >
                  <option value="all">All roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.filterField}>
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(1);
                  }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.filterField}>
                <span>Branch</span>
                <select
                  value={branchFilter}
                  onChange={(e) => {
                    setBranchFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All branches</option>
                  {branchOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                Clear all
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {activeFilterCount > 0 ? (
        <div className={styles.chips}>
          {roleFilter !== 'all' ? (
            <span className={styles.chip}>
              Role: {roleFilter}
              <button
                type="button"
                onClick={() => {
                  setRoleFilter('all');
                  setPage(1);
                }}
              >
                <X size={12} />
              </button>
            </span>
          ) : null}
          {statusFilter !== 'all' ? (
            <span className={styles.chip}>
              Status: {statusFilter}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                <X size={12} />
              </button>
            </span>
          ) : null}
          {branchFilter !== 'all' ? (
            <span className={styles.chip}>
              Branch: {branchFilter}
              <button
                type="button"
                onClick={() => {
                  setBranchFilter('all');
                  setPage(1);
                }}
              >
                <X size={12} />
              </button>
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>USER</th>
              <th className={styles.th}>ROLE</th>
              <th className={styles.th}>BRANCH</th>
              <th className={styles.th}>STATUS</th>
              <th className={styles.th}>LAST ACTIVE</th>
              <th className={`${styles.th} ${styles.thActions}`}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((baseUser) => {
              const user = statusOverrides[baseUser.id]
                ? { ...baseUser, status: statusOverrides[baseUser.id]! }
                : baseUser;
              return (
                <tr key={user.id} className={styles.row} onClick={() => openProfile(user)}>
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <UserAvatar
                        firstName={user.firstName}
                        lastName={user.lastName}
                        src={getTeamUserAvatarSrc(user)}
                        color={user.avatarColor}
                        size="md"
                      />
                      <div className={styles.userInfo}>
                        <p className={styles.userName}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p className={styles.userEmail}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.cellText}`}>{user.branch}</td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.statusCell} ${
                        user.status === 'active'
                          ? styles.statusCellActive
                          : user.status === 'invited'
                            ? styles.statusCellInvited
                            : styles.statusCellDisabled
                      }`}
                    >
                      <span className={`${styles.statusDot} ${getStatusDotClass(user.status)}`} />
                      <span className={styles.statusLabel}>
                        {user.status === 'active'
                          ? 'Active'
                          : user.status === 'invited'
                            ? 'Invited'
                            : 'Disabled'}
                      </span>
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.cellMuted}`}>{user.lastActive}</td>
                  <td
                    className={`${styles.td} ${styles.tdActions}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.actionWrap}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        aria-label="User actions"
                        aria-expanded={openMenuId === user.id}
                        onClick={() => setOpenMenuId((cur) => (cur === user.id ? null : user.id))}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === user.id ? (
                        <div className={styles.menu} ref={menuRef}>
                          {isInvitationRow(user) ? (
                            <Link
                              href={`${invitations}/${user.id.slice('invite-'.length)}`}
                              className={styles.menuItem}
                              onClick={() => setOpenMenuId(null)}
                            >
                              View invitation
                            </Link>
                          ) : (
                            <>
                              <Link
                                href={`${editStaffPrefix}/${user.id}`}
                                className={styles.menuItem}
                                onClick={() => {
                                  rememberStaff(user.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Pencil size={14} />
                                Edit Staff
                              </Link>
                              <button
                                type="button"
                                className={`${styles.menuItem} ${
                                  user.status === 'active'
                                    ? styles.menuItemDanger
                                    : styles.menuItemSuccess
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleRowStatus(user);
                                }}
                                disabled={pendingStatusUserId === user.id}
                              >
                                {pendingStatusUserId === user.id
                                  ? user.status === 'active'
                                    ? 'Deactivating…'
                                    : 'Activating…'
                                  : user.status === 'active'
                                    ? 'Deactivate User'
                                    : 'Activate User'}
                              </button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className={`${styles.td} ${styles.empty}`}>
                  No{' '}
                  {kpiFilter === 'invited'
                    ? 'pending invitations'
                    : 'users match your search or filters'}
                  .
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerInfo}>
          Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
          {Math.min(page * pageSize, filtered.length)} of {filtered.length} users
        </span>
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className={styles.pageNumber}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
