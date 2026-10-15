'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { FloorDetailTabs } from '@/features/floor-table-setup/components/detail/floor-detail-tabs';
import { FloorEditTab } from '@/features/floor-table-setup/components/detail/floor-edit-tab';
import { FloorInformation } from '@/features/floor-table-setup/components/detail/floor-information';
import { FloorStatCards } from '@/features/floor-table-setup/components/detail/floor-stat-cards';
import { HistoryTab } from '@/features/floor-table-setup/components/detail/history-tab';
import { RecentActivity } from '@/features/floor-table-setup/components/detail/recent-activity';
import { SectionsOverview } from '@/features/floor-table-setup/components/detail/sections-overview';
import { SectionsTab } from '@/features/floor-table-setup/components/detail/sections-tab';
import { TablesTab } from '@/features/floor-table-setup/components/detail/tables-tab';
import { detailCopy, floorTableSetupCopy } from '@/features/floor-table-setup/config';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';
import {
  computeFloorStatsFromTables,
  floorTableSetupPath,
  parseFloorDetailTab,
  tablesForFloor,
} from '@/features/floor-table-setup/lib';
import type { Floor, FloorDetailTabId } from '@/features/floor-table-setup/types/floor-table-setup';

import { cn } from '@/lib/utils';

import innerStyles from '../shared/workspace-page-inner.module.css';
import wizardStyles from '../wizard/wizard.module.css';
import styles from './floor-detail-page.module.css';

type FloorDetailPageProps = Readonly<{
  floorId: string;
  initialFloor?: Floor;
  error?: string | null;
}>;

export function FloorDetailPage({ floorId, initialFloor, error = null }: FloorDetailPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const outletId = useFloorBranchOutletId();
  const tab = parseFloorDetailTab(searchParams.get('tab'));
  const floor = initialFloor;
  const tables = useMemo(() => (initialFloor ? tablesForFloor(initialFloor) : []), [initialFloor]);
  const overviewStats = useMemo(() => {
    if (!floor) return null;
    return tables.length > 0 ? computeFloorStatsFromTables(tables, floor.sections) : floor.stats;
  }, [floor, tables]);

  function setTab(next: FloorDetailTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'overview') params.delete('tab');
    else params.set('tab', next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  if (!floor) {
    return (
      <EmptyState
        variant={error ? 'error' : 'hero'}
        title={error ? detailCopy.errorTitle : detailCopy.missingFloorTitle}
        description={error ?? detailCopy.missingFloorDescription}
        action={
          <div className={styles.errorActions}>
            {error ? (
              <button
                type="button"
                className={wizardStyles.primary}
                onClick={() => router.refresh()}
              >
                {detailCopy.retry}
              </button>
            ) : null}
            <Link href={floorTableSetupPath(outletId)} className={wizardStyles.primary}>
              {detailCopy.goBack}
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <section className={styles.page} aria-label={floor.name ?? floorId}>
      <div className={cn(innerStyles.pageInner, styles.floorDetailInner)}>
        <FloorDetailTabs value={tab} onChange={setTab} />
        <div className={styles.titleRow}>
          <Link
            href={floorTableSetupPath(outletId)}
            className={styles.back}
            aria-label={floorTableSetupCopy.backToFloors}
          >
            <ArrowLeft className={styles.backIcon} aria-hidden="true" />
          </Link>
          <h1 className={styles.title}>{floor.name}</h1>
        </div>

        <div className={styles.tabPane}>
          {tab === 'overview' ? (
            <div className={styles.stack}>
              <FloorInformation floor={floor} />
              <SectionsOverview
                sections={floor.sections}
                tables={tables}
                outletLabel={floor.branch || floor.name}
              />
              <FloorStatCards stats={overviewStats ?? floor.stats} />
              <RecentActivity items={floor.activity} onViewAll={() => setTab('history')} />
            </div>
          ) : null}
          {tab === 'floor' ? (
            <FloorEditTab floor={floor} onBack={() => setTab('overview')} />
          ) : null}
          {tab === 'sections' ? <SectionsTab floor={floor} tables={tables} /> : null}
          {tab === 'tables' ? <TablesTab floor={floor} tables={tables} /> : null}
          {tab === 'history' ? <HistoryTab floor={floor} /> : null}
        </div>
      </div>
    </section>
  );
}
