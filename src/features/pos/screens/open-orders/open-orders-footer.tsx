import {
  getOpenOrdersSummaryText,
  openOrdersFooterSummary,
  openOrdersPageMeta,
} from '@/features/pos/config/open-orders';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import styles from './open-orders-footer.module.css';

export function OpenOrdersFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.summary}>{getOpenOrdersSummaryText()}</p>

      <div className={styles.right}>
        <button type="button" className={styles.downloadBtn}>
          {openOrdersPageMeta.downloadReportLabel}
        </button>

        <nav className={styles.pagination} aria-label="Orders pagination">
          <button type="button" className={styles.pageBtn} aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className={`${styles.pageBtn} ${styles.pageBtnActive}`}
            aria-current="page"
          >
            {openOrdersFooterSummary.currentPage}
          </button>
          <button type="button" className={styles.pageBtn} aria-label="Next page">
            <ChevronRight size={16} />
          </button>
        </nav>
      </div>
    </footer>
  );
}
