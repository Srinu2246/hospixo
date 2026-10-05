'use client';

import { Info } from 'lucide-react';

import { ProfileModalShell } from '@/features/profile/components/shared/profile-modal-shell';
import { logoutDialogCopy } from '@/features/profile/config/profile';
import { useLogout } from '@/features/profile/hooks/use-logout';

import styles from './logout-dialog.module.css';

type LogoutDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const { performLogout } = useLogout();

  async function handleConfirm() {
    onOpenChange(false);
    await performLogout();
  }

  return (
    <ProfileModalShell
      open={open}
      title={logoutDialogCopy.title}
      onClose={() => onOpenChange(false)}
      footer={
        <>
          <button type="button" className={styles.cancelButton} onClick={() => onOpenChange(false)}>
            {logoutDialogCopy.cancel}
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={() => void handleConfirm()}
          >
            {logoutDialogCopy.confirm}
          </button>
        </>
      }
    >
      <div className={styles.alert} role="alert">
        <Info className={styles.alertIcon} aria-hidden="true" />
        <p className={styles.alertText}>{logoutDialogCopy.message}</p>
      </div>
    </ProfileModalShell>
  );
}
