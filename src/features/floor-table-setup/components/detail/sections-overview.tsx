'use client';

import { useState } from 'react';

import { SectionQrDialog } from '@/features/floor-table-setup/components/section-qr/section-qr-dialog';
import { SectionCard } from '@/features/floor-table-setup/components/detail/section-card';
import { floorTableSetupCopy } from '@/features/floor-table-setup/config';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';
import { sectionStatsFromTables, userFacingSections } from '@/features/floor-table-setup/lib';
import type {
  FloorSection,
  FloorTableItem,
} from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './floor-detail-page.module.css';

type SectionsOverviewProps = Readonly<{
  sections: readonly FloorSection[];
  tables?: readonly FloorTableItem[];
  outletLabel: string;
}>;

export function SectionsOverview({ sections, tables = [], outletLabel }: SectionsOverviewProps) {
  const outletId = useFloorBranchOutletId();
  const [qrSection, setQrSection] = useState<FloorSection | null>(null);
  const visibleSections = userFacingSections(sections);

  return (
    <>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{floorTableSetupCopy.sectionsOverview}</h2>
        <div className={styles.sections}>
          {visibleSections.length === 0 ? (
            <p className={styles.emptyHint}>{floorTableSetupCopy.noUserSectionsHint}</p>
          ) : null}
          {visibleSections.map((section) => {
            const stats = sectionStatsFromTables(section, tables);
            const enriched = { ...section, ...stats };
            return (
              <SectionCard
                key={section.id}
                section={enriched}
                onDownloadQr={() => setQrSection(enriched)}
              />
            );
          })}
        </div>
      </section>
      <SectionQrDialog
        open={qrSection != null}
        section={qrSection}
        outletLabel={outletLabel}
        outletId={outletId}
        onClose={() => setQrSection(null)}
      />
    </>
  );
}
