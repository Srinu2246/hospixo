import { formatOrganizationResponseEntries } from '../../lib/format-response-data';

import styles from './organization-mutation-data-panel.module.css';

type OrganizationMutationDataPanelProps = Readonly<{
  title?: string;
  data: Record<string, unknown>;
}>;

export function OrganizationMutationDataPanel({
  title = 'Platform response',
  data,
}: OrganizationMutationDataPanelProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const entries = formatOrganizationResponseEntries(data);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className={styles.panel} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      <dl className={styles.list}>
        {entries.map((entry) => (
          <div key={entry.label} className={styles.row}>
            <dt>{entry.label}</dt>
            <dd>{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
