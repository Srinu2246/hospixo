import type { PosTableFilterId } from '@/features/pos/config/tables';
import { posTableFilters } from '@/features/pos/config/tables';

import styles from './table-filters.module.css';

interface TableFiltersProps {
  activeFilter: PosTableFilterId;
  onChange: (filter: PosTableFilterId) => void;
}

export function TableFilters({ activeFilter, onChange }: Readonly<TableFiltersProps>) {
  return (
    <fieldset className={styles.filters} aria-label="Filter tables by status">
      <legend className="sr-only">Filter tables by status</legend>
      {posTableFilters.map((filter) => {
        const active = filter.id === activeFilter;
        return (
          <button
            key={filter.id}
            type="button"
            className={`${styles.pill} ${active ? styles.pillActive : ''}`}
            aria-pressed={active}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </fieldset>
  );
}
