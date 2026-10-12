'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import { Check, Printer, PlusCircle } from 'lucide-react';

import { useThemeStore } from '@/stores/themeStore';
import { colors } from '@/lib/theme/mui/colors';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import {
  MOCK_CLOSE_SHIFT_SUCCESS,
  type CloseShiftSuccessDetails,
} from '@/lib/mocks/pos/usePosCashShift.mocks';

export interface CloseShiftSuccessPageProps {
  summary?: CloseShiftSuccessDetails;
  onGoToDashboard?: () => void;
  onStartNewShift?: () => void;
}

/**
 * CloseShiftSuccessPage Component
 *
 * Screen matching the "shift-closed-confirmation" reference design:
 * - Centered success confirmation layout with badge icon.
 * - Shift closing summary card with "BALANCED" status chip, audit metrics,
 *   and "Shift report printed" banner.
 * - Navigation triggers to return to dashboard or start a new shift.
 *
 * Pure UI presentation strictly using theme tokens from `@/stores/themeStore` and `@/lib/theme/mui/colors`.
 */
export function CloseShiftSuccessPage({
  summary = MOCK_CLOSE_SHIFT_SUCCESS,
  onGoToDashboard,
  onStartNewShift,
}: Readonly<CloseShiftSuccessPageProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const mode = useThemeStore((state) => state.mode);

  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
      return;
    }
    const current = pathname ? pathname.replace(/\/+$/, '') : '';
    if (current.includes('cash-shift')) {
      const base = current.replace(/\/close\/success$/, '').replace(/\/success$/, '');
      router.push(base || '/pos/point-of-sale/cash-shift');
    } else {
      router.push('/pos/point-of-sale/cash-shift');
    }
  };

  const handleStartNewShift = () => {
    if (onStartNewShift) {
      onStartNewShift();
      return;
    }
    const current = pathname ? pathname.replace(/\/+$/, '') : '';
    if (current.includes('cash-shift')) {
      const base = current.replace(/\/close\/success$/, '').replace(/\/success$/, '');
      router.push(`${base}/new`);
    } else {
      router.push('/pos/point-of-sale/cash-shift/new');
    }
  };

  const textPrimary = mode === 'dark' ? colors.text.darkPrimary : colors.text.primary;
  const textSecondary = mode === 'dark' ? colors.text.darkSecondary : colors.text.secondary;
  const surfaceBg = mode === 'dark' ? colors.surface.dark : colors.surface.default;
  const borderColor = mode === 'dark' ? colors.border.dark : colors.border.default;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Success Starburst Icon Badge */}
      <Box
        sx={{
          position: 'relative',
          width: 72,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 68 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <path
            d="M 31.46 5.25 Q 34.00 2.00 36.54 5.25 Q 39.07 8.50 42.66 6.47 Q 46.25 4.44 47.35 8.41 Q 48.44 12.38 52.54 11.88 Q 56.63 11.37 56.12 15.46 Q 55.62 19.56 59.59 20.65 Q 63.56 21.75 61.53 25.34 Q 59.50 28.93 62.75 31.46 Q 66.00 34.00 62.75 36.54 Q 59.50 39.07 61.53 42.66 Q 63.56 46.25 59.59 47.35 Q 55.62 48.44 56.12 52.54 Q 56.63 56.63 52.54 56.12 Q 48.44 55.62 47.35 59.59 Q 46.25 63.56 42.66 61.53 Q 39.07 59.50 36.54 62.75 Q 34.00 66.00 31.46 62.75 Q 28.93 59.50 25.34 61.53 Q 21.75 63.56 20.65 59.59 Q 19.56 55.62 15.46 56.12 Q 11.37 56.63 11.88 52.54 Q 12.38 48.44 8.41 47.35 Q 4.44 46.25 6.47 42.66 Q 8.50 39.07 5.25 36.54 Q 2.00 34.00 5.25 31.46 Q 8.50 28.93 6.47 25.34 Q 4.44 21.75 8.41 20.65 Q 12.38 19.56 11.88 15.46 Q 11.37 11.37 15.46 11.88 Q 19.56 12.38 20.65 8.41 Q 21.75 4.44 25.34 6.47 Q 28.93 8.50 31.46 5.25 Z"
            fill={mode === 'dark' ? alpha(colors.success.default, 0.22) : '#DCFCE7'}
          />
        </svg>
        <Check
          size={30}
          color={mode === 'dark' ? colors.success.light : '#16A34A'}
          strokeWidth={3}
          style={{ position: 'relative', zIndex: 1 }}
        />
      </Box>

      {/* 2. Header Headings */}
      <Box sx={{ textAlign: 'center', mb: 3.5 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '1.875rem' },
            color: textPrimary,
            letterSpacing: '-0.02em',
          }}
        >
          {summary.shiftNumber} Closed Successfully
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: textSecondary,
            fontSize: '0.875rem',
            mt: 0.75,
            fontWeight: 500,
          }}
        >
          Shift closed on {summary.closedAt}
        </Typography>
      </Box>

      {/* 3. Shift Closing Summary Card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 540,
          bgcolor: surfaceBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          p: { xs: 2.5, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'none',
          boxSizing: 'border-box',
        }}
      >
        {/* Header Row: Title + BALANCED Chip */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
            borderBottom: `1px solid ${mode === 'dark' ? colors.divider.dark : '#F3F4F6'}`,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: textPrimary,
            }}
          >
            Shift Closing Summary
          </Typography>

          <Box
            sx={{
              px: 1.25,
              py: 0.35,
              borderRadius: '6px',
              bgcolor: mode === 'dark' ? alpha(colors.success.default, 0.2) : '#DCFCE7',
              color: mode === 'dark' ? colors.success.light : '#16A34A',
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            BALANCED
          </Box>
        </Box>

        {/* Row 1 Metrics: Opened By, Time Range, Duration */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            py: 2,
            borderBottom: `1px solid ${mode === 'dark' ? colors.divider.dark : '#F3F4F6'}`,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              OPENED BY
            </Typography>
            <Typography
              sx={{ fontSize: '0.9375rem', fontWeight: 800, color: textPrimary, mt: 0.35 }}
            >
              {summary.openedBy}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              TIME RANGE
            </Typography>
            <Typography
              sx={{ fontSize: '0.9375rem', fontWeight: 800, color: textPrimary, mt: 0.35 }}
            >
              {summary.timeRange}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              DURATION
            </Typography>
            <Typography
              sx={{ fontSize: '0.9375rem', fontWeight: 800, color: textPrimary, mt: 0.35 }}
            >
              {summary.duration}
            </Typography>
          </Box>
        </Box>

        {/* Row 2 Metrics: Total Sales, Transactions, Cash Difference */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            py: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              TOTAL SALES
            </Typography>
            <Typography
              sx={{ fontSize: '0.9375rem', fontWeight: 800, color: textPrimary, mt: 0.35 }}
            >
              {summary.totalSales}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              TRANSACTIONS
            </Typography>
            <Typography
              sx={{ fontSize: '0.9375rem', fontWeight: 800, color: textPrimary, mt: 0.35 }}
            >
              {summary.transactions}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              CASH DIFFERENCE
            </Typography>
            <Typography
              sx={{ fontSize: '0.9375rem', fontWeight: 800, color: textPrimary, mt: 0.35 }}
            >
              {summary.cashDifference}
            </Typography>
          </Box>
        </Box>

        {/* Shift Report Printed Pill Banner */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1.5,
            mt: 0.5,
            borderRadius: '10px',
            bgcolor: mode === 'dark' ? alpha(colors.primary.default, 0.12) : '#EFF6FF',
            border: `1px solid ${mode === 'dark' ? alpha(colors.primary.default, 0.25) : '#DBEAFE'}`,
          }}
        >
          <Printer size={16} color={colors.primary.default} />
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: colors.primary.default,
            }}
          >
            Shift report printed
          </Typography>
        </Box>
      </Box>

      {/* 4. Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3.5 }}>
        <ActionButton
          variant="outlined"
          size="medium"
          onClick={handleGoToDashboard}
          sx={{
            borderRadius: '10px',
            borderColor: borderColor,
            bgcolor: surfaceBg,
            color: textPrimary,
            fontWeight: 600,
            fontSize: '0.875rem',
            height: 42,
            px: 3,
            '&:hover': {
              bgcolor: mode === 'dark' ? colors.surface.darkMuted : '#F9FAFB',
            },
          }}
        >
          Go to Dashboard
        </ActionButton>

        <ActionButton
          variant="primary"
          size="medium"
          startIcon={<PlusCircle size={18} />}
          onClick={handleStartNewShift}
          sx={{
            borderRadius: '10px',
            bgcolor: colors.primary.default,
            color: colors.white.default,
            fontWeight: 600,
            fontSize: '0.875rem',
            height: 42,
            px: 3,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: colors.primary.dark,
            },
          }}
        >
          Start New Shift
        </ActionButton>
      </Stack>

      {/* 5. Footer Email Notice */}
      <Typography
        sx={{
          color: textSecondary,
          fontSize: '0.75rem',
          textAlign: 'center',
          mt: 3,
          lineHeight: 1.4,
        }}
      >
        A copy of this summary has been sent to the outlet manager&apos;s email (
        {summary.managerEmail})
      </Typography>
    </Box>
  );
}

export default CloseShiftSuccessPage;
