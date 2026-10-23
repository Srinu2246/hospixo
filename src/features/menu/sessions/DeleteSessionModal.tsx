'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { AlertTriangle } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Modal } from '@/components/shared/ui/Modal';
import type { SessionRecord } from '@/lib/schemas/menu/sessions/sessionSchema';
import { colors } from '@/lib/theme/mui/colors';
import { useThemeStore } from '@/stores/themeStore';

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
  const mode = useThemeStore((state) => state.mode);
  const isDark = mode === 'dark';
  const textPrimary = isDark ? colors.text.darkPrimary : colors.text.primary;
  const textSecondary = isDark ? colors.text.darkSecondary : colors.text.secondary;
  const surfaceBg = isDark ? colors.surface.dark : colors.surface.default;
  const borderColor = isDark ? colors.border.dark : colors.border.default;

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
              borderColor,
              color: textPrimary,
              bgcolor: surfaceBg,
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
              bgcolor: colors.danger.default,
              '&:hover': { bgcolor: colors.danger.dark },
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
              bgcolor: alpha(colors.danger.default, isDark ? 0.18 : 0.12),
              color: colors.danger.default,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </Stack>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: '1.125rem', color: textPrimary }}
          >
            Delete Session
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          sx={{ color: textSecondary, fontSize: '0.875rem', lineHeight: 1.5 }}
        >
          Are you sure you want to delete <strong>{session.name}</strong> ({session.startTime} -{' '}
          {session.endTime})? This action cannot be undone.
        </Typography>
      </Stack>
    </Modal>
  );
}
