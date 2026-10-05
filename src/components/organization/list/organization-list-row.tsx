'use client';

import { useTransition, type KeyboardEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';

import AdminNavLink from '@/components/shell/AdminNavLink';
import type { OrganizationSummary } from '@/types/organization';
import { cn } from '@/helpers/cn';
import { StatusBadge } from '../status-badge/status-badge';

import styles from './organization-list.module.css';

type OrganizationListRowProps = Readonly<{
  org: OrganizationSummary;
  href: string;
  createdLabel: string;
}>;

export function OrganizationListRow({ org, href, createdLabel }: OrganizationListRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate() {
    if (isPending) return;
    startTransition(() => {
      router.push(href);
    });
  }

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>) {
    if (event.defaultPrevented) return;
    navigate();
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate();
    }
  }

  return (
    <tr
      className={cn(styles.row, isPending && styles.rowPending)}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      onMouseEnter={() => router.prefetch(href)}
      tabIndex={0}
      role="link"
      aria-busy={isPending || undefined}
      aria-label={isPending ? `Opening ${org.name}` : `View ${org.name} details`}
    >
      <td className={styles.nameCell}>{org.name}</td>
      <td>
        <span className={styles.plan}>{org.plan.toUpperCase()}</span>
      </td>
      <td>{org.industry}</td>
      <td className={styles.countCell}>{org.companyCount}</td>
      <td className={styles.countCell}>{org.branchCount}</td>
      <td>
        <StatusBadge status={org.status} />
      </td>
      <td>{createdLabel}</td>
      <td className={styles.actionsCell}>
        <AdminNavLink
          href={href}
          prefetch={false}
          className={styles.viewButton}
          aria-label={`View ${org.name} details`}
          onClick={(event) => event.stopPropagation()}
        >
          <Eye className={styles.viewIcon} aria-hidden />
        </AdminNavLink>
      </td>
    </tr>
  );
}
