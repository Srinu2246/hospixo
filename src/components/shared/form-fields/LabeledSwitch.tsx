'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

export interface LabeledSwitchProps {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

/** Title + helper copy with a switch; stacks on mobile, label block + switch on desktop. */
export function LabeledSwitch({
  title,
  hint,
  checked,
  onChange,
  disabled = false,
  sx,
}: Readonly<LabeledSwitchProps>) {
  return (
    <Box sx={sx}>
      <Stack spacing={0.75} sx={{ display: { xs: 'flex', md: 'none' } }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{title}</Typography>
          <Switch
            checked={checked}
            disabled={disabled}
            onChange={(_event, next) => onChange(next)}
            color="primary"
            sx={{ flexShrink: 0, ml: 'auto' }}
          />
        </Stack>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.45 }}>
          {hint}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{title}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
            {hint}
          </Typography>
        </Box>
        <Switch
          checked={checked}
          disabled={disabled}
          onChange={(_event, next) => onChange(next)}
          color="primary"
        />
      </Stack>
    </Box>
  );
}
