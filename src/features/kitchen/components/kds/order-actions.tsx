import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { KdsOrderStatus } from '@/types/kds';

type KdsOrderActionsCopy = Readonly<{
  startPreparing: string;
  recall: string;
  markReady: string;
  served: string;
}>;

type KdsOrderActionsProps = Readonly<{
  styles: Readonly<Record<string, string>>;
  copy: KdsOrderActionsCopy;
  status: KdsOrderStatus;
  orderId: string;
  onStartPreparing?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onServed?: (orderId: string) => void;
  preparingLabel?: ReactNode;
}>;

export function KdsOrderActions({
  styles,
  copy,
  status,
  orderId,
  onStartPreparing,
  onRecall,
  onMarkReady,
  onServed,
  preparingLabel,
}: KdsOrderActionsProps) {
  if (status === 'new') {
    return (
      <button
        type="button"
        className={cn(styles.btn, styles.btnNew)}
        onClick={() => onStartPreparing?.(orderId)}
      >
        {copy.startPreparing}
      </button>
    );
  }

  if (status === 'preparing') {
    return (
      <>
        <button
          type="button"
          className={cn(styles.btn, styles.btnGhost)}
          onClick={() => onRecall?.(orderId)}
        >
          {copy.recall}
        </button>
        <button
          type="button"
          className={cn(styles.btn, styles.btnPreparing)}
          onClick={() => onMarkReady?.(orderId)}
        >
          {preparingLabel ?? copy.markReady}
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      className={cn(styles.btn, styles.btnReady)}
      onClick={() => onServed?.(orderId)}
    >
      {copy.served}
    </button>
  );
}
