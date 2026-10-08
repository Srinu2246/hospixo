import { SectionCard } from '@/features/floor-table-setup/components/detail/section-card';
import { floorTableSetupCopy } from '@/features/floor-table-setup/config';
import { sectionStatsFromTables, userFacingSections } from '@/features/floor-table-setup/lib';
import type {
  FloorSection,
  FloorTableItem,
} from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './floor-detail-page.module.css';

type SectionsOverviewProps = Readonly<{
  sections: readonly FloorSection[];
  tables?: readonly FloorTableItem[];
}>;

export function SectionsOverview({ sections, tables = [] }: SectionsOverviewProps) {
  const visibleSections = userFacingSections(sections);

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{floorTableSetupCopy.sectionsOverview}</h2>
      <div className={styles.sections}>
        {visibleSections.length === 0 ? (
          <p className={styles.emptyHint}>{floorTableSetupCopy.noUserSectionsHint}</p>
        ) : null}
        {visibleSections.map((section) => {
          const stats = sectionStatsFromTables(section, tables);
          return <SectionCard key={section.id} section={{ ...section, ...stats }} />;
        })}
      </div>
    </section>
  );
}
