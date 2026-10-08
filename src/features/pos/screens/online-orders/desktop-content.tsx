'use client';

import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';
import { OnlineOrderCard } from '@/features/pos/screens/online-orders/online-order-card';
import { OnlineOrdersAlert } from '@/features/pos/screens/online-orders/online-orders-alert';
import { OnlineOrdersFooter } from '@/features/pos/screens/online-orders/online-orders-footer';
import { OnlineOrdersHeader } from '@/features/pos/screens/online-orders/online-orders-header';

import type { OnlineOrdersPageViewModel } from './use-online-orders-page';
import styles from './online-orders-page.module.css';

export function OnlineOrdersDesktopContent({
  activeChannel,
  setActiveChannel,
  visibleOrders,
  handleAccept,
  handleReject,
  handleMarkReady,
}: Readonly<OnlineOrdersPageViewModel>) {
  return (
    <PosOperationsShell withPageBg>
      <div className={styles.page}>
        <OnlineOrdersHeader activeChannel={activeChannel} onChannelChange={setActiveChannel} />
        <OnlineOrdersAlert />

        <section className={styles.grid} aria-label="Online order cards">
          {visibleOrders.map((order) => (
            <OnlineOrderCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              onReject={handleReject}
              onMarkReady={handleMarkReady}
            />
          ))}
        </section>

        {visibleOrders.length === 0 ? (
          <p className={styles.empty}>No orders for this channel.</p>
        ) : null}

        <OnlineOrdersFooter />
      </div>
    </PosOperationsShell>
  );
}
