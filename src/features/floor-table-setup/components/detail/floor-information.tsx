import { floorStatusLabels, floorTableSetupCopy } from '@/features/floor-table-setup/config';
import { formatCreatedOn } from '@/features/floor-table-setup/lib';
import type { Floor } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './floor-detail-page.module.css';

type FloorInformationProps = Readonly<{
  floor: Floor;
}>;

export function FloorInformation({ floor }: FloorInformationProps) {
  const labels = floorTableSetupCopy.labels;
  const description = floor.description.trim() || floorTableSetupCopy.descriptionPlaceholder;

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{floorTableSetupCopy.floorInformation}</h2>
      <div className={styles.infoGrid}>
        <InfoField label={labels.floorName} value={floor.name} />
        <InfoField label={labels.branch} value={floor.branch} />
        <div className={styles.field}>
          <span className={styles.label}>{labels.status}</span>
          <span className={styles.status}>
            <span className={styles.dot} aria-hidden="true" />
            {floorStatusLabels[floor.status]}
          </span>
        </div>
        <InfoField
          label={labels.tables}
          value={`${floor.stats.totalTables} ${floorTableSetupCopy.tablesSuffix}`}
        />
        <InfoField label={labels.createdBy} value={floor.createdBy} />
        <InfoField label={labels.createdOn} value={formatCreatedOn(floor.createdOn)} />
      </div>
      <div className={styles.description}>
        <span className={styles.label}>{floorTableSetupCopy.descriptionLabel}</span>
        <p className={styles.descriptionBox}>{description}</p>
      </div>
    </section>
  );
}

function InfoField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
