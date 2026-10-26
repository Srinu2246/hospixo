'use client';

import React, { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { normalizeRoleKey, type SidebarContext } from '@/app/sidebar';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Toast } from '@/components/shared/ui/Toast';
import { useDashboardDirectory } from '@/lib/hooks/dashboard/useDashboardDirectory';
import { useSidebarStore } from '@/stores/sidebarStore';

import type { DashboardLevel } from '../types/dashboard.types';
import { DashboardHeader } from './shared/DashboardHeader';
import { OrganizationDashboard } from './organization/OrganizationDashboard';
import { CompanyDashboard } from './company/CompanyDashboard';
import { BranchSalesDashboard } from './branch/BranchSalesDashboard';
import { LowStockAlertBanner } from './branch/LowStockAlertBanner';
import { FeatureGate, ExampleFeatureUsage } from '@/integrations/growthbook';

export interface DashboardScreenProps {
  /** Fallback when role/path cannot be resolved. */
  initialLevel?: DashboardLevel;
}

/** Role → dashboard catalog. Path can still drill org → company/branch. */
function dashboardLevelFromRole(role?: string | null): DashboardLevel {
  const key = normalizeRoleKey(role || '');
  if (key === 'organization' || key === 'super_admin') return 'organization';
  if (key === 'company') return 'company';
  return 'branch';
}

function normalizeSlug(value: string): string {
  return decodeURIComponent(value).trim().toLowerCase();
}

function dashboardLevelFromPath(
  pathname: string,
  context?: Pick<
    SidebarContext,
    | 'organizationSlug'
    | 'organizationName'
    | 'companySlug'
    | 'companyName'
    | 'branchSlug'
    | 'branchName'
  >,
): DashboardLevel | null {
  if (!pathname) return null;
  if (pathname === '/company' || pathname.startsWith('/company/')) return 'company';
  if (
    pathname === '/branch-manager' ||
    pathname.startsWith('/branch-manager/') ||
    pathname === '/branch' ||
    pathname.startsWith('/branch/')
  ) {
    return 'branch';
  }
  if (pathname === '/organization' || pathname.startsWith('/organization/')) return 'organization';

  const scopedDashboard = pathname.match(/^\/([^/]+)\/dashboard\/?$/);
  if (scopedDashboard) {
    const segment = normalizeSlug(scopedDashboard[1]);
    const orgSlug = context?.organizationSlug ?? context?.organizationName;
    const companySlug = context?.companySlug ?? context?.companyName;
    const branchSlug = context?.branchSlug ?? context?.branchName;

    if (orgSlug && segment === normalizeSlug(String(orgSlug))) return 'organization';
    if (companySlug && segment === normalizeSlug(String(companySlug))) return 'company';
    if (branchSlug && segment === normalizeSlug(String(branchSlug))) return 'branch';
    if (segment === 'organization') return 'organization';
    if (segment === 'company') return 'company';
    if (segment === 'branch-manager' || segment === 'branch') return 'branch';
    return 'branch';
  }

  return null;
}

const DEFAULT_SCOPE_BY_LEVEL: Record<DashboardLevel, string> = {
  organization: 'All Companies',
  company: 'All Outlets',
  branch: 'All Outlets',
};

/**
 * Role-scoped dashboard (org / company / branch).
 * Level comes from the signed-in role and URL scope — no testing level switcher.
 */
export function DashboardScreen({
  initialLevel = 'organization',
}: Readonly<DashboardScreenProps> = {}) {
  const pathname = usePathname() ?? '';
  const role = useSidebarStore((state) => state.role);
  const sidebarContext = useSidebarStore((state) => state.context);
  const organizationId = useSidebarStore(
    (state) => state.account?.org_id ?? state.context.organizationId,
  );
  const companyId = useSidebarStore(
    (state) => state.context.companyId ?? state.account?.company_id ?? undefined,
  );

  const currentLevel = useMemo(() => {
    const fromPath = dashboardLevelFromPath(pathname, sidebarContext);
    const fromRole = dashboardLevelFromRole(role);
    // Path wins when drilling into a lower catalog (e.g. org → /company/dashboard).
    return fromPath ?? fromRole ?? initialLevel;
  }, [pathname, role, initialLevel, sidebarContext]);

  const [selectedScopeByLevel, setSelectedScopeByLevel] =
    useState<Record<DashboardLevel, string>>(DEFAULT_SCOPE_BY_LEVEL);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const selectedScope = selectedScopeByLevel[currentLevel];

  const directoryCompanyId = currentLevel === 'organization' ? undefined : companyId;
  const directory = useDashboardDirectory(organizationId, {
    companyId: directoryCompanyId,
    dashboardLevel: currentLevel,
  });

  const handleExportData = () => {
    setToastMsg(`Exporting ${currentLevel} statistics data to CSV/Excel...`);
    setToastOpen(true);
  };

  const scopeDetails = useMemo(() => {
    const companies = directory.data?.companies ?? [];

    switch (currentLevel) {
      case 'organization':
        return {
          title: 'All Companies Statistics',
          entityLabel: 'Companies',
          options:
            companies.length > 0
              ? ['All Companies', ...companies.map((company) => company.name)]
              : ['All Companies'],
        };
      case 'company':
        return {
          title: 'All Branches Statistics',
          entityLabel: 'Outlets',
          options: [],
        };
      case 'branch':
        return {
          title: 'Sales Statistics',
          entityLabel: 'Branch',
          options: [],
        };
    }
  }, [currentLevel, directory.data]);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        pt: 0.5,
      }}
    >
      {/* 1. Universal Dashboard Header (Visible above 1050px; hidden up to 1050px on branch view to match tablet design) */}
      <Box
        sx={{
          display: currentLevel === 'branch' ? 'none' : 'block',
          '@media (min-width: 1051px)': {
            display: 'block',
          },
        }}
      >
        <DashboardHeader
          title={scopeDetails.title}
          scopeEntityLabel={scopeDetails.entityLabel}
          scopeOptions={scopeDetails.options}
          selectedScope={selectedScope}
          onScopeChange={(scope) =>
            setSelectedScopeByLevel((prev) => ({ ...prev, [currentLevel]: scope }))
          }
          onExportClick={handleExportData}
          topBanner={currentLevel === 'branch' ? <LowStockAlertBanner /> : undefined}
        />
      </Box>

      {directory.isError ? (
        <AlertMessage
          variant="error"
          title="Unable to load dashboard"
          message={
            directory.error instanceof Error
              ? directory.error.message
              : 'The companies and branches request failed.'
          }
        />
      ) : null}

      <Box sx={{ width: '100%' }}>
        {currentLevel === 'organization' && (
          <Fade in timeout={300}>
            <Box>
              <OrganizationDashboard
                companies={directory.data?.companies}
                branches={directory.data?.branches}
                isLoading={directory.isLoading}
              />
            </Box>
          </Fade>
        )}

        {currentLevel === 'company' && (
          <Fade in timeout={300}>
            <Box>
              <CompanyDashboard
                branches={directory.data?.branches}
                isLoading={directory.isLoading}
              />
            </Box>
          </Fade>
        )}

        {currentLevel === 'branch' && (
          <Fade in timeout={300}>
            <Box>
              <BranchSalesDashboard onExportClick={handleExportData} />
            </Box>
          </Fade>
        )}

        <FeatureGate flag="new-test-generation">
          <Box sx={{ mt: 3 }}>
            <ExampleFeatureUsage />
          </Box>
        </FeatureGate>
      </Box>

      <Toast
        open={toastOpen}
        message={toastMsg}
        severity="success"
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
}
