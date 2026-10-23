'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarRangePickerProps {
  dateFrom: Date;
  dateTo: Date;
  onRangeChange: (range: { dateFrom: Date; dateTo: Date }) => void;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  minWidth?: number | string;
  disabled?: boolean;
  /** Opens the calendar popover once when the control mounts. */
  defaultOpen?: boolean;
  sx?: SxProps<Theme>;
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

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function normalizeRange(start: Date, end: Date): { dateFrom: Date; dateTo: Date } {
  const from = startOfDay(start);
  const to = startOfDay(end);
  if (from.getTime() <= to.getTime()) {
    return { dateFrom: from, dateTo: to };
  }
  return { dateFrom: to, dateTo: from };
}

export function formatCalendarRangeLabel(dateFrom: Date, dateTo: Date): string {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  if (isSameDay(dateFrom, dateTo)) {
    return formatter.format(dateFrom);
  }
  return `${formatter.format(dateFrom)} – ${formatter.format(dateTo)}`;
}

function isDayInRange(day: Date, rangeFrom: Date | null, rangeTo: Date | null): boolean {
  if (!rangeFrom || !rangeTo) return false;
  const { dateFrom, dateTo } = normalizeRange(rangeFrom, rangeTo);
  const time = startOfDay(day).getTime();
  return time >= dateFrom.getTime() && time <= dateTo.getTime();
}

export function CalendarRangePicker({
  dateFrom,
  dateTo,
  onRangeChange,
  placeholder = 'Select date range',
  size = 'medium',
  minWidth = 240,
  disabled = false,
  defaultOpen = false,
  sx,
}: Readonly<CalendarRangePickerProps>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [viewDate, setViewDate] = useState(() => startOfDay(dateFrom));
  const [draftFrom, setDraftFrom] = useState<Date | null>(() => startOfDay(dateFrom));
  const [draftTo, setDraftTo] = useState<Date | null>(() => startOfDay(dateTo));

  const open = Boolean(anchorEl);

  const label = useMemo(() => formatCalendarRangeLabel(dateFrom, dateTo), [dateFrom, dateTo]);

  useEffect(() => {
    if (!defaultOpen || disabled) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    setAnchorEl(trigger);
    setViewDate(startOfDay(dateFrom));
    setDraftFrom(startOfDay(dateFrom));
    setDraftTo(startOfDay(dateTo));
  }, [defaultOpen, disabled, dateFrom, dateTo]);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
    setViewDate(startOfDay(dateFrom));
    setDraftFrom(startOfDay(dateFrom));
    setDraftTo(startOfDay(dateTo));
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
    const picked = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (draftFrom == null || (draftFrom != null && draftTo != null)) {
      setDraftFrom(picked);
      setDraftTo(null);
      return;
    }

    const next = normalizeRange(draftFrom, picked);
    setDraftFrom(next.dateFrom);
    setDraftTo(next.dateTo);
    onRangeChange(next);
    handleClose();
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const height = size === 'small' ? 32 : size === 'large' ? 44 : 38;

  const rangeEnd = draftTo ?? draftFrom;

  return (
    <>
      <ButtonBase
        ref={triggerRef}
        component="button"
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Select date range"
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
            {label || placeholder}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1.5 }}>
          {draftTo == null && draftFrom != null
            ? 'Select end date'
            : 'Select start date, then end date'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary' }}>
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

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <Box key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const cellDate = new Date(year, month, dayNum);
            const inRange = isDayInRange(cellDate, draftFrom, rangeEnd);
            const isStart = draftFrom != null && isSameDay(cellDate, draftFrom);
            const isEnd = rangeEnd != null && draftTo != null && isSameDay(cellDate, rangeEnd);
            const isEndpoint = isStart || isEnd;
            const isToday = isSameDay(cellDate, new Date());

            return (
              <ButtonBase
                key={`day-${dayNum}`}
                onClick={() => handleSelectDay(dayNum)}
                sx={{
                  height: 32,
                  width: '100%',
                  borderRadius: isEndpoint ? '6px' : inRange ? 0 : '6px',
                  fontSize: '0.8125rem',
                  fontWeight: isEndpoint ? 700 : isToday ? 600 : 500,
                  bgcolor: isEndpoint
                    ? 'primary.main'
                    : inRange
                      ? (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.25)' : '#EFF6FF'
                      : 'transparent',
                  color: isEndpoint ? '#FFFFFF' : isToday ? 'primary.main' : 'text.primary',
                  border:
                    isToday && !isEndpoint
                      ? (theme) =>
                          theme.palette.mode === 'dark'
                            ? '1px solid rgba(51, 84, 244, 0.4)'
                            : '1px solid #BFDBFE'
                      : 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isEndpoint ? 'primary.main' : 'action.hover',
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
