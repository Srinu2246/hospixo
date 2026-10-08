'use client';

import Link from 'next/link';
import { ChevronDown, Clock3, Plus, User, Users, Wallet } from 'lucide-react';

import { formatRupee, getTableStatusLabel, type PosTable } from '@/features/pos/config/tables';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { StatusPill } from '@/features/pos/screens/shared/status-pill';

import styles from './selected-table-bar.module.css';

interface SelectedTableBarProps {
  table: PosTable | null;
}

export function SelectedTableBar({ table }: Readonly<SelectedTableBarProps>) {
  const flowPaths = usePosFlowPaths();

  if (!table) return null;

  return (
    <section className={styles.bar} aria-label="Selected table actions">
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Selected table</span>
          <span className={styles.metricValue}>
            {table.label}
            <StatusPill status={table.status} label={getTableStatusLabel(table.status)} compact />
          </span>
        </div>

        {table.guests != null ? (
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Guests</span>
            <span className={styles.metricValueInline}>
              <Users size={16} aria-hidden />
              {table.guests}
            </span>
          </div>
        ) : null}

        {table.waiter ? (
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Waiter</span>
            <span className={styles.metricValueInline}>
              <User size={16} aria-hidden />
              {table.waiter}
            </span>
          </div>
        ) : null}

        {table.amount != null ? (
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Running</span>
            <span className={styles.metricValueInline}>
              <Wallet size={16} aria-hidden />
              {formatRupee(table.amount)}
            </span>
          </div>
        ) : null}

        {table.elapsedMinutes != null ? (
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Open for</span>
            <span className={styles.metricValueInline}>
              <Clock3 size={16} aria-hidden />
              {table.elapsedMinutes} min
            </span>
          </div>
        ) : null}
      </div>

      <div className={styles.actions}>
        <Link href={flowPaths.dineIn} className={styles.primaryBtn}>
          <Plus size={16} aria-hidden />
          Add Items
        </Link>
        <button type="button" className={styles.secondaryBtn}>
          Transfer
          <ChevronDown size={14} aria-hidden />
        </button>
        <button type="button" className={styles.secondaryBtn}>
          Merge
        </button>
        <Link href={flowPaths.orders} className={styles.secondaryBtn}>
          Settle in Orders
        </Link>
      </div>
    </section>
  );
}
