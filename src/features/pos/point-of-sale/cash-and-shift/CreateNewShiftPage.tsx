'use client';

/**
 * Start New Shift — shown when GET …/shifts/current returns data: null.
 * Shift # (random), system date/time, assigned terminal from cash-registers.
 */

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { AlertCircle, PlusCircle } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { useCashCounters } from '@/lib/hooks/pos/point-of-sale/cash-counter';
import {
  MOCK_NEW_SHIFT_DEFAULTS,
  type NewShiftDefaults,
} from '@/lib/mocks/pos/usePosCashShift.mocks';
import { colors } from '@/lib/theme/mui/colors';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useThemeStore } from '@/stores/themeStore';

export interface CreateNewShiftPageProps {
  initialConfig?: NewShiftDefaults;
  onCancel?: () => void;
  onStartShift?: () => void;
}

function formatShiftDateTime(date: Date): string {
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
}

function randomShiftNumber(): string {
  return `#${1000 + Math.floor(Math.random() * 9000)}`;
}

export function CreateNewShiftPage({
  initialConfig = MOCK_NEW_SHIFT_DEFAULTS,
  onCancel,
  onStartShift,
}: Readonly<CreateNewShiftPageProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const mode = useThemeStore((state) => state.mode);
  const branchId = useSidebarStore((state) => state.context.branchId);
  const countersQuery = useCashCounters(branchId);

  const [shiftNumber] = useState(randomShiftNumber);
  const [dateTime] = useState(() => formatShiftDateTime(new Date()));
  const [openingBalance, setOpeningBalance] = useState(initialConfig.defaultOpeningBalance);
  const [terminal, setTerminal] = useState('');

  const terminalOptions = useMemo(() => {
    const rows = (countersQuery.data ?? []).filter((row) => row.status === 'active');
    return rows.map((row) => ({ id: String(row.id), label: row.name }));
  }, [countersQuery.data]);

  const resolvedTerminal =
    terminalOptions.length === 0 || terminalOptions.some((option) => option.id === terminal)
      ? terminal
      : terminalOptions[0].id;
  if (resolvedTerminal !== terminal) {
    setTerminal(resolvedTerminal);
  }

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

  if (typeof branchId !== 'number') {
    return (
      <AlertMessage
        variant="warning"
        title="Branch required"
        message="Select a branch before starting a shift."
      />
    );
  }

  if (countersQuery.isLoading) {
    return <Loading message="Loading cash counters..." fullPage={false} />;
  }

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
        {countersQuery.isError ? (
          <AlertMessage
            variant="error"
            title="Unable to load counters"
            message={
              countersQuery.error instanceof Error
                ? countersQuery.error.message
                : 'The cash registers request failed.'
            }
          />
        ) : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Input label="Shift Number" value={shiftNumber} disabled={true} fullWidth />
          </Box>

          <Box sx={{ flex: 1.3 }}>
            <Input label="Date & Time" value={dateTime} disabled={true} fullWidth />
          </Box>
        </Stack>

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
            onChange={setTerminal}
            options={terminalOptions}
            disabled={terminalOptions.length === 0}
            placeholder={terminalOptions.length === 0 ? 'No counters available' : undefined}
            sx={{
              width: '100%',
              borderRadius: '10px',
            }}
          />
        </Box>

        <Box>
          <Input
            label="Opening Cash Balance"
            value={openingBalance}
            onChange={(event) => setOpeningBalance(event.target.value)}
            startIcon={
              <Typography sx={{ color: textSecondary, fontWeight: 700, fontSize: '0.875rem' }}>
                ₹
              </Typography>
            }
            fullWidth
          />
        </Box>

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
            disabled={!terminal}
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
