'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { alpha } from '@mui/material/styles';
import { Info, Lock, Printer, Banknote, CreditCard, QrCode, Gift, Ticket } from 'lucide-react';

import { useThemeStore } from '@/stores/themeStore';
import { colors } from '@/lib/theme/mui/colors';
import { Card } from '@/components/shared/ui/Card';
import { CardItemSection } from '@/components/shared/ui/CardItemSection';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import {
  MOCK_CLOSE_SHIFT_DETAILS,
  type CloseShiftDetails,
} from '@/lib/mocks/pos/usePosCashShift.mocks';

export interface CloseShiftPageProps {
  shiftData?: CloseShiftDetails;
  onPrintSummary?: () => void;
  onConfirmClose?: () => void;
  onCancel?: () => void;
}

/**
 * CloseShiftPage Component
 *
 * Screen matching the "close-shift-verification" reference design:
 * - Fixed Header: Page title and subtitle.
 * - 2-Column Responsive Layout:
 *   - Left side: Shift summary KPI metrics, payment method breakdown, and shift closing notes.
 *   - Right side: FIXED (no scrolling) Cash Reconciliation card implemented using `@/components/shared/ui/Card`.
 * - Fixed Footer: Print summary and Confirm & Close Shift actions.
 *
 * Pure UI presentation strictly using theme tokens from `@/stores/themeStore` and `@/lib/theme/mui/colors`.
 */
export function CloseShiftPage({
  shiftData = MOCK_CLOSE_SHIFT_DETAILS,
  onPrintSummary,
  onConfirmClose,
  onCancel,
}: Readonly<CloseShiftPageProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const mode = useThemeStore((state) => state.mode);

  const handleConfirmClose = () => {
    if (onConfirmClose) {
      onConfirmClose();
      return;
    }
    const current = pathname ? pathname.replace(/\/+$/, '') : '';
    if (current.includes('cash-shift')) {
      const base = current.endsWith('/close')
        ? current
        : current.substring(0, current.indexOf('/cash-shift') + '/cash-shift'.length) + '/close';
      router.push(`${base}/success`);
    } else {
      router.push('/pos/point-of-sale/cash-shift/close/success');
    }
  };

  const current = pathname ? pathname.replace(/\/+$/, '') : '';
  const dashboardUrl = current.includes('cash-shift')
    ? (current.endsWith('/close')
        ? current.replace(/\/close$/, '')
        : current.substring(0, current.indexOf('/cash-shift') + '/cash-shift'.length)) ||
      '/pos/point-of-sale/cash-shift'
    : '/pos/point-of-sale/cash-shift';

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    router.push(dashboardUrl);
  };

  const handlePrintSummary = () => {
    if (onPrintSummary) {
      onPrintSummary();
      return;
    }
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const textPrimary = mode === 'dark' ? colors.text.darkPrimary : colors.text.primary;
  const textSecondary = mode === 'dark' ? colors.text.darkSecondary : colors.text.secondary;
  const surfaceBg = mode === 'dark' ? colors.surface.dark : colors.surface.default;
  const surfaceMuted = mode === 'dark' ? colors.surface.darkMuted : colors.background.default;
  const borderColor = mode === 'dark' ? colors.border.dark : colors.border.default;
  const dividerColor = mode === 'dark' ? colors.divider.dark : colors.divider.default;

  // Icon mapping for payment methods
  const getPaymentIcon = (id: string) => {
    switch (id) {
      case 'cash':
        return <Banknote size={18} color={colors.text.secondary} />;
      case 'card':
        return <CreditCard size={18} color={colors.text.secondary} />;
      case 'upi':
        return <QrCode size={18} color={colors.text.secondary} />;
      case 'complementary':
        return <Gift size={18} color={colors.text.secondary} />;
      default:
        return <CreditCard size={18} color={colors.text.secondary} />;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Fixed Page Header with Breadcrumbs                         */}
      {/* ------------------------------------------------------------- */}
      <Box sx={{ flexShrink: 0 }}>
        <Breadcrumbs
          size="small"
          items={[
            {
              label: 'Cash & Shift',
              href: dashboardUrl,
              onClick: (e) => {
                e.preventDefault();
                handleCancel();
              },
            },
            {
              label: `Close Shift ${shiftData.shiftId}`,
              bold: true,
            },
          ]}
          sx={{ mb: 1 }}
        />
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.25rem', sm: '1.375rem' },
            color: textPrimary,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Close Shift
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: textSecondary,
            fontSize: '0.8125rem',
            fontWeight: 500,
            mt: 0.25,
          }}
        >
          Review and confirm shift {shiftData.shiftId} closing details
        </Typography>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main 2-Column Section                                      */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2.5,
          overflow: 'hidden',
        }}
      >
        {/* Left Column: Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            pr: { md: 1 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Card A: Shift Summary */}
          <Box
            sx={{
              bgcolor: surfaceBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              p: 2.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: textPrimary,
                mb: 2,
              }}
            >
              Shift Summary
            </Typography>

            {/* 3x2 KPI Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2.5,
                mb: 2.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: textSecondary,
                    textTransform: 'uppercase',
                  }}
                >
                  SHIFT ID
                </Typography>
                <Typography
                  sx={{ fontSize: '1rem', fontWeight: 800, color: textPrimary, mt: 0.25 }}
                >
                  {shiftData.shiftId}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: textSecondary,
                    textTransform: 'uppercase',
                  }}
                >
                  OPENED BY
                </Typography>
                <Typography
                  sx={{ fontSize: '0.9375rem', fontWeight: 700, color: textPrimary, mt: 0.25 }}
                >
                  {shiftData.openedBy}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: textSecondary,
                    textTransform: 'uppercase',
                  }}
                >
                  START TIME
                </Typography>
                <Typography
                  sx={{ fontSize: '0.9375rem', fontWeight: 700, color: textPrimary, mt: 0.25 }}
                >
                  {shiftData.startTime}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: textSecondary,
                    textTransform: 'uppercase',
                  }}
                >
                  DURATION
                </Typography>
                <Typography
                  sx={{ fontSize: '1rem', fontWeight: 800, color: textPrimary, mt: 0.25 }}
                >
                  {shiftData.duration}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: textSecondary,
                    textTransform: 'uppercase',
                  }}
                >
                  TOTAL SALES
                </Typography>
                <Typography
                  sx={{ fontSize: '1rem', fontWeight: 800, color: textPrimary, mt: 0.25 }}
                >
                  {shiftData.totalSales}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: textSecondary,
                    textTransform: 'uppercase',
                  }}
                >
                  TRANSACTIONS
                </Typography>
                <Typography
                  sx={{ fontSize: '1rem', fontWeight: 800, color: textPrimary, mt: 0.25 }}
                >
                  {shiftData.transactions}
                </Typography>
              </Box>
            </Box>

            {/* Sodexo Item Box */}
            <CardItemSection
              height={56}
              padding="14px"
              bgColor={surfaceMuted}
              borderColor={borderColor}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    bgcolor: surfaceBg,
                    border: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ticket size={18} color={colors.text.secondary} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: textPrimary }}>
                    Sodexo
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: textSecondary }}>
                    {shiftData.sodexoTransactions} transactions
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: textPrimary }}>
                {shiftData.sodexoAmount}
              </Typography>
            </CardItemSection>
          </Box>

          {/* Card B: Payment Summary */}
          <Box
            sx={{
              bgcolor: surfaceBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              p: 2.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: textPrimary,
                mb: 2,
              }}
            >
              Payment Summary
            </Typography>

            <Stack spacing={1.5}>
              {shiftData.paymentBreakdown.map((item) => (
                <CardItemSection
                  key={item.id}
                  height={56}
                  padding="14px"
                  bgColor={surfaceMuted}
                  borderColor={borderColor}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        bgcolor: surfaceBg,
                        border: `1px solid ${borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getPaymentIcon(item.id)}
                    </Box>
                    <Box>
                      <Typography
                        sx={{ fontSize: '0.875rem', fontWeight: 700, color: textPrimary }}
                      >
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: textSecondary }}>
                        {item.count} transactions
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: textPrimary }}>
                    {item.amount}
                  </Typography>
                </CardItemSection>
              ))}
            </Stack>
          </Box>

          {/* Card C: Shift Closing Notes */}
          <Box
            sx={{
              bgcolor: surfaceBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              p: 2.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: textPrimary,
                mb: 1.5,
              }}
            >
              Shift Closing Notes
            </Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder="Enter shift handover remarks, cash discrepancies, or maintenance alerts..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: surfaceMuted,
                  color: textPrimary,
                  fontSize: '0.8125rem',
                  '& fieldset': { borderColor: borderColor },
                },
              }}
            />
          </Box>
        </Box>

        {/* Right Column: FIXED, NON-SCROLLABLE CARD (using @/components/shared/ui/Card.tsx) */}
        <Box
          sx={{
            width: { xs: '100%', md: 380, lg: 420 },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Card
            title="Cash Reconciliation"
            titleFontSize="0.9375rem"
            variant="outlined"
            padding={2.5}
            borderRadius="12px"
            sx={{
              bgcolor: surfaceBg,
              borderColor: borderColor,
              height: 'auto',
              boxShadow: 'none',
              '& .MuiTypography-root': {
                color: textPrimary,
                fontWeight: 700,
              },
            }}
          >
            {/* Reconciliation Rows */}
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.8125rem', color: textSecondary }}>
                  Opening Balance
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: textPrimary }}>
                  {shiftData.reconciliation.openingBalance}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.8125rem', color: textSecondary }}>
                  Total Cash In
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: textPrimary }}>
                  {shiftData.reconciliation.totalCashIn}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.8125rem', color: textSecondary }}>
                  Total Cash Out
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: textPrimary }}>
                  {shiftData.reconciliation.totalCashOut}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.8125rem', color: textSecondary }}>
                  Expected in Drawer
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: textPrimary }}>
                  {shiftData.reconciliation.expectedInDrawer}
                </Typography>
              </Box>

              {/* Actual Cash Count Box */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 0.5,
                }}
              >
                <Typography sx={{ fontSize: '0.8125rem', color: textSecondary, fontWeight: 600 }}>
                  Actual Cash Count
                </Typography>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '8px',
                    border: `1px solid ${borderColor}`,
                    bgcolor: surfaceMuted,
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    color: textPrimary,
                  }}
                >
                  {shiftData.reconciliation.actualCashCount}
                </Box>
              </Box>

              {/* Difference Banner */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: alpha(colors.success.default, mode === 'dark' ? 0.15 : 0.08),
                  border: `1px solid ${alpha(colors.success.default, 0.2)}`,
                  mt: 1,
                }}
              >
                <Typography
                  sx={{ fontSize: '0.875rem', fontWeight: 700, color: colors.success.default }}
                >
                  Difference
                </Typography>
                <Typography
                  sx={{ fontSize: '1rem', fontWeight: 800, color: colors.success.default }}
                >
                  {shiftData.reconciliation.difference}
                </Typography>
              </Box>

              {/* Manager PIN */}
              <Box sx={{ pt: 1 }}>
                <Typography
                  sx={{ fontSize: '0.8125rem', fontWeight: 700, color: textPrimary, mb: 0.75 }}
                >
                  Manager PIN
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  defaultValue="1234"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      color: textPrimary,
                      '& fieldset': { borderColor: borderColor },
                    },
                  }}
                />
              </Box>

              {/* Discrepancy Notice Callout */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: alpha(colors.primary.default, mode === 'dark' ? 0.12 : 0.06),
                  border: `1px solid ${alpha(colors.primary.default, 0.18)}`,
                }}
              >
                <Info
                  size={16}
                  color={colors.primary.default}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: textSecondary,
                    lineHeight: 1.4,
                  }}
                >
                  If there is a difference, please record the reason in the shift notes section
                  below before closing.
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Box>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 3. Fixed Page Footer                                          */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1.5,
          flexShrink: 0,
          pt: 1,
          borderTop: `1px solid ${dividerColor}`,
        }}
      >
        <ActionButton
          variant="outlined"
          size="medium"
          onClick={handleCancel}
          sx={{
            borderRadius: '8px',
            borderColor: borderColor,
            color: textPrimary,
            fontWeight: 600,
            fontSize: '0.875rem',
            height: 40,
            px: 2,
            '&:hover': {
              bgcolor: surfaceMuted,
            },
          }}
        >
          Cancel
        </ActionButton>

        <ActionButton
          variant="outlined"
          size="medium"
          startIcon={<Printer size={16} />}
          onClick={handlePrintSummary}
          sx={{
            borderRadius: '8px',
            borderColor: borderColor,
            color: textPrimary,
            fontWeight: 600,
            fontSize: '0.875rem',
            height: 40,
            px: 2,
            '&:hover': {
              bgcolor: surfaceMuted,
            },
          }}
        >
          Print shift summary
        </ActionButton>

        <ActionButton
          variant="primary"
          size="medium"
          startIcon={<Lock size={16} />}
          onClick={handleConfirmClose}
          sx={{
            borderRadius: '8px',
            bgcolor: colors.primary.default,
            color: colors.white.default,
            fontWeight: 700,
            fontSize: '0.875rem',
            height: 40,
            px: 2.5,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: colors.primary.dark,
            },
          }}
        >
          Confirm &amp; Close Shift
        </ActionButton>
      </Box>
    </Box>
  );
}

export default CloseShiftPage;
