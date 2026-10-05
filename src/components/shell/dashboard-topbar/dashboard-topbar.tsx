'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Bell, Bot, ChevronDown, LayoutGrid, MapPin, Settings } from 'lucide-react';

import { headerChrome, showsWorkspaceHeaderActions } from '@/config/shell/header-chrome';
import { routes } from '@/config/routes';
import { useAuth } from '@/context/auth';
import { useDashboardData } from '@/context/dashboard-data';
import { useDashboardFilter } from '@/context/dashboard-filter';
import type { DashboardOutlet } from '@/features/dashboard/types';
import { ProfileMenu } from '@/features/profile';
import { MobileNavToggle } from '@/components/shell/mobile-nav';
import { cn } from '@/lib/utils';
import { WorkspaceThemeToggle } from '@/components/shell/workspace-theme-toggle';

import {
  isBranchPickerPath,
  isBranchScopePath,
  isCompanyDashboardHome,
  isOrganisationPath,
  resolveCompanyPickerHref,
  resolveBranchPickerHref,
  resolveCurrentBranchName,
  resolveWorkspaceSettingsHref,
} from './dashboard-topbar-scope';
import { useTopbarCompanyBranches } from './use-topbar-company-branches';
import styles from './dashboard-topbar.module.css';

type DashboardTopbarProps = Readonly<{
  /** Hide outlet picker on shells that do not filter by outlet. */
  showOutlets?: boolean;
  navOpen?: boolean;
  onMenuClick?: () => void;
  className?: string;
}>;

export function DashboardTopbar({
  showOutlets = true,
  navOpen = false,
  onMenuClick,
  className,
}: DashboardTopbarProps) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { outletId, setOutletId } = useDashboardFilter();
  const { data, companies = [] } = useDashboardData();
  const branchScope = isBranchScopePath(pathname);
  const branchPicker = isBranchPickerPath(pathname);
  const organisationDashboard = isOrganisationPath(pathname);
  const showWorkspaceActions = showsWorkspaceHeaderActions(pathname);
  const companyId = searchParams?.get('company_id') ?? '';
  const companyDashboardHome = isCompanyDashboardHome(pathname);
  const outletFromUrl = searchParams?.get('outlet');
  const effectiveOutletId = outletFromUrl ?? (companyDashboardHome ? 'all' : outletId);
  const selectedCompany = companies.find((company) => company.id === companyId);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const allBranchesOption = useMemo(
    (): DashboardOutlet => ({
      id: 'all',
      name: branchPicker ? 'All Branches' : 'All Outlets',
    }),
    [branchPicker],
  );
  const hasBootstrapOutlets = (data?.outlets?.length ?? 0) > 1;
  const shouldFetchCompanyBranches = Boolean(companyId && branchPicker && !hasBootstrapOutlets);
  const branchScopeKey = useMemo(
    () => ({
      orgId: user?.org_id && user.org_id > 0 ? String(user.org_id) : undefined,
      companyId: companyId || undefined,
    }),
    [user?.org_id, companyId],
  );
  const fetchedCompanyOutlets = useTopbarCompanyBranches(
    branchScopeKey,
    shouldFetchCompanyBranches,
    allBranchesOption,
  );
  const serverOutlets = hasBootstrapOutlets ? data!.outlets! : null;
  const defaultOutlets = data?.outlets?.length ? data.outlets : [allBranchesOption];
  const outlets =
    serverOutlets ??
    (companyId
      ? fetchedCompanyOutlets?.length
        ? fetchedCompanyOutlets
        : [allBranchesOption]
      : defaultOutlets);
  const selected = outlets.find((outlet) => outlet.id === effectiveOutletId) ?? outlets[0];
  const currentBranchName = resolveCurrentBranchName(outlets, effectiveOutletId, user);
  const settingsHref = resolveWorkspaceSettingsHref(pathname);

  const outletLabel = showWorkspaceActions
    ? 'Outlets'
    : branchScope
      ? 'Branch'
      : branchPicker
        ? 'Branches'
        : 'Outlets';

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'AK';

  function handleOutletChange(nextOutletId: string) {
    setOutletId(nextOutletId);

    const branchHref = resolveBranchPickerHref(pathname, nextOutletId, companyId || null);
    if (branchHref) {
      router.push(branchHref);
      return;
    }

    if (isBranchPickerPath(pathname) && !companyDashboardHome) {
      return;
    }

    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (nextOutletId === 'all') params.delete('outlet');
    else params.set('outlet', nextOutletId);
    const query = params.toString();
    const nextPath = query ? `${pathname}?${query}` : pathname;
    const currentQuery = searchParams?.toString() ?? '';
    const currentPath = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    if (nextPath !== currentPath) {
      router.push(nextPath);
    }
  }

  function handleCompanyChange(companyId: string) {
    if (companyId) router.push(resolveCompanyPickerHref(companyId));
  }

  return (
    <header className={cn(styles.header, className)} data-access-chrome="topbar">
      <div className={styles.topbarStart}>
        {onMenuClick ? <MobileNavToggle open={navOpen} onClick={onMenuClick} /> : null}
        {showOutlets ? (
          <div className={styles.outletGroup}>
            <span className={styles.outletLabel}>
              {organisationDashboard
                ? 'Companies'
                : selectedCompany && companyId
                  ? `Company: ${selectedCompany.name}`
                  : outletLabel}
            </span>
            {branchScope ? (
              <div className={styles.branchNameWrap}>
                <MapPin className={styles.pinIcon} aria-hidden="true" />
                <p className={styles.branchName}>{currentBranchName}</p>
              </div>
            ) : organisationDashboard ? (
              <div className={styles.selectWrap}>
                <MapPin className={styles.pinIcon} aria-hidden="true" />
                <select
                  aria-label="Select company"
                  defaultValue=""
                  onChange={(event) => handleCompanyChange(event.target.value)}
                  className={styles.select}
                >
                  <option value="">Select company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} aria-hidden="true" />
              </div>
            ) : (
              <div className={styles.selectWrap}>
                <MapPin className={styles.pinIcon} aria-hidden="true" />
                <select
                  aria-label={branchPicker ? 'Select branch' : 'Select outlet'}
                  value={selected?.id ?? 'all'}
                  onChange={(event) => handleOutletChange(event.target.value)}
                  className={styles.select}
                >
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} aria-hidden="true" />
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className={styles.actions}>
        {showWorkspaceActions && headerChrome.showAiAgent ? (
          <Link href={routes.dashboard.analytics} className={styles.outlineButton}>
            <Bot className={styles.actionIcon} aria-hidden="true" />
            AI Agent
          </Link>
        ) : null}
        {showWorkspaceActions && headerChrome.showExploreProducts ? (
          <Link href={routes.dashboard.settings} className={styles.primaryButton}>
            <LayoutGrid className={styles.actionIcon} aria-hidden="true" />
            Explore Products
          </Link>
        ) : null}
        {showWorkspaceActions && headerChrome.showNotifications ? (
          <div className={styles.notificationWrap}>
            {notificationsOpen ? (
              <button
                type="button"
                className={styles.notificationBackdrop}
                aria-label="Close notifications"
                onClick={() => setNotificationsOpen(false)}
              />
            ) : null}
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell className={styles.actionIcon} />
            </button>
            {notificationsOpen ? (
              <div className={styles.notificationPanel} role="dialog" aria-label="Notifications">
                <p className={styles.notificationTitle}>Notifications</p>
                <p className={styles.notificationEmpty}>You&apos;re all caught up.</p>
              </div>
            ) : null}
          </div>
        ) : null}
        {showWorkspaceActions && headerChrome.showSettings ? (
          <Link href={settingsHref} className={styles.iconButton} aria-label="Settings">
            <Settings className={styles.actionIcon} aria-hidden="true" />
          </Link>
        ) : null}
        {headerChrome.showThemeToggle ? (
          <WorkspaceThemeToggle className={styles.themeToggle} />
        ) : null}
        <ProfileMenu initials={initials} />
      </div>
    </header>
  );
}
