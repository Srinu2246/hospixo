'use client';

import { useState } from 'react';
import type { MouseEvent } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarPickerProps {
  value?: Date | string | null; // Selected date object or ISO string
  onChange?: (date: Date) => void; // Date change callback
  placeholder?: string; // Fallback placeholder text
  size?: 'small' | 'medium' | 'large'; // Control size preset (default: medium)
  minWidth?: number | string; // Minimum control width (default: 200)
  disabled?: boolean; // Disabled state flag
  sx?: SxProps<Theme>; // Button style overrides
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

// Helper to format date label (e.g. 'Today, Oct 12, 2024' or 'Sat, Oct 12, 2024')
function formatDateLabel(date: Date): string {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return isToday ? `Today, ${formatted}` : formatted;
}

// Global reusable Calendar / Date Picker component
export function CalendarPicker({
  value,
  onChange,
  placeholder = 'Select date',
  size = 'medium',
  minWidth = 200,
  disabled = false,
  sx,
}: Readonly<CalendarPickerProps>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Parse initial selected date
  const parsedValue = value ? (typeof value === 'string' ? new Date(value) : value) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(parsedValue);
  const [viewDate, setViewDate] = useState<Date>(
    new Date(parsedValue.getFullYear(), parsedValue.getMonth(), 1),
  );

  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
    setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(next);
    onChange?.(next);
    handleClose();
  };

  const handleSelectQuickPreset = (presetDaysOffset: number) => {
    const next = new Date();
    next.setDate(next.getDate() + presetDaysOffset);
    setSelectedDate(next);
    onChange?.(next);
    handleClose();
  };

  // Calendar matrix calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const height = size === 'small' ? 32 : size === 'large' ? 44 : 38;

  return (
    <>
      <ButtonBase
        component="button"
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Select date"
        sx={{
          height,
          minWidth,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.25,
          px: 1.75,
          borderRadius: '10px',
          border: '1px solid',
          borderColor: open ? 'primary.main' : 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: disabled ? 'divider' : 'text.secondary',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'action.hover' : '#F9FAFB'),
          },
          ...sx,
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box sx={{ display: 'inline-flex', color: 'text.secondary' }}>
            <CalendarIcon size={16} color="currentColor" />
          </Box>
          <Typography
            component="span"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.primary',
              whiteSpace: 'nowrap',
            }}
          >
            {value !== undefined ? formatDateLabel(selectedDate) : placeholder}
          </Typography>
        </Stack>
        <Box sx={{ display: 'inline-flex', color: 'text.secondary' }}>
          <ChevronDown
            size={16}
            color="currentColor"
            style={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </Box>
      </ButtonBase>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              borderRadius: '12px',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              width: 300,
            },
          },
        }}
      >
        {/* Preset chips */}
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <ButtonBase
            onClick={() => handleSelectQuickPreset(0)}
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: 'action.hover',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            Today
          </ButtonBase>
          <ButtonBase
            onClick={() => handleSelectQuickPreset(1)}
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: 'action.hover',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            Tomorrow
          </ButtonBase>
          <ButtonBase
            onClick={() => handleSelectQuickPreset(7)}
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: 'action.hover',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            Next Week
          </ButtonBase>
        </Stack>

        {/* Month / Year header with previous/next controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: 'text.primary',
            }}
          >
            {MONTH_NAMES[month]} {year}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              sx={{ p: 0.5 }}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleNextMonth}
              aria-label="Next month"
              sx={{ p: 0.5 }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Stack>
        </Box>

        {/* Weekday column headers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.75 }}>
          {WEEKDAYS.map((day) => (
            <Typography
              key={day}
              sx={{
                textAlign: 'center',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#9CA3AF',
                py: 0.25,
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* Days grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <Box key={`empty-${i}`} />
          ))}

          {/* Active days in month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected =
              selectedDate.getDate() === dayNum &&
              selectedDate.getMonth() === month &&
              selectedDate.getFullYear() === year;

            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <ButtonBase
                key={`day-${dayNum}`}
                onClick={() => handleSelectDay(dayNum)}
                sx={{
                  height: 32,
                  width: '100%',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : isToday ? 600 : 500,
                  bgcolor: isSelected
                    ? 'primary.main'
                    : isToday
                      ? (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.2)' : '#EFF6FF'
                      : 'transparent',
                  color: isSelected ? '#FFFFFF' : isToday ? 'primary.main' : 'text.primary',
                  border:
                    isToday && !isSelected
                      ? (theme) =>
                          theme.palette.mode === 'dark'
                            ? '1px solid rgba(51, 84, 244, 0.4)'
                            : '1px solid #BFDBFE'
                      : 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.main' : 'action.hover',
                  },
                }}
              >
                {dayNum}
              </ButtonBase>
            );
          })}
        </Box>
      </Popover>
    </>
  );
}
