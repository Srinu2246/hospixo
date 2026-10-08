'use client';

import { Alert } from '@mui/material';

import {
  type CompanyDashboardQueryResult,
  useCompanyDashboardQuery,
} from '@/features/dashboard/hooks/company-dashboard';

import { CompanyDashboardSkeleton } from './skeleton';
import { CompanyDashboardView } from './company-dashboard-view';

type CompanyDashboardPageProps = Readonly<{
  initialQueryString: string;
  initialPayload: CompanyDashboardQueryResult;
}>;

export function CompanyDashboardPage({
  initialQueryString,
  initialPayload,
}: CompanyDashboardPageProps) {
  const { data, isLoading, isError, error } = useCompanyDashboardQuery({
    initialQueryString,
    initialPayload,
  });

  if (isLoading && !data) {
    return <CompanyDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <Alert severity="error" role="alert" sx={{ m: 3 }}>
        {error instanceof Error ? error.message : 'Unable to load company dashboard.'}
      </Alert>
    );
  }

  return <CompanyDashboardView data={data.data} source={data.source} loadError={data.loadError} />;
}
