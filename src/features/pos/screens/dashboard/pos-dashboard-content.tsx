'use client';

import {
  dashboardSummaryCards,
  floorStatusLegend,
  floorTables,
  liveOrderQueue,
  onlineOrdersSummary,
  onlinePlatformStats,
  readyOrders,
  recentTransactions,
  shiftInfo,
  systemNotifications,
} from '@/features/pos/config/dashboard';
import { posMobileOutlet } from '@/features/pos/config/nav-mobile';
import { FloorStatus } from '@/features/pos/screens/dashboard/floor-status/floor-status';
import { LiveOrderQueue } from '@/features/pos/screens/dashboard/live-order-queue/live-order-queue';
import { OnlineOrdersPanel } from '@/features/pos/screens/dashboard/online-orders-panel/online-orders-panel';
import { ReadyOrdersPanel } from '@/features/pos/screens/dashboard/ready-orders-panel/ready-orders-panel';
import { RecentTransactions } from '@/features/pos/screens/dashboard/recent-transactions/recent-transactions';
import { ShiftInfoPanel } from '@/features/pos/screens/dashboard/shift-info/shift-info';
import { SummaryCards } from '@/features/pos/screens/dashboard/summary-cards/summary-cards';
import { SystemNotifications } from '@/features/pos/screens/dashboard/system-notifications/system-notifications';

import styles from './pos-dashboard-page.module.css';

export function PosDashboardContent() {
  return (
    <div className={styles.page}>
      <SummaryCards cards={dashboardSummaryCards} />

      <div className={styles.middleRow}>
        <LiveOrderQueue orders={liveOrderQueue} />
        <FloorStatus tables={floorTables} legend={floorStatusLegend} />
      </div>

      <div className={styles.bottomRow}>
        <OnlineOrdersPanel
          totalSales={onlineOrdersSummary.totalSales}
          orders={onlineOrdersSummary.orders}
          platforms={onlinePlatformStats}
        />
        <ReadyOrdersPanel orders={readyOrders} />
        <RecentTransactions transactions={recentTransactions} />
      </div>

      <div className={styles.footerRow}>
        <SystemNotifications notifications={systemNotifications} />
        <ShiftInfoPanel shift={shiftInfo} />
      </div>
    </div>
  );
}

export const posDashboardMobileTitle = 'POS Dashboard';
export const posDashboardMobileSubtitle = posMobileOutlet.name;
