'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import {
  detailCopy,
  generalHistoryColumns,
  historyActionFilterOptions,
  historyActionLabels,
  historyPageSize,
  historySubTabs,
  tableStatusHistoryColumns,
} from '@/features/floor-table-setup/config';
import {
  filterHistoryEntries,
  filterTableStatusHistory,
  formatHistoryWhen,
  historyForFloor,
  paginate,
} from '@/features/floor-table-setup/lib';
import type {
  Floor,
  HistoryActionFilter,
  HistorySubTabId,
} from '@/features/floor-table-setup/types/floor-table-setup';
import { cn } from '@/lib/utils';

import wizardStyles from '../wizard/wizard.module.css';
import styles from './floor-detail-page.module.css';

type HistoryTabProps = Readonly<{
  floor: Floor;
}>;

const historyStatKeys = [
  { id: 'reserved', key: 'reserved' },
  { id: 'occupied', key: 'occupied' },
  { id: 'notReserved', key: 'notReserved' },
] as const;

function isHistoryActionFilter(value: string): value is HistoryActionFilter {
  return historyActionFilterOptions.some((option) => option.id === value);
}

function isHistorySubTab(value: string): value is HistorySubTabId {
  return historySubTabs.some((tab) => tab.id === value);
}

export function HistoryTab({ floor }: HistoryTabProps) {
  const log = historyForFloor(floor);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [action, setAction] = useState<HistoryActionFilter>('all');
  const [subTab, setSubTab] = useState<HistorySubTabId>('general');
  const [page, setPage] = useState(1);

  const general = useMemo(
    () => filterHistoryEntries(log.general, query, action, date),
    [log.general, query, action, date],
  );
  const tableStatus = useMemo(
    () => filterTableStatusHistory(log.tableStatus, query, date),
    [log.tableStatus, query, date],
  );
  const generalPage = paginate(general, page, historyPageSize);
  const tableStatusPage = paginate(tableStatus, page, historyPageSize);
  const paged = subTab === 'general' ? generalPage : tableStatusPage;

  function exportLog() {
    const blob = new Blob([JSON.stringify({ floor: floor.id, general, tableStatus }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${floor.id}-history.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.stack}>
      <div className={wizardStyles.listHeader}>
        <div className={wizardStyles.listCopy}>
          <h2 className={wizardStyles.listTitle}>{detailCopy.historyTitle}</h2>
          <p className={wizardStyles.listSubtitle}>{detailCopy.historySubtitle}</p>
        </div>
        <button type="button" className={wizardStyles.secondary} onClick={exportLog}>
          {detailCopy.export}
        </button>
      </div>
      <div className={styles.filterRow}>
        <label className={wizardStyles.search}>
          <Search className={wizardStyles.icon} aria-hidden="true" />
          <input
            className={wizardStyles.searchInput}
            type="search"
            value={query}
            placeholder={detailCopy.searchHistory}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          {detailCopy.dateLabel}
          <input
            className={styles.compactInput}
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          {detailCopy.actionLabel}
          <select
            className={styles.compactSelect}
            value={action}
            onChange={(event) => {
              if (!isHistoryActionFilter(event.target.value)) return;
              setAction(event.target.value);
              setPage(1);
            }}
          >
            {historyActionFilterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.statsThree}>
        {historyStatKeys.map((entry) => (
          <article key={entry.id} className={styles.statCard}>
            <span className={styles.statLabel}>{detailCopy.historyStats[entry.key]}</span>
            <span className={styles.statValue}>{log.stats[entry.id]}</span>
          </article>
        ))}
      </div>
      <div className={styles.subTabs} role="tablist" aria-label={detailCopy.historyTitle}>
        {historySubTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={subTab === tab.id}
            className={cn(styles.tab, subTab === tab.id && styles.tabActive)}
            onClick={() => {
              if (!isHistorySubTab(tab.id)) return;
              setSubTab(tab.id);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {paged.items.length === 0 ? (
        <EmptyState title={detailCopy.emptyHistory} description={detailCopy.historySubtitle} />
      ) : subTab === 'general' ? (
        <div className={styles.dataTableWrap}>
          <table className={wizardStyles.table}>
            <thead>
              <tr>
                {generalHistoryColumns.map((column) => (
                  <th key={column.id}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {generalPage.items.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatHistoryWhen(entry.occurredAt)}</td>
                  <td>{historyActionLabels[entry.action]}</td>
                  <td>{entry.changedBy}</td>
                  <td>{entry.previousValue}</td>
                  <td>{entry.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.dataTableWrap}>
          <table className={wizardStyles.table}>
            <thead>
              <tr>
                {tableStatusHistoryColumns.map((column) => (
                  <th key={column.id}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableStatusPage.items.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatHistoryWhen(entry.occurredAt)}</td>
                  <td>{entry.tableNumber}</td>
                  <td>{entry.guestName}</td>
                  <td>{entry.partySize}</td>
                  <td>{entry.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.pagination}>
        <span className={styles.pageLabel}>
          {detailCopy.pageLabel(paged.page, paged.totalPages)}
        </span>
        <div className={styles.bannerActions}>
          <button
            type="button"
            className={wizardStyles.secondary}
            disabled={paged.page <= 1}
            onClick={() => setPage(paged.page - 1)}
          >
            {detailCopy.previousPage}
          </button>
          <button
            type="button"
            className={wizardStyles.secondary}
            disabled={paged.page >= paged.totalPages}
            onClick={() => setPage(paged.page + 1)}
          >
            {detailCopy.nextPage}
          </button>
        </div>
      </div>
    </div>
  );
}
