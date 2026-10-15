import { SectionDownloadQrButton } from '@/features/floor-table-setup/components/section-qr/section-download-qr-button';
import { FloorStatusBadge } from '@/features/floor-table-setup/components/status-badge';
import { floorTableSetupCopy } from '@/features/floor-table-setup/config';
import type { FloorSection } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './floor-detail-page.module.css';

type SectionCardProps = Readonly<{
  section: FloorSection;
  onDownloadQr?: () => void;
}>;

export function SectionCard({ section, onDownloadQr }: SectionCardProps) {
  return (
    <article className={styles.sectionCard}>
      <div className={styles.sectionTop}>
        <h3 className={styles.sectionName}>{section.name}</h3>
        <FloorStatusBadge status={section.status} />
      </div>
      <div className={styles.sectionMeta}>
        <span>
          {floorTableSetupCopy.labels.tables}: {section.tableCount}
        </span>
        <span>
          {floorTableSetupCopy.seatsSuffix}: {section.seatCount}
        </span>
      </div>
      {onDownloadQr ? <SectionDownloadQrButton onClick={onDownloadQr} /> : null}
    </article>
  );
}
