'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Modal } from '@/components/shared/ui/Modal';
import { useApiMutation } from '@/lib/hooks/api/useApiMutation';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { useSidebarStore } from '@/stores/sidebarStore';

export interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutModal({ open, onClose }: Readonly<LogoutModalProps>) {
  const router = useRouter();
  const clearSession = useSidebarStore((state) => state.clearSession);
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
      clearSession();
      onClose();
      router.replace('/login');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to log out');
    }
  }

  const loading = logout.isPending;

  return (
    <Modal
      open={open}
      onClose={close}
      loading={loading}
      title="Log out"
      subtitle="You will need to sign in again to continue."
      width={440}
      height="auto"
      footer={
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <ActionButton variant="outlined" onClick={close} disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton
            onClick={confirmLogout}
            loading={loading}
            ariaLabel={loading ? 'Logging out' : 'Log out'}
          >
            {loading ? 'Logging out...' : 'Log out'}
          </ActionButton>
        </Stack>
      }
    >
      <Typography sx={{ color: error ? 'error.main' : 'text.secondary', fontSize: '0.9375rem' }}>
        {error ?? 'Log out of Hospixo on this device?'}
      </Typography>
    </Modal>
  );
}
