'use client';

import { Search } from 'lucide-react';

import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';
import { ReadyOrderCard } from '@/features/pos/screens/ready-list/ready-order-card';

import type { ReadyListPageViewModel } from './use-ready-list-page';
import styles from './ready-list-page.module.css';

export function ReadyListDesktopContent({
  activeTab,
  setActiveTab,
  query,
  setQuery,
  visibleOrders,
  handleServe,
  activeCount,
  tabs,
}: Readonly<ReadyListPageViewModel>) {
  return (
    <PosOperationsShell withPageBg>
      <main className={styles.page}>
        <div className={styles.utilityRow}>
          <label className={styles.search}>
            <Search size={16} aria-hidden />
            <input
              type="search"
              placeholder="Search orders, tokens, table numbers..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className={styles.onlineStatus}>Live Store Ops Online</span>
        </div>

        <header className={styles.pageHeader}>
          <h1 className={styles.title}>
            Ready to Serve <span>{activeCount}</span>
          </h1>

          <div className={styles.tabs} role="tablist" aria-label="Ready order filters">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {tab.count != null ? ` (${tab.count})` : ''}
                </button>
              );
            })}
          </div>
        </header>

        {visibleOrders.length > 0 ? (
          <section className={styles.grid} aria-label={`${activeTab} ready orders`}>
            {visibleOrders.map((order) => (
              <ReadyOrderCard key={order.id} order={order} onServe={handleServe} />
            ))}
          </section>
        ) : (
          <div className={styles.empty}>
            <h2>No orders found</h2>
            <p>Orders matching this view will appear here.</p>
          </div>
        )}
      </main>
    </PosOperationsShell>
  );
}
