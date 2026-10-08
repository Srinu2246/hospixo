import { DailySalesActions } from './daily-sales-actions';
import { DailySalesHeader } from './daily-sales-header';
import { HourlySalesChart } from './hourly-sales-chart';
import { PaymentMethodsCard } from './payment-methods-card';
import { SalesMetricsRow } from './sales-metrics-row';
import { TopSellingItemsTable } from './top-selling-items-table';

import styles from './daily-sales-summary-page.module.css';

export function DailySalesSummaryPage() {
  return (
    <div className={styles.page}>
      <DailySalesHeader />
      <SalesMetricsRow />

      <div className={styles.chartsRow}>
        <HourlySalesChart />
        <PaymentMethodsCard />
      </div>

      <TopSellingItemsTable />
      <DailySalesActions />
    </div>
  );
}
