'use client';

import { onlineOrdersPageMeta } from '@/features/pos/config/online-orders';
import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactPage,
} from '@/features/pos/screens/layout/pos-compact-page';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';
import { OnlineOrderCard } from '@/features/pos/screens/online-orders/online-order-card';
import { OnlineOrdersAlert } from '@/features/pos/screens/online-orders/online-orders-alert';
import { OnlineOrdersFooter } from '@/features/pos/screens/online-orders/online-orders-footer';
import { OnlineOrdersHeader } from '@/features/pos/screens/online-orders/online-orders-header';

import type { OnlineOrdersPageViewModel } from './use-online-orders-page';
import styles from './compact-online-orders-content.module.css';

interface CompactOnlineOrdersContentProps extends OnlineOrdersPageViewModel {
  layout: 'mobile' | 'tablet';
}

export function CompactOnlineOrdersContent({
  layout,
  activeChannel,
  setActiveChannel,
  visibleOrders,
  handleAccept,
  handleReject,
  handleMarkReady,
}: Readonly<CompactOnlineOrdersContentProps>) {
  return (
    <PosMobileShell activeNavId="orders" withPageBg>
      <PosCompactPage className={layout === 'tablet' ? styles.tablet : undefined}>
        <PosCompactHeader>
          <PosMobileHeader
            title={onlineOrdersPageMeta.title}
            subtitle={onlineOrdersPageMeta.subtitle}
          />
          <OnlineOrdersHeader
            activeChannel={activeChannel}
            onChannelChange={setActiveChannel}
            hideTitle
          />
        </PosCompactHeader>

        <PosCompactBody className={styles.body}>
          <OnlineOrdersAlert />

          <section
            className={`${styles.grid} ${layout === 'tablet' ? styles.gridTablet : ''}`}
            aria-label="Online order cards"
          >
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
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
