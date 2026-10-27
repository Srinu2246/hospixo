'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { AlertTriangle } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Modal } from '@/components/shared/ui/Modal';
import { colors } from '@/lib/theme/mui/colors';

export interface DeleteTableModalProps {
  open: boolean;
  tableName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteTableModal({
  open,
  tableName,
  loading = false,
  onClose,
  onConfirm,
}: Readonly<DeleteTableModalProps>) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      showCloseButton={false}
      width={440}
      height="auto"
      padding="28px 24px 24px"
      gap={0}
      loading={loading}
      footer={
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'flex-end', width: '100%', pt: 2 }}
        >
          <ActionButton variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={onConfirm}
            loading={loading}
            sx={{
              bgcolor: colors.danger.default,
              '&:hover:not(.Mui-disabled)': { bgcolor: colors.danger.dark },
            }}
          >
            Delete Table
          </ActionButton>
        </Stack>
      }
    >
      <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: (theme) =>
                alpha(colors.danger.default, theme.palette.mode === 'dark' ? 0.18 : 0.12),
              color: colors.danger.default,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.125rem' }}>Delete Table</Typography>
        </Stack>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong>{tableName}</strong>? This action cannot be
          undone.
        </Typography>
      </Stack>
    </Modal>
  );
}
