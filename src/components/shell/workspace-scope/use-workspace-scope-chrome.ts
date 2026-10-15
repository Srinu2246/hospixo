'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { useTopbarCompanyBranches } from '@/components/shell/dashboard-topbar/use-topbar-company-branches';
import {
  canSwitchBranch,
  isBranchPickerPath,
  isBranchScopePath,
  isCompanyDashboardHome,
  isOrganisationPath,
  resolveBranchPickerHref,
  resolveCompanyPickerHref,
  resolveCurrentBranchName,
} from '@/components/shell/dashboard-topbar/dashboard-topbar-scope';
import { isCaptainFlowPath } from '@/config/shell/flow-paths';
import { workspaceMobileChromeCopy } from '@/config/shell/workspace-mobile-chrome';
import { showsWorkspaceHeaderActions } from '@/config/shell/header-chrome';
import { useAuth } from '@/context/auth';
import { useDashboardData } from '@/context/dashboard-data';
import { useDashboardFilter } from '@/context/dashboard-filter';
import type { DashboardOutlet } from '@/features/dashboard/types';

export type WorkspaceScopeChromeModel = Readonly<{
  eyebrow: string;
  /** When true, show company picker (organisation home). */
  organisationMode: boolean;
  /** Fixed branch label — no dropdown. */
  readOnlyBranchName: string | null;
  companies: readonly { id: string; name: string }[];
  selectedCompanyId: string;
  outlets: readonly DashboardOutlet[];
  effectiveOutletValue: string;
  onCompanyChange: (companyId: string) => void;
  onOutletChange: (outletId: string) => void;
}>;

export function useWorkspaceScopeChrome(showOutlets: boolean): WorkspaceScopeChromeModel | null {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { outletId, setOutletId } = useDashboardFilter();
  const { data, companies = [] } = useDashboardData();

  const branchScope = isBranchScopePath(pathname);
  const captainScope = isCaptainFlowPath(pathname);
  const branchPicker = isBranchPickerPath(pathname);
  const organisationDashboard = isOrganisationPath(pathname);
  const showWorkspaceActions = showsWorkspaceHeaderActions(pathname);
  const companyId = searchParams?.get('company_id') ?? '';
  const companyDashboardHome = isCompanyDashboardHome(pathname);
  const outletFromUrl = searchParams?.get('outlet');
  const effectiveOutletId = outletFromUrl ?? (companyDashboardHome ? 'all' : outletId);

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

  const currentBranchName = resolveCurrentBranchName(
    outlets,
    effectiveOutletId,
    user,
    captainScope,
  );

  const effectiveOutletValue =
    outlets.find((o) => o.id === effectiveOutletId)?.id ??
    (branchScope ? (outlets.find((o) => o.id !== 'all')?.id ?? 'all') : (outlets[0]?.id ?? 'all'));

  const selectedCompany = companies.find((company) => company.id === companyId);

  const outletLabel = captainScope
    ? 'Branch'
    : showWorkspaceActions
      ? 'Outlets'
      : branchScope
        ? 'Branch'
        : branchPicker
          ? 'Branches'
          : 'Outlets';

  const eyebrow = organisationDashboard
    ? workspaceMobileChromeCopy.companiesEyebrow
    : selectedCompany && companyId
      ? `Company: ${selectedCompany.name}`
      : outletLabel;

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

  function handleCompanyChange(nextCompanyId: string) {
    if (nextCompanyId) router.push(resolveCompanyPickerHref(nextCompanyId));
  }

  if (!showOutlets) return null;

  const readOnlyBranchName =
    captainScope || (branchScope && !canSwitchBranch(user)) ? currentBranchName : null;

  return {
    eyebrow,
    organisationMode: organisationDashboard,
    readOnlyBranchName,
    companies,
    selectedCompanyId: selectedCompany?.id ?? '',
    outlets,
    effectiveOutletValue,
    onCompanyChange: handleCompanyChange,
    onOutletChange: handleOutletChange,
  };
}
