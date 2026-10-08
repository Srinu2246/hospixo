import {
  dailySalesTopItems,
  dailySalesTopItemsMeta,
  formatDailySalesRevenue,
} from '@/features/pos/day-close/config/daily-sales-summary';

import styles from './top-selling-items-table.module.css';

export function TopSellingItemsTable() {
  return (
    <section className={styles.card} aria-labelledby="top-selling-items-heading">
      <h2 id="top-selling-items-heading" className={styles.title}>
        {dailySalesTopItemsMeta.title}
      </h2>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{dailySalesTopItemsMeta.columns.item}</th>
              <th scope="col" className={styles.qtyCol}>
                {dailySalesTopItemsMeta.columns.qty}
              </th>
              <th scope="col" className={styles.revenueCol}>
                {dailySalesTopItemsMeta.columns.revenue}
              </th>
            </tr>
          </thead>
          <tbody>
            {dailySalesTopItems.map((item) => (
              <tr key={item.id}>
                <td className={styles.itemName}>{item.name}</td>
                <td className={styles.qtyCol}>{item.qty}</td>
                <td className={styles.revenueCol}>{formatDailySalesRevenue(item.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
