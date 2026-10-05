'use client';

import '@/features/dashboard/styles/organisation-dashboard.css';

import { Alert } from '@mui/material';

import { useOrganisationDashboardQuery } from '@/features/dashboard/hooks/organisation-dashboard';

import { OrganisationDashboardSkeleton } from './organisation-dashboard-skeleton';
import { OrganisationDashboardView } from './organisation-dashboard-view';

export function OrganisationDashboardPage() {
  const { data, isLoading, isError, error } = useOrganisationDashboardQuery();

  if (isLoading) {
    return <OrganisationDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <Alert severity="error" role="alert">
        {error instanceof Error ? error.message : 'Unable to load organisation dashboard.'}
      </Alert>
    );
  }

  return (
    <OrganisationDashboardView data={data.data} source={data.source} loadError={data.loadError} />
  );
}
