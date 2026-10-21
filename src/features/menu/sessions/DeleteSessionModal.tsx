'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AlertTriangle } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Modal } from '@/components/shared/ui/Modal';
import type { SessionRecord } from '@/lib/schemas/menu/sessions/sessionSchema';

export interface DeleteSessionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  session: SessionRecord | null;
  loading?: boolean;
}

export function DeleteSessionModal({
  open,
  onClose,
  onConfirm,
  session,
  loading = false,
}: Readonly<DeleteSessionModalProps>) {
  if (!session) return null;

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      showCloseButton={false}
      width={440}
      height="auto"
      padding="28px 24px 24px 24px"
      gap={0}
      footer={
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'flex-end', width: '100%', pt: 2 }}
        >
          <ActionButton
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              minWidth: 90,
              borderRadius: '8px',
              borderColor: '#D1D5DB',
              color: '#374151',
            }}
          >
            Cancel
          </ActionButton>

          <ActionButton
            variant="primary"
            onClick={onConfirm}
            loading={loading}
            sx={{
              minWidth: 120,
              borderRadius: '8px',
              bgcolor: '#DC2626',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            Delete Session
          </ActionButton>
        </Stack>
      }
    >
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Stack
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: '#FEE2E2',
              color: '#DC2626',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#111827' }}>
            Delete Session
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          sx={{ color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.5 }}
        >
          Are you sure you want to delete <strong>{session.name}</strong> ({session.startTime} -{' '}
          {session.endTime})? This action cannot be undone.
        </Typography>
      </Stack>
    </Modal>
  );
}
