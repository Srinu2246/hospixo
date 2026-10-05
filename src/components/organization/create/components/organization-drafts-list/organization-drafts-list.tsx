import Link from 'next/link';

import { AdminButton } from '@/components/ui';
import { organizationCreateCopy } from '@/constants/admin/organization-create';
import { routes } from '@/constants/routes';
import { StatusBadge } from '@/components/organization/status-badge/status-badge';
import type { OrganizationSummary } from '@/types/organization';

import styles from './organization-drafts-list.module.css';

type OrganizationDraftsListProps = Readonly<{
  drafts: readonly OrganizationSummary[];
}>;

export function OrganizationDraftsList({ drafts }: OrganizationDraftsListProps) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{organizationCreateCopy.draftsTitle}</h1>
          <p className={styles.subtitle}>{organizationCreateCopy.draftsSubtitle}</p>
        </div>
        <AdminButton href={routes.admin.organizationsCreateDetails}>
          + {organizationCreateCopy.breadcrumbCurrent}
        </AdminButton>
      </div>

      {drafts.length === 0 ? (
        <p className={styles.empty}>{organizationCreateCopy.draftsEmpty}</p>
      ) : (
        <ul className={styles.list}>
          {drafts.map((draft) => (
            <li key={draft.id} className={styles.item}>
              <div className={styles.itemMeta}>
                <p className={styles.itemName}>{draft.name || 'Untitled draft'}</p>
                <StatusBadge status={draft.status} />
              </div>
              <Link
                href={routes.admin.organizationCreateDraftPath(draft.id)}
                className={styles.resumeLink}
              >
                {organizationCreateCopy.resumeDraft}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
