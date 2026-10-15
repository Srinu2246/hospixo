'use client';

import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { floorSetupFieldSx } from '@/features/floor-table-setup/components/shared/mui-field-styles';
import { TableConfigStatusDot } from '@/features/floor-table-setup/components/shared/table-config-status-dot';
import {
  detailCopy,
  tableConfigStatusOptions,
  wizardCopy,
} from '@/features/floor-table-setup/config';
import { isTableConfigStatus } from '@/features/floor-table-setup/lib';
import type { TableConfigStatus } from '@/features/floor-table-setup/types/floor-table-setup';

function statusLabel(status: TableConfigStatus): string {
  return tableConfigStatusOptions.find((option) => option.id === status)?.label ?? status;
}

type TableConfigStatusSelectFieldProps = Readonly<{
  value: TableConfigStatus;
  onChange: (value: TableConfigStatus) => void;
  error?: string | null;
}>;

export function TableConfigStatusSelectField({
  value,
  onChange,
  error = null,
}: TableConfigStatusSelectFieldProps) {
  return (
    <Box>
      <TextField
        select
        fullWidth
        label={detailCopy.status}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (isTableConfigStatus(next)) onChange(next);
        }}
        error={Boolean(error)}
        helperText={error ? undefined : wizardCopy.sectionStatusHint}
        sx={floorSetupFieldSx}
        slotProps={{
          select: {
            renderValue: (selected) => {
              const status = selected as TableConfigStatus;
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableConfigStatusDot status={status} />
                  {statusLabel(status)}
                </Box>
              );
            },
          },
        }}
      >
        {tableConfigStatusOptions.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TableConfigStatusDot status={option.id} />
              {option.label}
            </Box>
          </MenuItem>
        ))}
      </TextField>
      {error ? (
        <FormHelperText error sx={{ mx: 1.75 }}>
          {error}
        </FormHelperText>
      ) : null}
    </Box>
  );
}
