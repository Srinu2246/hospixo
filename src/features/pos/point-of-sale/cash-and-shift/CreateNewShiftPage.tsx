'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import { AlertCircle, PlusCircle } from 'lucide-react';

import { useThemeStore } from '@/stores/themeStore';
import { colors } from '@/lib/theme/mui/colors';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import {
  MOCK_NEW_SHIFT_DEFAULTS,
  type NewShiftDefaults,
} from '@/lib/mocks/pos/usePosCashShift.mocks';

export interface CreateNewShiftPageProps {
  initialConfig?: NewShiftDefaults;
  onCancel?: () => void;
  onStartShift?: () => void;
}

/**
 * CreateNewShiftPage Component
 *
 * Screen matching the "Start New Shift" reference design:
 * - Centered card layout for opening register transactions.
 * - Shift number, timestamp, pre-selected operator, and terminal dropdowns.
 * - Opening cash balance entry with previous shift verification callout banner.
 * - Pure UI design strictly utilizing theme tokens from colors and useThemeStore.
 */
export function CreateNewShiftPage({
  initialConfig = MOCK_NEW_SHIFT_DEFAULTS,
  onCancel,
  onStartShift,
}: Readonly<CreateNewShiftPageProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const mode = useThemeStore((state) => state.mode);
  const [operator, setOperator] = useState<string>(initialConfig.operator);
  const [terminal, setTerminal] = useState<string>(initialConfig.terminal);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    const current = pathname ? pathname.replace(/\/+$/, '') : '';
    if (current.includes('cash-shift')) {
      const base = current.replace(/\/new$/, '');
      router.push(base || '/pos/point-of-sale/cash-shift');
    } else {
      router.push('/pos/point-of-sale/cash-shift');
    }
  };

  const handleStartShift = () => {
    if (onStartShift) {
      onStartShift();
      return;
    }
    const current = pathname ? pathname.replace(/\/+$/, '') : '';
    if (current.includes('cash-shift')) {
      const base = current.replace(/\/new$/, '');
      router.push(base || '/pos/point-of-sale/cash-shift');
    } else {
      router.push('/pos/point-of-sale/cash-shift');
    }
  };

  const textPrimary = mode === 'dark' ? colors.text.darkPrimary : colors.text.primary;
  const textSecondary = mode === 'dark' ? colors.text.darkSecondary : colors.text.secondary;
  const surfaceBg = mode === 'dark' ? colors.surface.dark : colors.surface.default;
  const surfaceMuted = mode === 'dark' ? colors.surface.darkMuted : colors.background.default;
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
      {/* 1. Page Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
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
          Start New Shift
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: textSecondary,
            fontSize: '0.875rem',
            mt: 0.75,
          }}
        >
          Configure the details to open the register for transactions
        </Typography>
      </Box>

      {/* 2. Main Form Card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 580,
          bgcolor: surfaceBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          p: { xs: 2.5, sm: 3.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          boxShadow: 'none',
          boxSizing: 'border-box',
        }}
      >
        {/* Row 1: Shift Number + Date & Time */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Input label="Shift Number" value={initialConfig.shiftNumber} disabled fullWidth />
          </Box>

          <Box sx={{ flex: 1.3 }}>
            <Input label="Date & Time" value={initialConfig.dateTime} disabled fullWidth />
          </Box>
        </Stack>

        {/* Row 2: Operator */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            component="label"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: textPrimary,
              mb: 0.75,
            }}
          >
            Operator
          </Typography>
          <Dropdown
            minWidth="100%"
            size="large"
            value={operator}
            onChange={(val) => setOperator(val)}
            options={initialConfig.operatorOptions}
            sx={{
              width: '100%',
              borderRadius: '10px',
            }}
          />
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: textSecondary,
              mt: 0.5,
              fontWeight: 500,
            }}
          >
            Current admin user is pre-selected
          </Typography>
        </Box>

        {/* Row 3: Assigned Terminal */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            component="label"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: textPrimary,
              mb: 0.75,
            }}
          >
            Assigned Terminal
          </Typography>
          <Dropdown
            minWidth="100%"
            size="large"
            value={terminal}
            onChange={(val) => setTerminal(val)}
            options={initialConfig.terminalOptions}
            sx={{
              width: '100%',
              borderRadius: '10px',
            }}
          />
        </Box>

        {/* Row 4: Opening Cash Balance */}
        <Box>
          <Input
            label="Opening Cash Balance"
            defaultValue={initialConfig.defaultOpeningBalance}
            startIcon={
              <Typography sx={{ color: textSecondary, fontWeight: 700, fontSize: '0.875rem' }}>
                ₹
              </Typography>
            }
            fullWidth
          />
        </Box>

        {/* Row 5: Amber Alert Callout Banner */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1.5,
            borderRadius: '8px',
            bgcolor: alpha(colors.warning.default, mode === 'dark' ? 0.12 : 0.08),
            border: `1px solid ${alpha(colors.warning.default, 0.25)}`,
          }}
        >
          <AlertCircle size={16} color={colors.warning.default} style={{ flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: mode === 'dark' ? colors.warning.light : colors.warning.dark,
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            Opening balance will be verified against the previous shift closing balance.
          </Typography>
        </Box>

        {/* Row 6: Cancel & Start Shift Buttons */}
        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
          <ActionButton
            variant="outlined"
            size="medium"
            fullWidth
            onClick={handleCancel}
            sx={{
              borderRadius: '8px',
              borderColor: borderColor,
              color: textPrimary,
              fontWeight: 600,
              height: 42,
              '&:hover': {
                bgcolor: surfaceMuted,
              },
            }}
          >
            Cancel
          </ActionButton>

          <ActionButton
            variant="primary"
            size="medium"
            fullWidth
            startIcon={<PlusCircle size={17} />}
            onClick={handleStartShift}
            sx={{
              borderRadius: '8px',
              bgcolor: colors.primary.default,
              color: colors.white.default,
              fontWeight: 700,
              height: 42,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: colors.primary.dark,
              },
            }}
          >
            Start Shift
          </ActionButton>
        </Stack>
      </Box>

      {/* 3. Footer Audit Notice */}
      <Typography
        sx={{
          color: textSecondary,
          fontSize: '0.75rem',
          textAlign: 'center',
          mt: 3,
          maxWidth: 480,
          lineHeight: 1.4,
        }}
      >
        All shift activities are logged and auditable. Opening a shift will notify the store
        manager.
      </Typography>
    </Box>
  );
}
