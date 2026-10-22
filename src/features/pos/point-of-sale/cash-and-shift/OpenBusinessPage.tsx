'use client';

/**
 * Open Business Day screen:
 * 1. Title + subtitle
 * 2. Business date / branch / counters summary cards
 * 3. Counters & opening cash table
 * 4. Opening checklist
 * 5. Open Business Day action
 */

import { useMemo, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { CalendarDays, MapPin, Monitor } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import {
  formatOpeningCash,
  MOCK_CASH_REGISTER_OPTIONS,
  MOCK_OPEN_BUSINESS_COUNTERS,
  MOCK_OPEN_BUSINESS_META,
  OPEN_BUSINESS_CHECKLIST,
  parseOpeningCashInput,
  type OpenBusinessCounter,
} from '@/lib/mocks/pos/usePosOpenBusiness.mocks';
import { colors } from '@/lib/theme/mui/colors';
import { useThemeStore } from '@/stores/themeStore';
import { useToastStore } from '@/stores/toastStore';

export interface OpenBusinessPageProps {
  /** Optional override for summary meta (date, branch, counters). */
  meta?: typeof MOCK_OPEN_BUSINESS_META;
  /** Optional initial counter rows. */
  initialCounters?: OpenBusinessCounter[];
}

function SummaryCard({
  icon,
  children,
  surfaceBg,
  borderColor,
  isDark,
}: Readonly<{
  icon: ReactNode;
  children: ReactNode;
  surfaceBg: string;
  borderColor: string;
  isDark: boolean;
}>) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: '100%', sm: 0 },
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        bgcolor: surfaceBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '14px',
        px: 2.25,
        py: 2,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(colors.primary.default, isDark ? 0.18 : 0.1),
          color: colors.primary.default,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

export function OpenBusinessPage({
  meta = MOCK_OPEN_BUSINESS_META,
  initialCounters = MOCK_OPEN_BUSINESS_COUNTERS,
}: Readonly<OpenBusinessPageProps> = {}) {
  const showToast = useToastStore((state) => state.show);
  const mode = useThemeStore((state) => state.mode);
  const isDark = mode === 'dark';
  const textPrimary = isDark ? colors.text.darkPrimary : colors.text.primary;
  const textSecondary = isDark ? colors.text.darkSecondary : colors.text.secondary;
  const surfaceBg = isDark ? colors.surface.dark : colors.surface.default;
  const surfaceMuted = isDark ? colors.surface.darkMuted : colors.background.default;
  const borderColor = isDark ? colors.border.dark : colors.border.default;
  const pageBg = isDark ? colors.background.dark : colors.background.default;
  const [counters, setCounters] = useState<OpenBusinessCounter[]>(() =>
    initialCounters.map((row) => ({ ...row })),
  );
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(OPEN_BUSINESS_CHECKLIST.map((item) => [item.id, true])),
  );
  const [submitting, setSubmitting] = useState(false);

  const totalOpeningCash = useMemo(
    () => counters.reduce((sum, row) => sum + row.openingCash, 0),
    [counters],
  );

  const allChecked = OPEN_BUSINESS_CHECKLIST.every((item) => checklist[item.id]);

  function updateCounter(id: string, patch: Partial<OpenBusinessCounter>) {
    setCounters((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  async function handleOpenBusinessDay() {
    if (!allChecked) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setSubmitting(false);
    showToast('Business day opened successfully', 'success');
  }

  const mid = Math.ceil(OPEN_BUSINESS_CHECKLIST.length / 2);
  const leftChecklist = OPEN_BUSINESS_CHECKLIST.slice(0, mid);
  const rightChecklist = OPEN_BUSINESS_CHECKLIST.slice(mid);

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: pageBg,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        pb: 4,
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header */}
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '1.875rem' },
            color: textPrimary,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Open Business
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75, color: textSecondary, fontSize: '0.9375rem' }}>
          Start your branch&apos;s business day and prepare all counters for operations.
        </Typography>
      </Box>

      {/* 2. Summary cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.75}>
        <SummaryCard
          icon={<CalendarDays size={20} />}
          surfaceBg={surfaceBg}
          borderColor={borderColor}
          isDark={isDark}
        >
          <Typography sx={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 500 }}>
            Business Date
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: textPrimary }}>
            {meta.businessDate}
            <Typography component="span" sx={{ fontWeight: 500, color: textSecondary, ml: 0.75 }}>
              {meta.businessDay}
            </Typography>
          </Typography>
        </SummaryCard>

        <SummaryCard
          icon={<MapPin size={20} />}
          surfaceBg={surfaceBg}
          borderColor={borderColor}
          isDark={isDark}
        >
          <Typography sx={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 500 }}>
            Branch
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: textPrimary }}>
            {meta.branchName}
            <Typography component="span" sx={{ fontWeight: 500, color: textSecondary, ml: 0.75 }}>
              {meta.branchCity}
            </Typography>
          </Typography>
        </SummaryCard>

        <SummaryCard
          icon={<Monitor size={20} />}
          surfaceBg={surfaceBg}
          borderColor={borderColor}
          isDark={isDark}
        >
          <Typography sx={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 500 }}>
            Configured Counters
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: textPrimary }}>
            {meta.counterCount}{' '}
            <Typography component="span" sx={{ fontWeight: 500, color: textSecondary }}>
              Counters
            </Typography>
          </Typography>
        </SummaryCard>
      </Stack>

      {/* 3. Counters & Opening Cash */}
      <Box
        sx={{
          bgcolor: surfaceBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 2.5, pb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: textPrimary }}>
            Counters & Opening Cash
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.875rem', color: textSecondary }}>
            Set opening cash for each counter. You can start counter shifts after opening the
            business day.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.25,
            bgcolor: surfaceMuted,
            borderTop: `1px solid ${borderColor}`,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Typography
            sx={{
              width: 40,
              flexShrink: 0,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: textSecondary,
            }}
          >
            #
          </Typography>
          <Typography
            sx={{
              flex: 1.4,
              minWidth: 160,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: textSecondary,
            }}
          >
            Counter
          </Typography>
          <Typography
            sx={{
              width: 180,
              flexShrink: 0,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: textSecondary,
            }}
          >
            Cash Register
          </Typography>
          <Typography
            sx={{
              width: 200,
              flexShrink: 0,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: textSecondary,
            }}
          >
            Opening Cash (₹)
          </Typography>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          {counters.map((row, index) => (
            <Box
              key={row.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.5,
                py: 1.75,
                minHeight: 76,
                borderBottom: `1px solid ${borderColor}`,
                bgcolor: surfaceBg,
                boxSizing: 'border-box',
              }}
            >
              <Typography
                sx={{
                  width: 40,
                  flexShrink: 0,
                  fontSize: '0.875rem',
                  color: textSecondary,
                }}
              >
                {index + 1}
              </Typography>

              <Stack
                direction="row"
                spacing={1.25}
                sx={{ flex: 1.4, minWidth: 160, alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: alpha(colors.primary.default, isDark ? 0.18 : 0.08),
                    color: colors.primary.default,
                    flexShrink: 0,
                  }}
                >
                  <Monitor size={16} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      color: textPrimary,
                    }}
                  >
                    {row.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: textSecondary }}>
                    {row.type}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ width: 180, flexShrink: 0 }}>
                <Dropdown
                  size="small"
                  minWidth="100%"
                  value={row.cashRegisterId}
                  onChange={(value) => updateCounter(row.id, { cashRegisterId: value })}
                  options={[...MOCK_CASH_REGISTER_OPTIONS]}
                  sx={{ width: '100%' }}
                />
              </Box>

              <Box sx={{ width: 200, flexShrink: 0 }}>
                <Input
                  value={formatOpeningCash(row.openingCash)}
                  onChange={(event) =>
                    updateCounter(row.id, {
                      openingCash: parseOpeningCashInput(event.target.value),
                    })
                  }
                  startIcon={
                    <Typography
                      sx={{
                        color: textSecondary,
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      ₹
                    </Typography>
                  }
                  inputSx={{ fontSize: '0.875rem' }}
                  sx={{
                    '& > .MuiBox-root': {
                      minHeight: 40,
                      height: 40,
                    },
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: { xs: 2, sm: 2.5 },
            py: 2,
            bgcolor: surfaceMuted,
            borderTop: `1px solid ${borderColor}`,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: textPrimary }}>
            Total Opening Cash (All Counters)
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              color: textPrimary,
              letterSpacing: '-0.02em',
            }}
          >
            ₹{formatOpeningCash(totalOpeningCash)}
          </Typography>
        </Box>
      </Box>

      {/* 4. Opening Checklist */}
      <Box
        sx={{
          bgcolor: surfaceBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: textPrimary }}>
          Opening Checklist
        </Typography>
        <Typography sx={{ mt: 0.5, mb: 2, fontSize: '0.875rem', color: textSecondary }}>
          Please confirm the following before opening the business day.
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 0.5, md: 3 }}>
          {[leftChecklist, rightChecklist].map((column, columnIndex) => (
            <Stack key={columnIndex === 0 ? 'left' : 'right'} spacing={0.25} sx={{ flex: 1 }}>
              {column.map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      checked={Boolean(checklist[item.id])}
                      onChange={(_, checked) =>
                        setChecklist((prev) => ({ ...prev, [item.id]: checked }))
                      }
                      sx={{
                        color: borderColor,
                        '&.Mui-checked': { color: colors.primary.default },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.875rem', color: textPrimary, lineHeight: 1.4 }}>
                      {item.label}
                    </Typography>
                  }
                  sx={{ alignItems: 'flex-start', ml: 0, mr: 0 }}
                />
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* 5. Action */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ActionButton
          variant="primary"
          onClick={handleOpenBusinessDay}
          disabled={!allChecked || submitting}
          sx={{
            minWidth: 180,
            height: 44,
            borderRadius: '10px',
            fontWeight: 700,
            px: 2.5,
          }}
        >
          Open Business Day
        </ActionButton>
      </Box>
    </Box>
  );
}
