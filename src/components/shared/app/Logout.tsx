'use client';

import { useState } from 'react';
import Stack from '@mui/material/Stack';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Modal } from '@/components/shared/ui/Modal';
import { clearSidebarSession } from '@/lib/auth/session';
import { useApiMutation } from '@/lib/hooks/api/useApiMutation';
import { colors } from '@/lib/theme/mui/colors';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

export interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutModal({ open, onClose }: Readonly<LogoutModalProps>) {
  const [error, setError] = useState<string | null>(null);
  const logout = useApiMutation<unknown, { revoke_all: false }>({
    path: ApiUrlsV1.auth.logout,
    method: 'POST',
  });

  function close() {
    if (logout.isPending) return;
    setError(null);
    onClose();
  }

  async function confirmLogout() {
    setError(null);
    try {
      await logout.mutateAsync({ revoke_all: false });
    } catch {
      // Best-effort logout notification; proceed with client session cleanup.
    } finally {
      clearSidebarSession();
      // Hard navigation so middleware sees cleared httpOnly cookies and resets client memory
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload required after auth cookie clear
      window.location.assign('/login');
    }
  }

  const loading = logout.isPending;

  return (
    <Modal
      open={open}
      onClose={close}
      loading={loading}
      title="Logout"
      width={460}
      height="auto"
      footer={
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', width: '100%' }}>
          <ActionButton variant="outlined" onClick={close} disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton
            onClick={confirmLogout}
            loading={loading}
            ariaLabel={loading ? 'Logging out' : 'Logout'}
            sx={{
              bgcolor: colors.danger.default,
              color: colors.white.default,
              '&:hover': {
                bgcolor: colors.danger.dark,
              },
            }}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </ActionButton>
        </Stack>
      }
    >
      <AlertMessage
        variant="error"
        message={
          error ??
          'Are you sure you want to log out? You will need to sign in again to access your account.'
        }
        sx={{ width: '100%' }}
      />
    </Modal>
  );
}
