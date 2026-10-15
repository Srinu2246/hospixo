'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { tenancyContent } from '@/config/auth/tenancy';
import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { FloorGrid } from '@/features/floor-table-setup/components/floor-grid';
import { FloorToolbar } from '@/features/floor-table-setup/components/toolbar';
import {
  FloorSetupCompactPageHeader,
  FloorSetupCompactShell,
} from '@/features/floor-table-setup/components/shared/compact-layout';
import { floorTableSetupCopy } from '@/features/floor-table-setup/config';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';
import { useFloorTableSetupResponsive } from '@/features/floor-table-setup/hooks/use-responsive-layout';
import {
  filterFloors,
  floorCreatePath,
  floorTableSetupPath,
  isPasswordChangeRequiredError,
  profileChangePasswordPath,
} from '@/features/floor-table-setup/lib';
import type {
  Floor,
  FloorSortId,
  FloorStatusFilter,
} from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './floor-table-setup-page.module.css';
import innerStyles from './shared/workspace-page-inner.module.css';
import wizardStyles from './wizard/wizard.module.css';

type FloorTableSetupPageProps = Readonly<{
  floors: readonly Floor[];
  error?: string | null;
  branchId?: number | null;
}>;

export function FloorTableSetupPage({
  floors,
  error = null,
  branchId = null,
}: FloorTableSetupPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outletId = useFloorBranchOutletId();
  const { isCompactLayout } = useFloorTableSetupResponsive();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<FloorSortId>('recent');
  const [status, setStatus] = useState<FloorStatusFilter>('all');

  const activeBranchId = outletId ?? (branchId != null ? String(branchId) : null);
  const isBranchMissing = error === tenancyContent.branchRequiredForFloors;

  const visibleFloors = useMemo(
    () => filterFloors({ floors, query, status, sort }),
    [floors, query, status, sort],
  );

  const isEmptyHub = floors.length === 0 && !query && !error;

  useEffect(() => {
    if (!outletId) return;
    if (searchParams.get('outlet') || searchParams.get('branch_id')) return;
    router.replace(floorTableSetupPath(outletId));
  }, [outletId, router, searchParams]);

  function openWizard() {
    router.push(floorCreatePath(activeBranchId));
  }

  function renderHubContent() {
    if (error) {
      return (
        <EmptyState
          variant="error"
          title={floorTableSetupCopy.loadErrorTitle}
          description={error}
          action={
            isPasswordChangeRequiredError(error) ? (
              <button
                type="button"
                className={wizardStyles.primary}
                onClick={() =>
                  router.push(profileChangePasswordPath(floorTableSetupPath(outletId)))
                }
              >
                {floorTableSetupCopy.changePassword}
              </button>
            ) : (
              <button
                type="button"
                className={wizardStyles.primary}
                onClick={() => (isBranchMissing ? openWizard() : router.refresh())}
              >
                {isBranchMissing ? floorTableSetupCopy.selectBranch : floorTableSetupCopy.retry}
              </button>
            )
          }
        />
      );
    }

    if (isEmptyHub) {
      if (isCompactLayout) {
        return (
          <Stack
            spacing={3}
            sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', py: 4 }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
              }}
              aria-hidden
            >
              <Building2 size={32} />
            </Box>
            <Stack spacing={1} sx={{ maxWidth: 360, px: 1, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {floorTableSetupCopy.emptyHubTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {floorTableSetupCopy.emptyHubDescription}
              </Typography>
            </Stack>
          </Stack>
        );
      }

      return (
        <EmptyState
          variant="hero"
          title={floorTableSetupCopy.emptyHubTitle}
          description={floorTableSetupCopy.emptyHubDescription}
          icon={<Building2 className={wizardStyles.icon} />}
          action={
            <button type="button" className={wizardStyles.primary} onClick={openWizard}>
              <Plus className={wizardStyles.icon} aria-hidden="true" />
              {floorTableSetupCopy.createFloor}
            </button>
          }
        />
      );
    }

    if (visibleFloors.length === 0) {
      return (
        <EmptyState
          title={floorTableSetupCopy.emptyFloors}
          description={floorTableSetupCopy.emptyDescription}
        />
      );
    }

    return <FloorGrid floors={visibleFloors} />;
  }

  if (isCompactLayout) {
    return (
      <section className={styles.page} aria-label={floorTableSetupCopy.compactListTitle}>
        <FloorSetupCompactShell
          header={
            <FloorSetupCompactPageHeader
              title={floorTableSetupCopy.compactListTitle}
              subtitle={floorTableSetupCopy.compactListSubtitle}
              action={
                <Button
                  variant="contained"
                  size="small"
                  onClick={openWizard}
                  sx={{ minHeight: 44, whiteSpace: 'nowrap' }}
                >
                  {floorTableSetupCopy.createFloor}
                </Button>
              }
            />
          }
        >
          <FloorToolbar
            compact
            hideCreateButton
            query={query}
            sort={sort}
            status={status}
            showStatus={!isEmptyHub}
            onQueryChange={setQuery}
            onSortChange={setSort}
            onStatusChange={setStatus}
            onCreate={openWizard}
          />
          {renderHubContent()}
        </FloorSetupCompactShell>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-label={floorTableSetupCopy.listTitle}>
      <div className={innerStyles.pageInner}>
        <FloorToolbar
          query={query}
          sort={sort}
          status={status}
          showStatus={!isEmptyHub}
          onQueryChange={setQuery}
          onSortChange={setSort}
          onStatusChange={setStatus}
          onCreate={openWizard}
        />
        {renderHubContent()}
      </div>
    </section>
  );
}
