import { ChevronDown, Filter, Plus, Search } from 'lucide-react';

import { dineInPageMeta } from '@/features/pos/config/dine-in';

import styles from './dine-in-header.module.css';

interface DineInHeaderProps {
  tableNumber: string;
}

export function DineInHeader({ tableNumber }: Readonly<DineInHeaderProps>) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{dineInPageMeta.title}</h1>
        <button type="button" className={styles.locationBtn} aria-haspopup="listbox">
          {dineInPageMeta.locationLabel}
          <ChevronDown size={16} aria-hidden />
        </button>
      </div>

      <div className={styles.center}>
        <p className={styles.tableNo}>
          Table No : <strong>{tableNumber}</strong>
        </p>
        <time className={styles.date} dateTime="2024-10-24">
          {dineInPageMeta.dateLabel}
        </time>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.iconBtn} aria-label="Search">
          <Search size={18} />
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Filter">
          <Filter size={18} />
        </button>
        <button type="button" className={styles.primaryBtn}>
          <Plus size={18} aria-hidden />
          {dineInPageMeta.newOrderLabel}
        </button>
      </div>
    </header>
  );
}
