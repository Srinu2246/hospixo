'use client';

import { useTransition, type ReactNode } from 'react';

import { AdminButton } from '@/components/ui';
import { cn } from '@/helpers/cn';

import styles from './wizard-actions.module.css';

type WizardActionsProps = Readonly<{
  backHref: string;
  backLabel?: string;
  nextLabel?: string;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  primaryLabel?: string;
  onPrimary?: () => void | Promise<void>;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
}>;

export function WizardActions({
  backHref,
  backLabel = 'Back',
  nextLabel = 'Next Step',
  onNext,
  nextDisabled,
  nextLoading = false,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading = false,
}: WizardActionsProps) {
  const [isPending, startTransition] = useTransition();
  const nextBlocked = Boolean(nextDisabled || nextLoading || isPending);
  const primaryBlocked = Boolean(primaryDisabled || primaryLoading || isPending);
  const nextClassName = cn(styles.stretch, nextBlocked && styles.disabledAction);
  const primaryClassName = cn(styles.stretch, primaryBlocked && styles.disabledAction);

  function handleNext() {
    if (!onNext || nextDisabled || isPending) return;
    startTransition(() => {
      onNext();
    });
  }

  function handlePrimary() {
    if (!onPrimary || primaryDisabled || isPending) return;
    startTransition(() => {
      void onPrimary();
    });
  }

  return (
    <div className={styles.actions}>
      <AdminButton
        variant="secondary"
        href={backHref}
        className={styles.stretch}
        disabled={primaryLoading || nextLoading}
      >
        {backLabel}
      </AdminButton>
      <div className={styles.group}>
        {onPrimary ? (
          <AdminButton
            onClick={handlePrimary}
            disabled={primaryDisabled}
            loading={primaryLoading || isPending}
            className={primaryClassName}
          >
            {primaryLabel}
          </AdminButton>
        ) : (
          <AdminButton
            onClick={handleNext}
            disabled={nextDisabled}
            loading={nextLoading || isPending}
            className={nextClassName}
          >
            {nextLabel}
          </AdminButton>
        )}
      </div>
    </div>
  );
}

export function WizardActionsSlot({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className={styles.actions}>{children}</div>;
}
