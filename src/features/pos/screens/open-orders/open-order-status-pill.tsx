import type {
  OpenOrderKitchenStatus,
  OpenOrderPaymentStatus,
} from '@/features/pos/config/open-orders';
import { getKitchenStatusLabel, getPaymentStatusLabel } from '@/features/pos/config/open-orders';

import styles from './open-order-status-pill.module.css';

const kitchenClass: Record<OpenOrderKitchenStatus, string> = {
  kotSent: styles.kotSent,
  ready: styles.ready,
  preparing: styles.preparing,
  billing: styles.billing,
};

const paymentClass: Record<OpenOrderPaymentStatus, string> = {
  paid: styles.paid,
  unpaid: styles.unpaid,
};

export function KitchenStatusPill({ status }: Readonly<{ status: OpenOrderKitchenStatus }>) {
  return (
    <span className={`${styles.pill} ${kitchenClass[status]}`}>
      {getKitchenStatusLabel(status)}
    </span>
  );
}

export function PaymentStatusPill({ status }: Readonly<{ status: OpenOrderPaymentStatus }>) {
  return (
    <span className={`${styles.pill} ${paymentClass[status]}`}>
      {getPaymentStatusLabel(status)}
    </span>
  );
}
