'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

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
    if (validLevel === 'company') return 'All Outlets';
    if (validLevel === 'branch') return 'Downtown Central';
    return 'All Companies';
  });
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleLevelChange = (newLevel: DashboardLevel) => {
    setCurrentLevel(newLevel);
    if (newLevel === 'organization') setSelectedScope('All Companies');
    if (newLevel === 'company') setSelectedScope('All Outlets');
    if (newLevel === 'branch') setSelectedScope('Downtown Central');
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
          options: [
            'All Companies',
            'Al Baik Foods Ltd',
            'Spice Garden Group',
            'Urban Bites Co',
            'Fresh Catch Ltd',
            'Golden Wok Chain',
          ],
        };
      case 'company':
        return {
          title: 'All Outlet Statistics',
          entityLabel: 'Outlets',
          options: [
            'All Outlets',
            'Downtown Central',
            'Westside Mall',
            'Uptown Terrace',
            'Harbor Front',
            'North Station',
          ],
        };
      case 'branch':
        return {
          title: 'Sales Statistics',
          entityLabel: 'Branch',
          options: ['Downtown Central', 'Westside Mall', 'Uptown Terrace'],
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
      {/* 1. Universal Dashboard Header */}
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

      {/* 2. Level Content with Smooth Transition */}
      <Box sx={{ width: '100%' }}>
        {currentLevel === 'organization' && (
          <Fade in={currentLevel === 'organization'} timeout={300}>
            <Box>
              <OrganizationDashboard />
            </Box>
          </Fade>
        )}

        {currentLevel === 'company' && (
          <Fade in={currentLevel === 'company'} timeout={300}>
            <Box>
              <CompanyDashboard />
            </Box>
          </Fade>
        )}

        {currentLevel === 'branch' && (
          <Fade in={currentLevel === 'branch'} timeout={300}>
            <Box>
              <BranchSalesDashboard />
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
