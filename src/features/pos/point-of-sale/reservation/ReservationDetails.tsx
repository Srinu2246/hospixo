'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Check, SquarePen, Trash2 } from 'lucide-react';

import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Card } from '@/components/shared/ui/Card';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { ReservationDialog, type NewReservationFormData } from './ReservationDialog';
import { ReservationCancelDialog } from './ReservationCancelDialog';
import { colors } from '@/lib/theme/mui/colors';
import {
  getMockReservationDetail,
  type ReservationDetailItem,
} from '@/lib/mocks/pos/usePosReservations.mocks';

export interface ReservationDetailsProps {
  reservationId?: string; // Target reservation ID from route (e.g. #RES-2024-0847 or RES-2024-0847)
  initialData?: ReservationDetailItem; // Optional initial data override
  onBack?: () => void; // Optional back navigation handler
}

/**
 * ReservationDetails component
 *
 * Displays detailed reservation and guest information cards, breadcrumbs with status chip,
 * check-in action, edit modal prefill, and cancel confirmation modal.
 */
export function ReservationDetails({
  reservationId,
  initialData,
  onBack,
}: Readonly<ReservationDetailsProps>) {
  const [reservation, setReservation] = useState<ReservationDetailItem>(
    () => initialData ?? getMockReservationDetail(reservationId),
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const parentReservationsUrl = pathname
    ? pathname.replace(/\/[^/]+$/, '')
    : '/pos/point-of-sale/reservation';

  // Synchronize state when reservationId or initialData changes
  useEffect(() => {
    setReservation(initialData ?? getMockReservationDetail(reservationId));
  }, [reservationId, initialData]);

  // Check In Guest handler
  const handleCheckIn = () => {
    setReservation((prev) => ({
      ...prev,
      status: 'checked-in',
    }));
  };

  // Confirm cancel reservation handler
  const handleConfirmCancel = () => {
    setReservation((prev) => ({
      ...prev,
      status: 'cancelled',
    }));
    setIsCancelModalOpen(false);
  };

  // Update reservation from edit dialog
  const handleSaveEdit = (formData: NewReservationFormData) => {
    setReservation((prev) => ({
      ...prev,
      guestName: formData.guest,
      phone: formData.phone,
      partySize: formData.guestCount,
      time: formData.time ? `${formData.time} to 02:00 PM` : prev.time,
      specialRequests: formData.specialRequests
        ? formData.specialRequests.split(',').map((s) => s.trim())
        : prev.specialRequests,
    }));
  };

  // Resolve status label for the chip
  const statusLabel =
    reservation.status === 'confirmed'
      ? 'Confirmed'
      : reservation.status === 'checked-in'
        ? 'Checked In'
        : 'Cancelled';

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        boxSizing: 'border-box',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Toolbar: Breadcrumb + Action Buttons                 */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Left: Breadcrumbs navigation */}
        <Breadcrumbs
          variant="title"
          size="medium"
          items={[
            {
              label: 'Reservations',
              href: onBack ? undefined : parentReservationsUrl,
              onClick: onBack ?? (() => router.push(parentReservationsUrl)),
            },
            {
              label: reservation.id,
              bold: true,
            },
          ]}
          chip={<StatusChip status={reservation.status} label={statusLabel} />}
        />

        {/* Right: Action Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ActionButton
            variant="outlined"
            size="medium"
            startIcon={<SquarePen size={16} />}
            onClick={() => setIsEditDialogOpen(true)}
            sx={{
              height: 38,
              px: 2,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.primary',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.secondary',
              },
            }}
          >
            Edit Reservation
          </ActionButton>

          <ActionButton
            variant="outlined"
            size="medium"
            startIcon={<Trash2 size={16} />}
            onClick={() => setIsCancelModalOpen(true)}
            disabled={reservation.status === 'cancelled'}
            sx={{
              height: 38,
              px: 2,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: colors.danger.default,
              borderColor: alpha(colors.danger.default, 0.4),
              bgcolor: 'background.paper',
              '&:hover': {
                borderColor: colors.danger.default,
                bgcolor: alpha(colors.danger.default, 0.08),
              },
            }}
          >
            Cancel Reservation
          </ActionButton>
        </Stack>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Details Grid: Guest Information & Reservation Details Cards  */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        {/* Card 1: Guest Information */}
        <Card
          variant="outlined"
          title="Guest Information"
          titleFontSize="1.0625rem"
          headerPadding="20px 24px 16px 24px"
          padding="0 24px 20px 24px"
          sx={{
            borderRadius: '12px',
            bgcolor: 'background.paper',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Full Name */}
            <DetailRow label="Full Name" value={reservation.guestName} isBold />

            {/* Phone */}
            <DetailRow label="Phone" value={reservation.phone} isBold />

            {/* Visit History */}
            <DetailRow label="Visit History" value={reservation.visitHistory} isBold />

            {/* Description */}
            <DetailRow label="Description" value={reservation.description || '—'} />

            {/* SMS */}
            <DetailRow
              label="SMS"
              isLast
              value={
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: colors.success.default,
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
                    {reservation.smsStatus}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Card>

        {/* Card 2: Reservation Details */}
        <Card
          variant="outlined"
          title="Reservation Details"
          titleFontSize="1.0625rem"
          headerPadding="20px 24px 16px 24px"
          padding="0 24px 20px 24px"
          sx={{
            borderRadius: '12px',
            bgcolor: 'background.paper',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Date */}
            <DetailRow label="Date" value={reservation.date} isBold />

            {/* Time */}
            <DetailRow label="Time" value={reservation.time} isBold />

            {/* Party Size */}
            <DetailRow
              label="Party Size"
              value={`${reservation.partySize} ${reservation.partySize === 1 ? 'Guest' : 'Guests'}`}
              isBold
            />

            {/* Table */}
            <DetailRow label="Table" value={reservation.table} isBold />

            {/* Seating Preference */}
            <DetailRow label="Seating Preference" value={reservation.seatingPreference} isBold />

            {/* Special Requests */}
            <DetailRow
              label="Special Requests"
              isLast
              value={
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {reservation.specialRequests && reservation.specialRequests.length > 0 ? (
                    reservation.specialRequests.map((request) => (
                      <Box
                        key={request}
                        sx={{
                          px: 1.25,
                          py: 0.5,
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark' ? 'action.hover' : 'background.paper',
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          lineHeight: 1.2,
                        }}
                      >
                        {request}
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                      None
                    </Typography>
                  )}
                </Box>
              }
            />
          </Box>
        </Card>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 3. Bottom Action Bar: Check In Guest Button                    */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2.5,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <ActionButton
          variant="primary"
          size="medium"
          startIcon={reservation.status === 'checked-in' ? undefined : <Check size={18} />}
          onClick={handleCheckIn}
          disabled={reservation.status === 'checked-in' || reservation.status === 'cancelled'}
          sx={{
            height: 42,
            px: 3,
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            bgcolor: colors.primary.default,
            boxShadow: `0 2px 8px ${colors.sidebar.activeGlow}`,
            '&:hover': {
              bgcolor: colors.primary.dark,
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'text.disabled',
            },
          }}
        >
          {reservation.status === 'checked-in' ? 'Guest Checked In' : 'Check In Guest'}
        </ActionButton>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 4. Edit Reservation Dialog Modal (Prefilled)                   */}
      {/* ------------------------------------------------------------- */}
      <ReservationDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onConfirm={handleSaveEdit}
        title="Edit Reservation"
        initialData={{
          guest: reservation.guestName,
          phone: reservation.phone,
          guestCount: reservation.partySize,
          date: '02 Sep',
          time: '12:00 PM',
          specialRequests: reservation.specialRequests.join(', '),
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 5. Cancel Reservation Confirmation Dialog                      */}
      {/* ------------------------------------------------------------- */}
      <ReservationCancelDialog
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        reservationId={reservation.id}
        guestName={reservation.guestName}
        dateOrTime={reservation.date}
      />
    </Box>
  );
}

/**
 * Helper component for structured detail rows separated by divider borders
 */
interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  isBold?: boolean;
  isLast?: boolean;
}

function DetailRow({ label, value, isBold = false, isLast = false }: Readonly<DetailRowProps>) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.75,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
        gap: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'text.secondary',
          minWidth: { xs: 100, sm: 140 },
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>

      <Box sx={{ flex: 1, textAlign: 'left' }}>
        {typeof value === 'string' ? (
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: isBold ? 700 : 500,
              color: isBold ? 'text.primary' : 'text.secondary',
            }}
          >
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
}
