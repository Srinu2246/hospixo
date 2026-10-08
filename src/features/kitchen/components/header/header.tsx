import { KdsHeader } from '@/features/kitchen/components/kds';
import { kitchenDisplayCopy } from '@/features/kitchen/config';
import type { KitchenStation } from '@/features/kitchen/types';

import styles from './header.module.css';

type KitchenHeaderProps = Readonly<{
  station?: KitchenStation;
  title?: string;
}>;

export function KitchenHeader({ station, title }: KitchenHeaderProps) {
  const subtitle = station?.subtitle ?? station?.label;
  return (
    <KdsHeader styles={styles} title={title ?? kitchenDisplayCopy.title} subtitle={subtitle} />
  );
}
