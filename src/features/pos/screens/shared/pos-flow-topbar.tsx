import styles from './pos-flow-topbar.module.css';

interface PosFlowTopbarProps {
  statusLabel: string;
  fullWidth?: boolean;
}

export function PosFlowTopbar({ statusLabel, fullWidth = false }: Readonly<PosFlowTopbarProps>) {
  return (
    <header className={`${styles.topbar} ${fullWidth ? styles.topbarFullWidth : ''}`}>
      <div className={styles.inner}>
        <span className={styles.badge}>{statusLabel}</span>
      </div>
    </header>
  );
}
