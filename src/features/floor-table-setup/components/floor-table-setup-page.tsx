'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';

import { tenancyContent } from '@/config/auth/tenancy';
import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { FloorGrid } from '@/features/floor-table-setup/components/floor-grid';
import { FloorToolbar } from '@/features/floor-table-setup/components/toolbar';
import { floorTableSetupCopy } from '@/features/floor-table-setup/config';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';
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
        {error ? (
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
        ) : isEmptyHub ? (
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
        ) : visibleFloors.length === 0 ? (
          <EmptyState
            title={floorTableSetupCopy.emptyFloors}
            description={floorTableSetupCopy.emptyDescription}
          />
        ) : (
          <FloorGrid floors={visibleFloors} />
        )}
      </div>
    </section>
  );
}
