'use client';

import { Alert } from '@mui/material';

import {
  type OrganisationDashboardQueryResult,
  useOrganisationDashboardQuery,
} from '@/features/dashboard/hooks/organisation-dashboard';

import { OrganisationDashboardSkeleton } from './organisation-dashboard-skeleton';
import { OrganisationDashboardView } from './organisation-dashboard-view';

type OrganisationDashboardPageProps = Readonly<{
  initialQueryString: string;
  initialPayload: OrganisationDashboardQueryResult;
}>;

export function OrganisationDashboardPage({
  initialQueryString,
  initialPayload,
}: OrganisationDashboardPageProps) {
  const { data, isLoading, isError, error } = useOrganisationDashboardQuery({
    initialQueryString,
    initialPayload,
  });

  if (isLoading && !data) {
    return <OrganisationDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <Alert severity="error" role="alert" sx={{ m: 3 }}>
        {error instanceof Error ? error.message : 'Unable to load organisation dashboard.'}
      </Alert>
    );
  }

  return (
    <OrganisationDashboardView data={data.data} source={data.source} loadError={data.loadError} />
  );
}
