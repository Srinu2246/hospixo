'use client';

import { LogOut } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useAdminLogoutMutation } from '@/hooks/auth/useAuthMutations';
import { adminTopbarCopy } from '@/constants/navigation';
import { AUTH_ROUTES } from '@/constants/routes';

import styles from './logout-dialog.module.css';

type AdminLogoutDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
}>;

export default function AdminLogoutDialog({ open, onClose }: AdminLogoutDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const logoutMutation = useAdminLogoutMutation();
  const pending = logoutMutation.isPending;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    cancelRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose, pending]);

  if (!open) return null;

  function handleConfirm() {
    logoutMutation.mutate(undefined, {
      onSuccess: (payload) => {
        window.location.assign(payload.redirectTo ?? AUTH_ROUTES.login);
      },
    });
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={pending ? undefined : onClose}>
      <div
        className={styles.card}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-logout-title"
        aria-describedby="admin-logout-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.iconWrap}>
          <LogOut className={styles.icon} aria-hidden />
        </div>
        <h2 id="admin-logout-title" className={styles.title}>
          {adminTopbarCopy.logoutTitle}
        </h2>
        <p id="admin-logout-description" className={styles.description}>
          {adminTopbarCopy.logoutMessage}
        </p>
        <div className={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            className={styles.cancelButton}
            disabled={pending}
            onClick={onClose}
          >
            {adminTopbarCopy.cancel}
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending ? adminTopbarCopy.loggingOut : adminTopbarCopy.confirmLogout}
          </button>
        </div>
      </div>
    </div>
  );
}
