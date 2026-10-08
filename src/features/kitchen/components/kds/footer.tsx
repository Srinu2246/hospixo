import { cn } from '@/lib/utils';
import type { KdsConnectionStatus } from '@/types/kds';

type KdsFooterCopy = Readonly<{
  printerConnected: string;
  printerDisconnected: string;
  posSyncActive: string;
  posSyncInactive: string;
  avgPrep: string;
}>;

type KdsFooterProps = Readonly<{
  styles: Readonly<Record<string, string>>;
  copy: KdsFooterCopy;
  status: KdsConnectionStatus;
}>;

export function KdsFooter({ styles, copy, status }: KdsFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <StatusPill
          styles={styles}
          ok={status.printerConnected}
          label={status.printerConnected ? copy.printerConnected : copy.printerDisconnected}
        />
        <StatusPill
          styles={styles}
          ok={status.posSyncActive}
          label={status.posSyncActive ? copy.posSyncActive : copy.posSyncInactive}
        />
      </div>

      {status.avgPrepTimeLabel ? (
        <p className={styles.avg}>
          {copy.avgPrep}: <strong>{status.avgPrepTimeLabel}</strong>
        </p>
      ) : null}
    </footer>
  );
}

function StatusPill({
  styles,
  ok,
  label,
}: Readonly<{
  styles: Readonly<Record<string, string>>;
  ok: boolean;
  label: string;
}>) {
  return (
    <span className={styles.pill}>
      <span className={cn(styles.dot, ok ? styles.dotOk : styles.dotOff)} aria-hidden="true" />
      {label}
    </span>
  );
}
