import type { ReactNode } from 'react';

import { AdminButton } from '@/components/ui';
import { cn } from '@/helpers/cn';

import styles from './organization-create-actions.module.css';

type OrganizationCreateActionsProps = Readonly<{
  backHref?: string;
  backLabel?: string;
  cancelHref: string;
  primaryLabel: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  showBack?: boolean;
  onSaveDraft?: () => void;
  saveDraftLabel?: string;
  saveDraftDisabled?: boolean;
}>;

export function OrganizationCreateActions({
  backHref,
  backLabel = 'Back',
  cancelHref,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading = false,
  showBack = false,
  onSaveDraft,
  saveDraftLabel = 'Save as Draft',
  saveDraftDisabled,
}: OrganizationCreateActionsProps) {
  const draftDisabled = Boolean(primaryDisabled || saveDraftDisabled || primaryLoading);
  const draftClassName = cn(styles.draftButton, draftDisabled && styles.disabledAction);
  const primaryClassName = cn(
    styles.primary,
    (primaryDisabled || primaryLoading) && styles.disabledAction,
  );

  return (
    <div className={styles.actions}>
      {showBack && backHref ? (
        <AdminButton
          variant="secondary"
          href={backHref}
          className={styles.backButton}
          disabled={primaryLoading}
        >
          {backLabel}
        </AdminButton>
      ) : (
        <span />
      )}
      <div className={styles.right}>
        {onSaveDraft ? (
          <AdminButton
            variant="secondary"
            onClick={onSaveDraft}
            disabled={draftDisabled}
            className={draftClassName}
          >
            {saveDraftLabel}
          </AdminButton>
        ) : null}
        <AdminButton
          variant="secondary"
          href={cancelHref}
          className={styles.cancelButton}
          disabled={primaryLoading}
        >
          Cancel
        </AdminButton>
        <AdminButton
          onClick={onPrimary}
          disabled={primaryDisabled}
          loading={primaryLoading}
          className={primaryClassName}
        >
          {primaryLabel}
        </AdminButton>
      </div>
    </div>
  );
}

export function OrganizationCreateActionsSlot({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={styles.actions}>{children}</div>;
}
