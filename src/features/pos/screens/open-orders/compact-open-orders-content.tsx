'use client';

import type { OpenOrder } from '@/features/pos/config/open-orders';
import {
  formatOpenOrderAmount,
  formatOpenOrderTime,
  getOpenOrderTypeLabel,
  openOrderActions,
  openOrdersPageMeta,
  openOrdersPillFilters,
  resolveOpenOrderAmount,
} from '@/features/pos/config/open-orders';
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
import { KitchenStatusPill } from '@/features/pos/screens/open-orders/open-order-status-pill';

import type { OpenOrdersPageViewModel } from './use-open-orders-page';
import styles from './compact-open-orders-content.module.css';

interface CompactOpenOrdersContentProps extends OpenOrdersPageViewModel {
  layout: 'mobile' | 'tablet';
}

function CompactOpenOrderCard({
  order,
  onAddItems,
  onSettleBill,
}: Readonly<{
  order: OpenOrder;
  onAddItems: (orderId: string) => void;
  onSettleBill: (orderId: string) => void;
}>) {
  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <span>
          <span className={styles.orderNumber}>{order.orderNumber}</span>
          {' · '}
          {getOpenOrderTypeLabel(order.type)}
        </span>
        <span>{formatOpenOrderTime(order.age)}</span>
      </div>
      <div className={styles.mainRow}>
        <p className={styles.reference}>{order.reference}</p>
        <span className={styles.amount}>
          {formatOpenOrderAmount(resolveOpenOrderAmount(order))}
        </span>
      </div>
      <div className={styles.statusRow}>
        <KitchenStatusPill status={order.kitchenStatus} />
        <span className={styles.paymentDot}>
          <i
            className={order.paymentStatus === 'paid' ? styles.paidDot : styles.unpaidDot}
            aria-hidden
          />
          {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
        </span>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.viewBtn} onClick={() => onAddItems(order.id)}>
          {openOrderActions.addItems}
        </button>
        <button type="button" className={styles.settleBtn} onClick={() => onSettleBill(order.id)}>
          {openOrderActions.settleBill}
        </button>
      </div>
    </article>
  );
}

export function CompactOpenOrdersContent({
  layout,
  activeType,
  setActiveType,
  searchQuery,
  setSearchQuery,
  visibleOrders,
  handleAddItems,
  handleSettleBill,
}: Readonly<CompactOpenOrdersContentProps>) {
  const mobileFilters = openOrdersPillFilters.filter((f) =>
    ['all', 'dineIn', 'takeaway', 'delivery'].includes(f.id),
  );

  return (
    <PosMobileShell activeNavId="orders" withPageBg>
      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader title="Open Orders" subtitle="Live active tickets" />
          <PosCompactHeaderChrome>
            <div
              className={compactPageStyles.pillRow}
              role="tablist"
              aria-label="Order type filters"
            >
              {mobileFilters.map((filter) => {
                const active = filter.id === activeType;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`${compactPageStyles.pill} ${
                      active ? compactPageStyles.pillActive : ''
                    }`}
                    onClick={() => setActiveType(filter.id)}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </PosCompactHeaderChrome>
        </PosCompactHeader>

        <PosCompactBody className={styles.body}>
          <PosCompactSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={openOrdersPageMeta.searchPlaceholder}
          />

          {visibleOrders.length > 0 ? (
            <section
              className={layout === 'tablet' ? styles.gridTablet : styles.list}
              aria-label="Open orders"
            >
              {visibleOrders.map((order) => (
                <CompactOpenOrderCard
                  key={order.id}
                  order={order}
                  onAddItems={handleAddItems}
                  onSettleBill={handleSettleBill}
                />
              ))}
            </section>
          ) : (
            <p className={styles.empty}>No open orders match your filters.</p>
          )}
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
