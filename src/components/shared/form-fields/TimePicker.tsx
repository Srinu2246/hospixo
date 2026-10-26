'use client';

import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { isMealSessionFormTime } from '@/lib/helpers/mealSessionMapper';

export interface TimePickerProps {
  id?: string;
  label?: string;
  /** 24-hour `HH:mm` value. */
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  sx?: SxProps<Theme>;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => {
  const id = String(index).padStart(2, '0');
  return { id, label: id };
});

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => {
  const id = String(index).padStart(2, '0');
  return { id, label: id };
});

function splitTime(value: string): { hour: string; minute: string } {
  const trimmed = value.trim();
  if (isMealSessionFormTime(trimmed)) {
    const [hour, minute] = trimmed.split(':');
    return { hour, minute };
  }
  return { hour: '06', minute: '00' };
}

/**
 * 24-hour time picker (hour and minute selects). Value is always `HH:mm`.
 */
export function TimePicker({
  id,
  label,
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  fullWidth = true,
  required = false,
  sx,
}: Readonly<TimePickerProps>) {
  const { hour, minute } = splitTime(value);
  const fieldId = id ?? 'time-picker';

  const emitChange = (nextHour: string, nextMinute: string) => {
    onChange(`${nextHour}:${nextMinute}`);
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto', ...sx }}>
      {label ? (
        <Typography
          component="label"
          htmlFor={fieldId}
          sx={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'text.primary',
            mb: 1,
          }}
        >
          {label}
          {required ? (
            <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}

      <Stack
        id={fieldId}
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', width: fullWidth ? '100%' : 'auto' }}
      >
        <Dropdown
          options={HOUR_OPTIONS}
          value={hour}
          onChange={(next) => emitChange(String(next), minute)}
          disabled={disabled}
          size="medium"
          minWidth={0}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <Typography
          component="span"
          aria-hidden
          sx={{ fontWeight: 700, color: 'text.secondary', px: 0.25 }}
        >
          :
        </Typography>
        <Dropdown
          options={MINUTE_OPTIONS}
          value={minute}
          onChange={(next) => emitChange(hour, String(next))}
          disabled={disabled}
          size="medium"
          minWidth={0}
          sx={{ flex: 1, minWidth: 0 }}
        />
      </Stack>

      {helperText ? (
        <FormHelperText error={error} sx={{ mx: 0, mt: 0.75 }}>
          {helperText}
        </FormHelperText>
      ) : null}
    </Box>
  );
}
