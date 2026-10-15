import styles from '@/features/floor-table-setup/components/shared/floor-setup-filter-fields.module.css';

type FloorSetupFilterFieldLabelProps = Readonly<{
  htmlFor?: string;
  children: string;
  required?: boolean;
}>;

export function FloorSetupFilterFieldLabel({
  htmlFor,
  children,
  required = true,
}: FloorSetupFilterFieldLabelProps) {
  if (htmlFor) {
    return (
      <label id={`${htmlFor}-label`} htmlFor={htmlFor} className={styles.label}>
        <span className={styles.labelText}>{children}</span>
        {required ? <span className={styles.required}>*</span> : null}
      </label>
    );
  }

  return (
    <span className={styles.label}>
      <span className={styles.labelText}>{children}</span>
      {required ? <span className={styles.required}>*</span> : null}
    </span>
  );
}
