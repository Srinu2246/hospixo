import type { OpenOrderType } from '@/features/pos/config/open-orders';
import { openOrdersPillFilters } from '@/features/pos/config/open-orders';

import styles from './open-orders-filters.module.css';

interface OpenOrdersFiltersProps {
  activeType: OpenOrderType;
  onChange: (type: OpenOrderType) => void;
}

export function OpenOrdersFilters({ activeType, onChange }: Readonly<OpenOrdersFiltersProps>) {
  return (
    <fieldset className={styles.filters} aria-label="Filter open orders">
      <legend className="sr-only">Filter open orders</legend>
      {openOrdersPillFilters.map((filter) => {
        const active = filter.id === activeType;
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
