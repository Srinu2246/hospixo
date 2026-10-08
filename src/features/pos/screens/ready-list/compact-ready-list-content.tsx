'use client';

import type { ReadyOrder } from '@/features/pos/config/ready-list';
import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactHeaderChrome,
  PosCompactPage,
  PosCompactSearch,
} from '@/features/pos/screens/layout/pos-compact-page';
import compactPageStyles from '@/features/pos/screens/layout/pos-compact-page.module.css';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';

import type { ReadyListPageViewModel } from './use-ready-list-page';
import styles from './compact-ready-list-content.module.css';

interface CompactReadyListContentProps extends ReadyListPageViewModel {
  layout: 'mobile' | 'tablet';
}

function CompactReadyOrderCard({
  order,
  onServe,
}: Readonly<{
  order: ReadyOrder;
  onServe: (orderId: string) => void;
}>) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.tableName}>{order.table}</h2>
        <span className={styles.readyAgo}>Ready {order.readyAgo}</span>
      </div>
      <div className={styles.metaRow}>
        <span>Token {order.token}</span>
        <span className={`${styles.priority} ${styles[order.priority]}`}>
          {order.priority.toUpperCase()}
        </span>
      </div>
      <div className={styles.itemBox}>
        <span className={styles.itemCount}>{order.itemCount} Items</span>
        <p className={styles.itemSummary}>{order.itemSummary}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.detailsBtn}>
          Details
        </button>
        <button type="button" className={styles.serveBtn} onClick={() => onServe(order.id)}>
          Mark Served
        </button>
      </div>
    </article>
  );
}

export function CompactReadyListContent({
  layout,
  activeTab,
  setActiveTab,
  query,
  setQuery,
  visibleOrders,
  handleServe,
  tabs,
}: Readonly<CompactReadyListContentProps>) {
  return (
    <PosMobileShell activeNavId="ready" withPageBg>
      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader title="Ready to Serve" subtitle="Kitchen updates live" />
          <PosCompactHeaderChrome>
            <div
              className={compactPageStyles.pillRow}
              role="tablist"
              aria-label="Ready order filters"
            >
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`${compactPageStyles.pill} ${
                      isActive ? compactPageStyles.pillActive : ''
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                    {tab.count != null ? ` (${tab.count})` : ''}
                  </button>
                );
              })}
            </div>
          </PosCompactHeaderChrome>
        </PosCompactHeader>

        <PosCompactBody className={styles.body}>
          <PosCompactSearch
            value={query}
            onChange={setQuery}
            placeholder="Search orders, tokens, table numbers..."
          />

          {visibleOrders.length > 0 ? (
            <section
              className={layout === 'tablet' ? styles.gridTablet : styles.list}
              aria-label={`${activeTab} ready orders`}
            >
              {visibleOrders.map((order) => (
                <CompactReadyOrderCard key={order.id} order={order} onServe={handleServe} />
              ))}
            </section>
          ) : (
            <div className={styles.empty}>
              <h2>No orders found</h2>
              <p>Orders matching this view will appear here.</p>
            </div>
          )}
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
