'use client';

import { useMemo, useState } from 'react';

import {
  DEFAULT_USER_LIST_FILTERS,
  serializeUserListFilterParams,
  type ScopeType,
  type UserListFilterState,
  type UserListSortBy,
  type UserListSortOrder,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface UseUserListFiltersOptions {
  scope?: ScopeType;
  defaultPage?: number;
  defaultPageSize?: number;
  defaultSortBy?: UserListSortBy;
  defaultSortOrder?: UserListSortOrder;
  defaultIncludeSummary?: boolean;
  initialSearch?: string;
  initialStatus?: string;
  initialRole?: string;
  initialCompanyId?: number | null;
  initialBranchId?: number | null;
  initialOrganizationId?: number | null;
  /** Fixed extra query parameters passed through to the backend */
  extraParams?: Record<string, string | number | boolean | undefined>;
}

export interface UseUserListFiltersReturn {
  // Current values
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
  filters: UserListFilterState;

  // Serialized params ready for API request
  queryParams: Record<string, string | number | boolean>;

  // Filter setters (each resets page to 1 unless page itself is changed)
  setSearch: (value: string) => void;
  setStatus: (value: string) => void;
  setRole: (value: string) => void;
  setCompanyId: (id: number | null | undefined) => void;
  setBranchId: (id: number | null | undefined) => void;
  setOrganizationId: (id: number | null | undefined) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (sortBy: UserListSortBy, sortOrder?: UserListSortOrder) => void;
  toggleSort: (sortBy: UserListSortBy) => void;

  // Resets
  resetFilters: () => void;
  clearFilter: (key: 'search' | 'status' | 'role' | 'company' | 'branch') => void;

  // Active state indicators
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

/**
 * Centralized, reusable hook for user list filtering, pagination, and sorting.
 * Strictly avoids `useEffect` — all derivations use React state and pure `useMemo`.
 */
export function useUserListFilters(
  options: Readonly<UseUserListFiltersOptions> = {},
): UseUserListFiltersReturn {
  const {
    scope = 'company',
    defaultPage = DEFAULT_USER_LIST_FILTERS.page,
    defaultPageSize = DEFAULT_USER_LIST_FILTERS.pageSize,
    defaultSortBy = DEFAULT_USER_LIST_FILTERS.sortBy,
    defaultSortOrder = DEFAULT_USER_LIST_FILTERS.sortOrder,
    defaultIncludeSummary = true,
    initialSearch = '',
    initialStatus = '',
    initialRole = '',
    initialCompanyId = null,
    initialBranchId = null,
    initialOrganizationId = null,
    extraParams,
  } = options;

  const [search, setSearchState] = useState(initialSearch);
  const [status, setStatusState] = useState(initialStatus);
  const [role, setRoleState] = useState(initialRole);
  const [companyId, setCompanyIdState] = useState<number | null>(initialCompanyId);
  const [branchId, setBranchIdState] = useState<number | null>(initialBranchId);
  const [organizationId, setOrganizationIdState] = useState<number | null>(initialOrganizationId);
  const [page, setPageState] = useState(defaultPage);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const [sortBy, setSortByState] = useState<UserListSortBy>(defaultSortBy);
  const [sortOrder, setSortOrderState] = useState<UserListSortOrder>(defaultSortOrder);

  // Effective IDs bound by scope
  const effectiveCompanyId = scope === 'organization' ? companyId : (initialCompanyId ?? companyId);
  const effectiveBranchId = scope === 'branch' ? (initialBranchId ?? branchId) : branchId;

  const setSearch = (value: string) => {
    setSearchState(value);
    setPageState(1);
  };

  const setStatus = (value: string) => {
    setStatusState(value);
    setPageState(1);
  };

  const setRole = (value: string) => {
    setRoleState(value);
    setPageState(1);
  };

  const setCompanyId = (id: number | null | undefined) => {
    const next = id != null && Number.isFinite(id) ? Number(id) : null;
    setCompanyIdState(next);
    // If company changes, clear branch filter
    setBranchIdState(null);
    setPageState(1);
  };

  const setBranchId = (id: number | null | undefined) => {
    const next = id != null && Number.isFinite(id) ? Number(id) : null;
    setBranchIdState(next);
    setPageState(1);
  };

  const setOrganizationId = (id: number | null | undefined) => {
    const next = id != null && Number.isFinite(id) ? Number(id) : null;
    setOrganizationIdState(next);
    setPageState(1);
  };

  const setPage = (newPage: number) => {
    setPageState(Math.max(1, newPage));
  };

  const setPageSize = (newSize: number) => {
    setPageSizeState(Math.min(100, Math.max(1, newSize)));
    setPageState(1);
  };

  const setSort = (newSortBy: UserListSortBy, newSortOrder?: UserListSortOrder) => {
    setSortByState(newSortBy);
    if (newSortOrder) {
      setSortOrderState(newSortOrder);
    }
  };

  const toggleSort = (column: UserListSortBy) => {
    if (sortBy === column) {
      setSortOrderState((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortByState(column);
      setSortOrderState(column === 'name' || column === 'email' ? 'asc' : 'desc');
    }
  };

  const clearFilter = (key: 'search' | 'status' | 'role' | 'company' | 'branch') => {
    if (key === 'search') setSearchState('');
    if (key === 'status') setStatusState('');
    if (key === 'role') setRoleState('');
    if (key === 'company') {
      setCompanyIdState(null);
      setBranchIdState(null);
    }
    if (key === 'branch') setBranchIdState(null);
    setPageState(1);
  };

  const resetFilters = () => {
    setSearchState('');
    setStatusState('');
    setRoleState('');
    if (scope === 'organization') {
      setCompanyIdState(null);
      setBranchIdState(null);
    } else if (scope === 'company') {
      setBranchIdState(null);
    }
    setPageState(1);
  };

  const filters: UserListFilterState = useMemo(
    () => ({
      search,
      status,
      role,
      companyId: effectiveCompanyId,
      branchId: effectiveBranchId,
      organizationId,
      page,
      pageSize,
      sortBy,
      sortOrder,
      includeSummary: defaultIncludeSummary,
    }),
    [
      search,
      status,
      role,
      effectiveCompanyId,
      effectiveBranchId,
      organizationId,
      page,
      pageSize,
      sortBy,
      sortOrder,
      defaultIncludeSummary,
    ],
  );

  const queryParams = useMemo(
    () =>
      serializeUserListFilterParams(filters, {
        scope,
        scope_type: scope,
        ...extraParams,
      }),
    [filters, scope, extraParams],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (status && status !== 'all' && status !== 'All Statuses') count += 1;
    if (role && role !== 'all' && role !== 'All Roles') count += 1;
    if (scope === 'organization' && companyId != null) count += 1;
    if (scope !== 'branch' && branchId != null) count += 1;
    return count;
  }, [search, status, role, scope, companyId, branchId]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    search,
    status,
    role,
    companyId: effectiveCompanyId,
    branchId: effectiveBranchId,
    organizationId,
    page,
    pageSize,
    sortBy,
    sortOrder,
    includeSummary: defaultIncludeSummary,
    filters,
    queryParams,
    setSearch,
    setStatus,
    setRole,
    setCompanyId,
    setBranchId,
    setOrganizationId,
    setPage,
    setPageSize,
    setSort,
    toggleSort,
    resetFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  };
}
