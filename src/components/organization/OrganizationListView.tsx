'use client';

import { useMemo, useState } from 'react';

import { AdminButton } from '@/components/ui';
import {
  organizationIndustryFilterOptions,
  organizationSetupCopy,
  organizationStatusFilterOptions,
  organizationSubscriptionFilterOptions,
} from '@/constants/organizations';
import { useOrganizationsList } from '@/hooks/organizations/useOrganizationsList';
import { organizationCreatePath, organizationTabPath } from '@/helpers/organization/paths';
import { buildPageNumbers } from '@/helpers/pagination/build-page-numbers';
import { formatCreatedDate } from '@/helpers/format/format-created-date';

import { OrganizationListRow } from './list/organization-list-row';
import { OrganizationListSkeleton } from './list/organization-list-skeleton';

import styles from './list/organization-list.module.css';

type OrganizationListViewProps = Readonly<{
  initialSearchQuery?: string;
}>;

export default function OrganizationListView({
  initialSearchQuery = '',
}: OrganizationListViewProps) {
  const { data, isLoading, isError, error } = useOrganizationsList();
  const [statusFilter, setStatusFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [page, setPage] = useState(1);

  const items = data?.items ?? [];
  const pageSize = data?.pageSize ?? 10;

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((org) => {
      if (statusFilter && org.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (subscriptionFilter && org.plan.toLowerCase() !== subscriptionFilter.toLowerCase()) {
        return false;
      }
      if (industryFilter && org.industry.toLowerCase() !== industryFilter.toLowerCase()) {
        return false;
      }
      if (query && !org.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, statusFilter, subscriptionFilter, industryFilter, searchQuery]);

  const safePageSize = Math.max(1, pageSize || 10);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / safePageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * safePageSize;
  const pageItems = filteredItems.slice(pageStart, pageStart + safePageSize);
  const from = filteredItems.length === 0 ? 0 : pageStart + 1;
  const to = Math.min(pageStart + pageItems.length, filteredItems.length);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  function updateFilter(updater: () => void) {
    updater();
    setPage(1);
  }

  const loadError =
    error instanceof Error ? error.message : isError ? organizationSetupCopy.loadError : null;

  if (loadError && !data) {
    return (
      <div className={styles.page}>
        <div className={styles.breadcrumb}>{organizationSetupCopy.listBreadcrumb}</div>
        <div className={styles.header}>
          <h1 className={styles.title}>{organizationSetupCopy.listTitle}</h1>
        </div>
        <div className={styles.tableWrap}>
          <p className={styles.emptyState} role="alert">
            {loadError}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return <OrganizationListSkeleton />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>{organizationSetupCopy.listBreadcrumb}</div>

      <div className={styles.header}>
        <h1 className={styles.title}>{organizationSetupCopy.listTitle}</h1>
        <AdminButton href={organizationCreatePath()}>
          + {organizationSetupCopy.createOrganization}
        </AdminButton>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterField}>
            <span className={styles.filterLabel}>{organizationSetupCopy.filterStatus}</span>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(event) => updateFilter(() => setStatusFilter(event.target.value))}
              aria-label={organizationSetupCopy.filterStatus}
            >
              <option value="">All</option>
              {organizationStatusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span className={styles.filterLabel}>{organizationSetupCopy.filterSubscription}</span>
            <select
              className={styles.filterSelect}
              value={subscriptionFilter}
              onChange={(event) => updateFilter(() => setSubscriptionFilter(event.target.value))}
              aria-label={organizationSetupCopy.filterSubscription}
            >
              <option value="">All</option>
              {organizationSubscriptionFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span className={styles.filterLabel}>{organizationSetupCopy.filterIndustry}</span>
            <select
              className={styles.filterSelect}
              value={industryFilter}
              onChange={(event) => updateFilter(() => setIndustryFilter(event.target.value))}
              aria-label={organizationSetupCopy.filterIndustry}
            >
              <option value="">All</option>
              {organizationIndustryFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <input
          type="search"
          className={styles.search}
          placeholder={organizationSetupCopy.searchOrganizations}
          aria-label={organizationSetupCopy.searchOrganizations}
          value={searchQuery}
          onChange={(event) => updateFilter(() => setSearchQuery(event.target.value))}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Organization Name</th>
              <th>Plan</th>
              <th>Industry</th>
              <th className={styles.countHeader}>Companies</th>
              <th className={styles.countHeader}>Branches</th>
              <th>Status</th>
              <th>Created Date</th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  {organizationSetupCopy.noOrganizationsMatch}
                </td>
              </tr>
            ) : (
              pageItems.map((org) => (
                <OrganizationListRow
                  key={org.id}
                  org={org}
                  href={organizationTabPath(org.id, 'overview')}
                  createdLabel={formatCreatedDate(org.createdAt)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <p className={styles.paginationText}>
          {organizationSetupCopy.showingOrganizations(from, to, filteredItems.length)}
        </p>
        <div className={styles.paginationControls}>
          <button
            type="button"
            className={styles.pageButton}
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Previous
          </button>
          {pageNumbers.map((entry, index) =>
            entry === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className={styles.pageEllipsis}>
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                className={entry === currentPage ? styles.pageButtonActive : styles.pageButton}
                aria-current={entry === currentPage ? 'page' : undefined}
                onClick={() => goToPage(entry)}
              >
                {entry}
              </button>
            ),
          )}
          <button
            type="button"
            className={styles.pageButton}
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
