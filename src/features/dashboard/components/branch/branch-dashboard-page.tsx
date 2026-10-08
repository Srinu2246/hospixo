'use client';

import { Alert } from '@mui/material';

import {
  type BranchDashboardQueryResult,
  useBranchDashboardQuery,
} from '@/features/dashboard/hooks/branch-dashboard';

import { BranchDashboardSkeleton } from './skeleton';
import { BranchDashboardView } from './branch-dashboard-view';

type BranchDashboardPageProps = Readonly<{
  initialQueryString: string;
  initialPayload: BranchDashboardQueryResult;
}>;

export function BranchDashboardPage({
  initialQueryString,
  initialPayload,
}: BranchDashboardPageProps) {
  const { data, isLoading, isError, error } = useBranchDashboardQuery({
    initialQueryString,
    initialPayload,
  });

  if (isLoading && !data) {
    return <BranchDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <Alert severity="error" role="alert" sx={{ m: 3 }}>
        {error instanceof Error ? error.message : 'Unable to load branch dashboard.'}
      </Alert>
    );
  }

  return <BranchDashboardView data={data.data} source={data.source} loadError={data.loadError} />;
}
