import styles from './profile-switch.module.css';

type ProfileSwitchProps = Readonly<{
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  hint?: string;
}>;

export function ProfileSwitch({ checked, label, onCheckedChange, hint }: ProfileSwitchProps) {
  return (
    <div className={styles.row}>
      <div className={styles.copy}>
        <span className={styles.label}>{label}</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`${styles.switch} ${checked ? styles.switchOn : ''}`}
        onClick={() => onCheckedChange(!checked)}
      >
        <span className={styles.switchThumb} />
      </button>
    </div>
  );
}
