import type { OpenOrderType } from '@/features/pos/config/open-orders';
import { openOrdersPageMeta, openOrdersTopFilters } from '@/features/pos/config/open-orders';
import { Search } from 'lucide-react';

import styles from './open-orders-header.module.css';

interface OpenOrdersHeaderProps {
  activeType: OpenOrderType;
  searchQuery: string;
  onTypeChange: (type: OpenOrderType) => void;
  onSearchChange: (query: string) => void;
}

export function OpenOrdersHeader({
  activeType,
  searchQuery,
  onTypeChange,
  onSearchChange,
}: Readonly<OpenOrdersHeaderProps>) {
  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{openOrdersPageMeta.title}</h1>
        <nav className={styles.topFilters} aria-label="Order type filters">
          {openOrdersTopFilters.map((filter) => {
            const active = filter.id === activeType;
            return (
              <button
                key={filter.id}
                type="button"
                className={`${styles.topFilterBtn} ${active ? styles.topFilterBtnActive : ''}`}
                aria-pressed={active}
                onClick={() => onTypeChange(filter.id)}
              >
                {filter.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={styles.searchRow}>
        <label className={styles.search}>
          <Search size={18} className={styles.searchIcon} aria-hidden />
          <input
            type="search"
            className={styles.searchInput}
            placeholder={openOrdersPageMeta.searchPlaceholder}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <span className={styles.syncPill}>{openOrdersPageMeta.syncLabel}</span>
      </div>
    </header>
  );
}
