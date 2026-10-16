'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { useDashboardDirectory } from '@/lib/hooks/dashboard/useDashboardDirectory';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Toast } from '@/components/shared/ui/Toast';
import type { DashboardLevel } from '../types/dashboard.types';
import { DashboardHeader } from './shared/DashboardHeader';
import { OrganizationDashboard } from './organization/OrganizationDashboard';
import { CompanyDashboard } from './company/CompanyDashboard';
import { BranchSalesDashboard } from './branch/BranchSalesDashboard';
import { LowStockAlertBanner } from './branch/LowStockAlertBanner';

export interface DashboardScreenProps {
  initialLevel?: DashboardLevel;
  hideLevelSwitcher?: boolean;
}

export function DashboardScreen({
  initialLevel = 'organization',
  hideLevelSwitcher = false,
}: Readonly<DashboardScreenProps>) {
  const searchParams = useSearchParams();
  const queryLevel = searchParams.get('level') as DashboardLevel | null;
  const validLevel =
    queryLevel && ['organization', 'company', 'branch'].includes(queryLevel)
      ? queryLevel
      : initialLevel;

  const [currentLevel, setCurrentLevel] = useState<DashboardLevel>(validLevel);
  const [selectedScope, setSelectedScope] = useState(() => {
    if (validLevel === 'company' || validLevel === 'branch') return 'All Outlets';
    return 'All Companies';
  });
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const organizationId = useSidebarStore(
    (state) => state.account?.org_id ?? state.context.organizationId,
  );
  const companyId = useSidebarStore(
    (state) => state.context.companyId ?? state.account?.company_id ?? undefined,
  );
  const directoryCompanyId = currentLevel === 'organization' ? undefined : companyId;
  const directory = useDashboardDirectory(organizationId, {
    companyId: directoryCompanyId,
    dashboardLevel: currentLevel,
  });
  const companies = directory.data?.companies ?? [];
  const branches = directory.data?.branches ?? [];

  const handleLevelChange = (newLevel: DashboardLevel) => {
    setCurrentLevel(newLevel);
    if (newLevel === 'organization') setSelectedScope('All Companies');
    if (newLevel === 'company') setSelectedScope('All Outlets');
    if (newLevel === 'branch') setSelectedScope('All Outlets');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('level', newLevel);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleExportData = () => {
    setToastMsg(`Exporting ${currentLevel} statistics data to CSV/Excel...`);
    setToastOpen(true);
  };

  const getScopeDetails = () => {
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
          title: 'All Outlet Statistics',
          entityLabel: 'Outlets',
          options:
            branches.length > 0
              ? ['All Outlets', ...branches.map((branch) => branch.name)]
              : ['All Outlets'],
        };
      case 'branch':
        return {
          title: 'Sales Statistics',
          entityLabel: 'Branch',
          options:
            branches.length > 0
              ? ['All Outlets', ...branches.map((branch) => branch.name)]
              : ['All Outlets'],
        };
    }
  };

  const scopeDetails = getScopeDetails();

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
          currentLevel={currentLevel}
          onLevelChange={handleLevelChange}
          title={scopeDetails.title}
          scopeEntityLabel={scopeDetails.entityLabel}
          scopeOptions={scopeDetails.options}
          selectedScope={selectedScope}
          onScopeChange={setSelectedScope}
          onExportClick={handleExportData}
          hideLevelSwitcher={hideLevelSwitcher}
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

      {/* 2. Level Content with Smooth Transition */}
      <Box sx={{ width: '100%' }}>
        {currentLevel === 'organization' && (
          <Fade in={currentLevel === 'organization'} timeout={300}>
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
          <Fade in={currentLevel === 'company'} timeout={300}>
            <Box>
              <CompanyDashboard
                branches={directory.data?.branches}
                isLoading={directory.isLoading}
              />
            </Box>
          </Fade>
        )}

        {currentLevel === 'branch' && (
          <Fade in={currentLevel === 'branch'} timeout={300}>
            <Box>
              <BranchSalesDashboard onExportClick={handleExportData} />
            </Box>
          </Fade>
        )}
      </Box>

      {/* Export Feedback Toast */}
      <Toast
        open={toastOpen}
        message={toastMsg}
        severity="success"
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
}
