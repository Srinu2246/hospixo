import type { ReactNode, Ref } from 'react';
import { QrCode, SquarePen, Trash2 } from 'lucide-react';

import { floorTableSetupCopy, setupStatusLabels } from '@/features/floor-table-setup/config';
import type { SetupStatus } from '@/features/floor-table-setup/types/floor-table-setup';
import { cn } from '@/lib/utils';

import styles from './table-card.module.css';

export type FloorTable = Readonly<{
  id: string;
  name: string;
  seats: number;
}>;

type SetupTableCardProps = Readonly<{
  number: string;
  capacity: number;
  status: SetupStatus;
  selected?: boolean;
  selectable?: boolean;
  checked?: boolean;
  areaLabel?: string;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRotateQr?: () => void;
  editDisabled?: boolean;
  cardRef?: Ref<HTMLElement>;
  className?: string;
}>;

const statusDotClass: Record<SetupStatus, string> = {
  active: styles.dotActive,
  draft: styles.dotDraft,
  inactive: styles.dotInactive,
};

export function SetupTableCard({
  number,
  capacity,
  status,
  selected = false,
  selectable = false,
  checked = false,
  areaLabel,
  onToggleSelect,
  onEdit,
  onDelete,
  onRotateQr,
  editDisabled = false,
  cardRef,
  className,
}: SetupTableCardProps) {
  return (
    <article ref={cardRef} className={cn(styles.card, selected && styles.cardSelected, className)}>
      {selectable ? (
        <label className={styles.selectRow}>
          <input type="checkbox" checked={checked} onChange={onToggleSelect} />
          {areaLabel}
        </label>
      ) : null}
      <div className={styles.topRow}>
        <h3 className={styles.number}>{number}</h3>
        <span className={styles.status}>
          <span className={cn(styles.dot, statusDotClass[status])} aria-hidden="true" />
          {setupStatusLabels[status]}
        </span>
      </div>
      <p className={styles.capacity}>
        {capacity} {floorTableSetupCopy.seatsSuffix}
      </p>
      {onEdit || onDelete || onRotateQr ? (
        <div className={styles.actions}>
          {onRotateQr ? (
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Rotate QR"
              onClick={onRotateQr}
              disabled={editDisabled}
            >
              <QrCode className={styles.icon} aria-hidden="true" />
            </button>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Edit table"
              onClick={onEdit}
              disabled={editDisabled}
            >
              <SquarePen className={styles.icon} aria-hidden="true" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Delete table"
              onClick={onDelete}
              disabled={editDisabled}
            >
              <Trash2 className={styles.icon} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function SetupTableGrid({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return <div className={cn(styles.grid, className)}>{children}</div>;
}

/** @deprecated Use SetupTableCard for floor-table-setup grids. */
type TableCardProps = Readonly<{
  table: FloorTable;
}>;

export function TableCard({ table }: TableCardProps) {
  return <SetupTableCard number={table.name} capacity={table.seats} status="active" />;
}

type TableLayoutProps = Readonly<{
  tables: readonly FloorTable[];
}>;

export function TableLayout({ tables }: TableLayoutProps) {
  return (
    <SetupTableGrid>
      {tables.map((table) => (
        <TableCard key={table.id} table={table} />
      ))}
    </SetupTableGrid>
  );
}
