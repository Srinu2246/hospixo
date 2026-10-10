'use client';

import { useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useAuth } from '@/context/auth';
import { useDashboardFilter } from '@/context/dashboard-filter';
import { resolveBranchOutletId } from '@/lib/api/branch-tenancy';
import {
  MenuAvailability,
  type ChangedMenuItem,
} from '@/features/pos/menu-availability/components/menu-availability';
import {
  useBatchUpdateBranchMenuAvailabilityMutation,
  useBranchMenuAvailabilityQuery,
} from '@/features/pos/menu-availability/hooks/use-branch-menu-availability';

export function BranchMenuAvailabilityScreen() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { activeBranchId } = useDashboardFilter();

  const resolvedBranchId =
    resolveBranchOutletId(
      searchParams.get('outlet') ?? searchParams.get('branch_id'),
      activeBranchId == null ? null : String(activeBranchId),
    ) ?? (user?.branch_id != null ? Number(user.branch_id) : null);

  const { data, isLoading, isError, error, refetch } = useBranchMenuAvailabilityQuery(
    resolvedBranchId,
    resolvedBranchId != null,
  );

  const batchMutation = useBatchUpdateBranchMenuAvailabilityMutation(
    resolvedBranchId,
    data?.assignmentId ?? 'active',
  );

  if (resolvedBranchId == null) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          Please select a branch to view and manage menu availability.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: '100%',
          py: { xs: 3, md: 5 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ width: '40%' }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="90%" height={20} />
          </Box>
          <Skeleton variant="rounded" width={180} height={32} />
        </Box>
        <Skeleton variant="rounded" width="100%" height={40} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={80} height={36} />
          <Skeleton variant="rounded" width={120} height={36} />
          <Skeleton variant="rounded" width={100} height={36} />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" height={80} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Skeleton
            variant="rounded"
            width={260}
            height={360}
            sx={{ display: { xs: 'none', md: 'block' } }}
          />
          <Skeleton variant="rounded" sx={{ flex: 1 }} height={360} />
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="error">
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Unable to load branch menu availability
          </Typography>
          <Typography variant="body2">
            {error instanceof Error ? error.message : 'An error occurred while fetching the menu.'}
          </Typography>
        </Alert>
        <Button variant="outlined" onClick={() => refetch()} sx={{ alignSelf: 'flex-start' }}>
          Retry
        </Button>
      </Box>
    );
  }

  const handleSave = async (changed: ChangedMenuItem[]) => {
    if (!resolvedBranchId) return;

    // Filter items that have override IDs or item IDs to update
    const updates = changed
      .filter((item) => item.overrideId || item.id)
      .map((item) => ({
        itemOverrideId: item.overrideId ?? item.id,
        isAvailable: item.available,
      }))
      .filter((update) => update.itemOverrideId.length > 0);

    if (updates.length > 0) {
      await batchMutation.mutateAsync(updates);
    }
  };

  return (
    <MenuAvailability
      key={`menu-avail-${resolvedBranchId}-${data?.assignmentId ?? 'active'}`}
      categories={data?.categories ?? []}
      items={data?.items ?? []}
      onSave={handleSave}
      isSaving={batchMutation.isPending}
    />
  );
}
