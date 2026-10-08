import { KdsFooter } from '@/features/kitchen/components/kds';
import { kitchenDisplayCopy } from '@/features/kitchen/config';
import type { KitchenConnectionStatus } from '@/features/kitchen/types';

import styles from './footer.module.css';

type KitchenFooterProps = Readonly<{
  status: KitchenConnectionStatus;
}>;

export function KitchenFooter({ status }: KitchenFooterProps) {
  return <KdsFooter styles={styles} copy={kitchenDisplayCopy.footer} status={status} />;
}
