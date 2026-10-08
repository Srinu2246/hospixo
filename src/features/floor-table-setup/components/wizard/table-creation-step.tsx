import { LayoutGrid, Plus, Search, SquarePen, Trash2 } from 'lucide-react';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { tableStatusLabels, wizardCopy } from '@/features/floor-table-setup/config';
import type { TableDraft } from '@/features/floor-table-setup/types/floor-table-setup';
import { cn } from '@/lib/utils';

import styles from './wizard.module.css';

type TableCreationStepProps = Readonly<{
  tables: readonly TableDraft[];
  query: string;
  onQueryChange: (value: string) => void;
  onAdd: () => void;
  onBulk: () => void;
  onEdit: (tableId: string) => void;
  onDelete: (id: string) => void;
}>;

const statusDot: Record<TableDraft['status'], string> = {
  available: styles.dot,
  reserved: styles.dotReserved,
  occupied: styles.dotOccupied,
};

export function TableCreationStep({
  tables,
  query,
  onQueryChange,
  onAdd,
  onBulk,
  onEdit,
  onDelete,
}: TableCreationStepProps) {
  return (
    <div className={styles.page}>
      <div className={styles.listHeader}>
        <div className={styles.listCopy}>
          <h2 className={styles.listTitle}>{wizardCopy.tablesTitle}</h2>
          <p className={styles.listSubtitle}>{wizardCopy.tablesSubtitle}</p>
        </div>
        <button type="button" className={styles.primary} onClick={onAdd}>
          <Plus className={styles.icon} aria-hidden="true" />
          {wizardCopy.addTable}
        </button>
      </div>
      <div className={styles.toolbarRow}>
        <label className={styles.search}>
          <Search className={styles.icon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            placeholder={wizardCopy.searchTables}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary}>
            {wizardCopy.bulkEdit}
          </button>
          <button type="button" className={styles.secondary} onClick={onBulk}>
            {wizardCopy.bulkGenerate}
          </button>
        </div>
      </div>
      {tables.length === 0 ? (
        <EmptyState
          variant="hero"
          title={wizardCopy.emptyTablesTitle}
          description={wizardCopy.emptyTablesDescription}
          icon={<LayoutGrid className={styles.icon} />}
          action={
            <button type="button" className={styles.primary} onClick={onAdd}>
              <Plus className={styles.icon} aria-hidden="true" />
              {wizardCopy.addFirstTable}
            </button>
          }
        />
      ) : (
        <div className={styles.tileGrid}>
          {tables.map((table) => (
            <article key={table.id} className={styles.tableTile}>
              <div className={styles.tileTop}>
                <h3 className={styles.tableId}>{table.number}</h3>
                <span className={styles.stats}>
                  {table.capacity} {wizardCopy.columnSeats}
                </span>
              </div>
              <span className={styles.statusDot}>
                <span className={cn(styles.dot, statusDot[table.status])} aria-hidden="true" />
                {tableStatusLabels[table.status]}
              </span>
              <div className={styles.iconActions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={wizardCopy.edit}
                  onClick={() => onEdit(table.id)}
                >
                  <SquarePen className={styles.icon} />
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Delete table"
                  onClick={() => onDelete(table.id)}
                >
                  <Trash2 className={styles.icon} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
