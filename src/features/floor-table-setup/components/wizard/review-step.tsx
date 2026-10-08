import { LayoutGrid } from 'lucide-react';

import { StatusToggle } from '@/features/floor-table-setup/components/status-toggle';
import { reviewColumns, wizardCopy } from '@/features/floor-table-setup/config';
import { seatingSummary } from '@/features/floor-table-setup/lib';
import type {
  FloorSetupDraft,
  WizardStepId,
} from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './wizard.module.css';

type ReviewStepProps = Readonly<{
  draft: FloorSetupDraft;
  onEdit: (step: WizardStepId) => void;
  onToggleFloor: (active: boolean) => void;
  onToggleSection: (id: string, active: boolean) => void;
}>;

export function ReviewStep({ draft, onEdit, onToggleFloor, onToggleSection }: ReviewStepProps) {
  const seating = seatingSummary(draft.tables);

  return (
    <section className={styles.card}>
      <div className={styles.listCopy}>
        <h2 className={styles.listTitle}>{wizardCopy.reviewTitle}</h2>
        <p className={styles.listSubtitle}>{wizardCopy.reviewSubtitle}</p>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewHead}>
          <h3 className={styles.reviewTitle}>{wizardCopy.floorDetails}</h3>
          <button type="button" className={styles.editLink} onClick={() => onEdit('floor')}>
            {wizardCopy.edit}
          </button>
        </div>
        <div className={styles.reviewGrid}>
          <ReviewField label={wizardCopy.floorName} value={draft.floor.name} />
          <ReviewField label={wizardCopy.floorCode} value={draft.floor.code} />
          <StatusToggle
            label={wizardCopy.floorStatus}
            hint=""
            checked={draft.floor.active}
            onChange={onToggleFloor}
          />
        </div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewHead}>
          <h3 className={styles.reviewTitle}>{wizardCopy.sectionsReview}</h3>
          <button type="button" className={styles.editLink} onClick={() => onEdit('section')}>
            {wizardCopy.edit}
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              {reviewColumns.map((column) => (
                <th key={column.id}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.sections.map((section) => (
              <tr key={section.id}>
                <td>{section.name}</td>
                <td>{section.code}</td>
                <td>{section.tableCount}</td>
                <td>{section.seatCount}</td>
                <td>
                  <StatusToggle
                    label={section.name}
                    hint=""
                    checked={section.active}
                    onChange={(active) => onToggleSection(section.id, active)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.reviewBlock}>
        <p className={styles.reviewTitle}>{wizardCopy.tablesSetup}</p>
        <p className={styles.tablesConfigured}>
          <LayoutGrid className={styles.icon} aria-hidden="true" />
          {seating.tables} {wizardCopy.tablesConfigured}
        </p>
      </div>
    </section>
  );
}

function ReviewField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={styles.reviewValue}>{value}</span>
    </div>
  );
}
