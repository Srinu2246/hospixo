import { FloorStatusBadge } from '@/features/floor-table-setup/components/status-badge';
import {
  SectionDetailTableCard,
  SectionDetailTableGrid,
} from '@/features/floor-table-setup/components/table-card';
import { detailCopy, wizardCopy } from '@/features/floor-table-setup/config';
import { cn } from '@/lib/utils';
import type {
  FloorSection,
  FloorTableItem,
} from '@/features/floor-table-setup/types/floor-table-setup';

import wizardStyles from '../wizard/wizard.module.css';
import styles from './floor-detail-page.module.css';

type SectionDetailProps = Readonly<{
  section: FloorSection;
  tables: readonly FloorTableItem[];
  onBack: () => void;
  onEdit: () => void;
}>;

const sectionInfoFields = [
  { id: 'name', key: 'sectionName' },
  { id: 'code', key: 'sectionCode' },
] as const;

const sectionStatFields = [
  { id: 'tables', key: 'tables' },
  { id: 'seats', key: 'seats' },
  { id: 'activeTables', key: 'activeTables' },
  { id: 'inactiveTables', key: 'inactiveTables' },
] as const;

export function SectionDetail({ section, tables, onBack, onEdit }: SectionDetailProps) {
  const labels = detailCopy.labels;
  const activeTables = tables.filter((table) => table.configStatus === 'active').length;
  const stats = {
    tables: tables.length || section.tableCount,
    seats: tables.reduce((sum, table) => sum + table.capacity, 0) || section.seatCount,
    activeTables,
    inactiveTables: Math.max(0, (tables.length || section.tableCount) - activeTables),
  };

  return (
    <div className={cn(styles.stack, styles.detailShell)}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>
          {section.name} {detailCopy.sectionSuffix}
        </h2>
        <FloorStatusBadge status={section.status} />
      </div>
      <section className={styles.card}>
        <div className={styles.infoGrid}>
          {sectionInfoFields.map((field) => (
            <div key={field.id} className={styles.field}>
              <span className={styles.label}>{labels[field.key]}</span>
              <span className={styles.value}>
                {field.id === 'name' ? section.name : section.code || '—'}
              </span>
            </div>
          ))}
          <div className={styles.field}>
            <span className={styles.label}>{labels.status}</span>
            <FloorStatusBadge status={section.status} />
          </div>
        </div>
        <div className={styles.description}>
          <span className={styles.label}>{labels.description}</span>
          <p className={styles.descriptionBox}>
            {section.description?.trim() || wizardCopy.sectionDescriptionPlaceholder}
          </p>
        </div>
      </section>
      <div className={styles.stats}>
        {sectionStatFields.map((field) => (
          <article key={field.id} className={styles.statCard}>
            <span className={styles.statLabel}>{labels[field.key]}</span>
            <span className={styles.statValue}>{stats[field.id]}</span>
          </article>
        ))}
      </div>
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>{detailCopy.tablesInSection}</h3>
        {tables.length === 0 ? (
          <p className={styles.activityTime}>{detailCopy.emptyTablesDescription}</p>
        ) : (
          <SectionDetailTableGrid>
            {tables.map((table) => (
              <SectionDetailTableCard
                key={table.id}
                number={table.number}
                capacity={table.capacity}
              />
            ))}
          </SectionDetailTableGrid>
        )}
      </section>
      <div className={cn(wizardStyles.footer, styles.stickyTabFooter)}>
        <button type="button" className={wizardStyles.secondary} onClick={onBack}>
          {detailCopy.back}
        </button>
        <button type="button" className={wizardStyles.primary} onClick={onEdit}>
          {detailCopy.editSection}
        </button>
      </div>
    </div>
  );
}
