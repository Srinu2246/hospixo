'use client';

import { useMemo, useState } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import {
  CalendarRangePicker,
  formatCalendarRangeLabel,
} from '@/components/shared/form-fields/CalendarRangePicker';
import { DASHBOARD_DATE_RANGE_OPTIONS, DateRangeOption } from '@/features/dashboard/enums';
import { formatDashboardDateRangeTriggerLabel } from '@/lib/helpers/dashboardDateRangeHelpers';
import { colors } from '@/lib/theme/mui/colors';

export interface DashboardDateRangeDropdownProps {
  dateFrom: Date;
  dateTo: Date;
  activeDatePreset: DateRangeOption | null;
  onDateRangeChange: (range: { dateFrom: Date; dateTo: Date }) => void;
  onDatePresetSelect: (preset: DateRangeOption) => void;
}

/** Preset menu + custom range calendar (reports-style). */
export function DashboardDateRangeDropdown({
  dateFrom,
  dateTo,
  activeDatePreset,
  onDateRangeChange,
  onDatePresetSelect,
}: Readonly<DashboardDateRangeDropdownProps>) {
  const [dateButtonEl, setDateButtonEl] = useState<null | HTMLElement>(null);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [customCalendarOpen, setCustomCalendarOpen] = useState(false);

  const dateTriggerLabel = useMemo(() => {
    if (activeDatePreset && activeDatePreset !== DateRangeOption.CUSTOM_RANGE) {
      return formatDashboardDateRangeTriggerLabel(activeDatePreset);
    }
    return formatCalendarRangeLabel(dateFrom, dateTo);
  }, [activeDatePreset, dateFrom, dateTo]);

  const handleDateButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setDateButtonEl(event.currentTarget);
    setDateMenuOpen(true);
  };

  const handlePresetSelect = (preset: DateRangeOption) => {
    if (preset === DateRangeOption.CUSTOM_RANGE) {
      setDateMenuOpen(false);
      setCustomCalendarOpen(true);
      return;
    }
    onDatePresetSelect(preset);
    setDateMenuOpen(false);
  };

  return (
    <>
      <ButtonBase
        onClick={handleDateButtonClick}
        sx={{
          px: 1.75,
          py: 0.85,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: (theme) =>
            dateMenuOpen || customCalendarOpen
              ? colors.primary.default
              : theme.palette.mode === 'dark'
                ? theme.palette.divider
                : colors.border.default,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
          color: 'text.primary',
          fontSize: '0.8125rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          transition: 'border-color 0.15s ease',
          '&:hover': {
            borderColor: colors.primary.default,
          },
        }}
      >
        <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
        {dateTriggerLabel}
        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
      </ButtonBase>

      <Menu
        anchorEl={dateButtonEl}
        open={dateMenuOpen}
        onClose={() => setDateMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '10px',
              minWidth: 240,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        {DASHBOARD_DATE_RANGE_OPTIONS.map((range) => (
          <MenuItem
            key={range}
            selected={range === activeDatePreset}
            onClick={() => handlePresetSelect(range)}
            sx={{ fontSize: '0.8125rem' }}
          >
            {range}
          </MenuItem>
        ))}
      </Menu>

      <CalendarRangePicker
        showTrigger={false}
        open={customCalendarOpen}
        anchorEl={dateButtonEl}
        onClose={() => setCustomCalendarOpen(false)}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onRangeChange={onDateRangeChange}
      />
    </>
  );
}
