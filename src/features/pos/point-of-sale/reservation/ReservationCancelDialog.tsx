'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Modal } from '@/components/shared/ui/Modal';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

export interface ReservationCancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservationId?: string;
  guestName?: string;
  dateOrTime?: string;
}

/**
 * Global Reservation Cancel Confirmation Dialog
 *
 * Provides a standardized confirmation modal for cancelling reservations,
 * ensuring consistent styling, wording, and action handlers across list and detail views.
 */
export function ReservationCancelDialog({
  open,
  onClose,
  onConfirm,
  reservationId,
  guestName,
  dateOrTime,
}: Readonly<ReservationCancelDialogProps>) {
  const formattedId = reservationId
    ? reservationId.startsWith('#')
      ? reservationId
      : `#${reservationId.toUpperCase()}`
    : '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel Reservation"
      subtitle={formattedId ? `Confirm cancellation for ${formattedId}` : undefined}
      width={480}
      height="auto"
      padding={24}
      footer={
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', width: '100%' }}>
          <ActionButton variant="outlined" size="medium" onClick={onClose} sx={{ px: 2.5 }}>
            Keep Reservation
          </ActionButton>
          <ActionButton
            variant="primary"
            size="medium"
            onClick={onConfirm}
            sx={{
              px: 2.5,
              bgcolor: colors.danger.default,
              '&:hover': { bgcolor: colors.danger.dark },
            }}
          >
            Confirm Cancellation
          </ActionButton>
        </Stack>
      }
    >
      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
        Are you sure you want to cancel the reservation
        {guestName ? (
          <>
            {' '}
            for{' '}
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {guestName}
            </Box>
          </>
        ) : null}
        {dateOrTime ? (
          <>
            {' '}
            on{' '}
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {dateOrTime}
            </Box>
          </>
        ) : null}
        ? This will update the status to Cancelled and notify the staff.
      </Typography>
    </Modal>
  );
}

export default ReservationCancelDialog;
