'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Box, IconButton, MenuItem, Popover, Select, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { Bell, Bot, ChevronDown, LayoutGrid, MapPin, Settings } from 'lucide-react';

import { headerChrome, showsWorkspaceHeaderActions } from '@/config/shell/header-chrome';
import { isCaptainFlowPath } from '@/config/shell/flow-paths';
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
  canSwitchBranch,
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

const topbarSelectSx = {
  height: 32,
  minWidth: 160,
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'text.primary',
  borderRadius: '0.5rem',
  bgcolor: 'transparent',
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover': {
    bgcolor: 'transparent',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  '&.Mui-focused': {
    bgcolor: 'transparent',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    py: 0.5,
    pl: 1,
    pr: 3.5,
  },
};

const topbarMenuProps = {
  slotProps: {
    paper: {
      elevation: 4,
      sx: {
        mt: 0.75,
        borderRadius: '0.75rem',
        border: 1,
        borderColor: 'divider',

        boxShadow: (theme: Theme) =>
          theme.palette.mode === 'dark'
            ? '0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)'
            : '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06)',
        maxHeight: 320,
        py: 0.5,
        '& .MuiMenuItem-root': {
          fontSize: '0.8125rem',
          fontWeight: 500,
          borderRadius: '0.375rem',
          mx: 0.75,
          my: 0.25,
          py: 0.75,
          px: 1.25,
          transition: 'background-color 0.15s ease',
          '&.Mui-selected': {
            bgcolor: 'action.selected',
            fontWeight: 600,
            color: 'primary.main',
          },
          '&.Mui-selected:hover': {
            bgcolor: 'action.selected',
          },
          '&:hover': {
            bgcolor: 'action.hover',
          },
        },
      },
    },
  },
};

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
  const captainScope = isCaptainFlowPath(pathname);
  const branchPicker = isBranchPickerPath(pathname);
  const organisationDashboard = isOrganisationPath(pathname);
  const showWorkspaceActions = showsWorkspaceHeaderActions(pathname);
  const companyId = searchParams?.get('company_id') ?? '';
  const companyDashboardHome = isCompanyDashboardHome(pathname);
  const outletFromUrl = searchParams?.get('outlet');
  const effectiveOutletId = outletFromUrl ?? (companyDashboardHome ? 'all' : outletId);
  const selectedCompany = companies.find((company) => company.id === companyId);
  const [notificationsAnchor, setNotificationsAnchor] = useState<HTMLElement | null>(null);

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
  const settingsHref = resolveWorkspaceSettingsHref(pathname);

  const outletLabel = captainScope
    ? 'Branch'
    : showWorkspaceActions
      ? 'Outlets'
      : branchScope
        ? 'Branch'
        : branchPicker
          ? 'Branches'
          : 'Outlets';

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'AK';

  const effectiveOutletValue =
    outlets.find((o) => o.id === effectiveOutletId)?.id ??
    (branchScope ? (outlets.find((o) => o.id !== 'all')?.id ?? 'all') : (outlets[0]?.id ?? 'all'));

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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 0.25,
              minWidth: 0,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                lineHeight: 1.1,
              }}
            >
              {organisationDashboard
                ? 'Companies'
                : selectedCompany && companyId
                  ? `Company: ${selectedCompany.name}`
                  : outletLabel}
            </Typography>
            {captainScope || (branchScope && !canSwitchBranch(user)) ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  height: 32,
                  minWidth: 150,
                  maxWidth: 'min(20rem, 50vw)',
                  px: 0.5,
                  borderRadius: '0.5rem',
                  border: 'none',
                  bgcolor: 'transparent',
                }}
              >
                <MapPin size={14} style={{ flexShrink: 0, opacity: 0.75 }} />
                <Typography
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {currentBranchName}
                </Typography>
              </Box>
            ) : organisationDashboard ? (
              <Select
                size="small"
                displayEmpty
                value={selectedCompany ? selectedCompany.id : ''}
                onChange={(event) => handleCompanyChange(event.target.value as string)}
                startAdornment={
                  <MapPin size={14} style={{ marginRight: 6, flexShrink: 0, opacity: 0.75 }} />
                }
                IconComponent={(props) => (
                  <ChevronDown
                    size={14}
                    {...props}
                    style={{
                      position: 'absolute',
                      right: 8,
                      pointerEvents: 'none',
                      ...props.style,
                    }}
                  />
                )}
                renderValue={(val) => {
                  if (!val) {
                    return (
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Select company
                      </Box>
                    );
                  }
                  const comp = companies.find((c) => c.id === val);
                  return comp ? comp.name : val;
                }}
                sx={topbarSelectSx}
                MenuProps={topbarMenuProps}
                aria-label="Select company"
              >
                <MenuItem value="" disabled sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  Select company
                </MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Select
                size="small"
                value={effectiveOutletValue}
                onChange={(event) => handleOutletChange(event.target.value as string)}
                startAdornment={
                  <MapPin size={14} style={{ marginRight: 6, flexShrink: 0, opacity: 0.75 }} />
                }
                IconComponent={(props) => (
                  <ChevronDown
                    size={14}
                    {...props}
                    style={{
                      position: 'absolute',
                      right: 8,
                      pointerEvents: 'none',
                      ...props.style,
                    }}
                  />
                )}
                sx={topbarSelectSx}
                MenuProps={topbarMenuProps}
                aria-label={branchPicker ? 'Select branch' : 'Select outlet'}
              >
                {outlets.map((outlet) => (
                  <MenuItem key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Box>
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
          <Box sx={{ position: 'relative' }}>
            <IconButton
              size="small"
              onClick={(e) => setNotificationsAnchor(notificationsAnchor ? null : e.currentTarget)}
              aria-label="Notifications"
              aria-expanded={Boolean(notificationsAnchor)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: '0.5rem',
                border: 1,
                borderColor: 'divider',
                bgcolor: Boolean(notificationsAnchor) ? 'action.selected' : 'transparent',
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              <Bell size={16} />
            </IconButton>
            <Popover
              open={Boolean(notificationsAnchor)}
              anchorEl={notificationsAnchor}
              onClose={() => setNotificationsAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  elevation: 4,
                  sx: {
                    mt: 1,
                    minWidth: 260,
                    p: 2,
                    borderRadius: '0.75rem',
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)'
                        : '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06)',
                  },
                },
              }}
            >
              <Typography
                sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', mb: 0.5 }}
              >
                Notifications
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                You&apos;re all caught up.
              </Typography>
            </Popover>
          </Box>
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
