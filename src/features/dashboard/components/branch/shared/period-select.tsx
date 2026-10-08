'use client';

import { Box, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';
import type { BranchDashboardPeriod } from '@/features/dashboard/types/branch-dashboard';

type PeriodSelectProps = Readonly<{
  value: BranchDashboardPeriod;
  onChange: (period: BranchDashboardPeriod) => void;
  ariaLabel?: string;
}>;

export function PeriodSelect({ value, onChange, ariaLabel = 'Select period' }: PeriodSelectProps) {
  function handleChange(event: SelectChangeEvent) {
    onChange(event.target.value as BranchDashboardPeriod);
  }

  return (
    <Box sx={{ minWidth: 100 }}>
      <Select
        size="small"
        value={value}
        onChange={handleChange}
        inputProps={{ 'aria-label': ariaLabel }}
        sx={{
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: '0.5rem',
          bgcolor: 'background.paper',
          '& .MuiSelect-select': {
            py: 0.5,
            px: 1.25,
          },
        }}
      >
        {branchDashboardCopy.periodOptions.map((option) => (
          <MenuItem key={option.id} value={option.id} sx={{ fontSize: '0.8125rem' }}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
