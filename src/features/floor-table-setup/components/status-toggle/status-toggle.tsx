import { cn } from '@/lib/utils';

import styles from './status-toggle.module.css';

type StatusToggleProps = Readonly<{
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}>;

export function StatusToggle({ label, hint, checked, onChange }: StatusToggleProps) {
  return (
    <div className={styles.row}>
      <div className={styles.copy}>
        <p className={styles.label}>{label}</p>
        {hint ? <p className={styles.hint}>{hint}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={cn(styles.switch, checked && styles.switchOn)}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} aria-hidden="true" />
      </button>
    </div>
  );
}
