'use client';

import { CalendarDays } from 'lucide-react';

import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { formatInr, formatInrPlain } from '@/features/pos/cash-shift/lib';
import { cn } from '@/lib/utils';
import type {
  CashShiftDateFilter,
  CashTransaction,
  CashTxnType,
} from '@/features/pos/types/cash-shift';

import styles from './history.module.css';

type TransactionHistoryProps = Readonly<{
  transactions: readonly CashTransaction[];
  dateFilter: CashShiftDateFilter;
  onViewAll?: () => void;
}>;

const typeTone: Record<CashTxnType, string> = {
  refund: styles.typeRefund,
  cash_sale: styles.typeCashSale,
  card_sale: styles.typeCardSale,
  cash_out: styles.typeCashOut,
  cash_in: styles.typeCashIn,
  tip: styles.typeTip,
};

const amountTone: Record<CashTxnType, string> = {
  refund: styles.amountRefund,
  cash_sale: styles.amountCashSale,
  card_sale: styles.amountCardSale,
  cash_out: styles.amountCashOut,
  cash_in: styles.amountCashIn,
  tip: styles.amountTip,
};

const balanceTone: Record<CashTxnType, string> = {
  refund: styles.balanceRefund,
  cash_sale: styles.balanceCashSale,
  card_sale: styles.balanceCardSale,
  cash_out: styles.balanceCashOut,
  cash_in: styles.balanceCashIn,
  tip: styles.balanceTip,
};

export function TransactionHistory({
  transactions,
  dateFilter,
  onViewAll,
}: TransactionHistoryProps) {
  const { history, txnType, actions } = cashShiftCopy;

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>{history.title}</h2>
        <button type="button" className={styles.dateBtn}>
          <CalendarDays className={styles.dateIcon} aria-hidden="true" />
          {dateFilter.label}
        </button>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{history.columns.time}</th>
              <th>{history.columns.type}</th>
              <th>{history.columns.description}</th>
              <th className={styles.num}>{history.columns.amount}</th>
              <th className={styles.num}>{history.columns.balance}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td className={styles.time}>{txn.timeLabel}</td>
                <td>
                  <span className={cn(styles.badge, typeTone[txn.type])}>{txnType[txn.type]}</span>
                </td>
                <td className={styles.desc}>{txn.description}</td>
                <td className={cn(styles.num, styles.amount, amountTone[txn.type])}>
                  {formatInr(txn.amount)}
                </td>
                <td className={cn(styles.num, styles.balance, balanceTone[txn.type])}>
                  {formatInrPlain(txn.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.viewAll} onClick={onViewAll}>
          {actions.viewAll}
        </button>
      </div>
    </section>
  );
}
