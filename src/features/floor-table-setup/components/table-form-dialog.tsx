'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { Info } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import {
  floorTableSetupCopy,
  statusOptions,
  tableShapeOptions,
} from '@/features/floor-table-setup/config/copy';
import {
  createTableFormSchema,
  type CreateTableFormValues,
} from '@/features/floor-table-setup/schemas/floor-table';
import type { TableDto } from '@/features/floor-table-setup/types/floor-table';

type TableFormDialogProps = Readonly<{
  open: boolean;
  mode: 'create' | 'edit';
  floorName?: string;
  initialTable?: TableDto | null;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTableFormValues) => void;
}>;

export function TableFormDialog({
  open,
  mode,
  floorName,
  initialTable,
  isPending = false,
  onClose,
  onSubmit,
}: TableFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTableFormValues>({
    resolver: zodResolver(createTableFormSchema),
    defaultValues: {
      name: initialTable?.name ?? '',
      seats: initialTable?.seats ?? 2,
      shape: initialTable?.shape ?? 'square',
      sort_order: initialTable?.sort_order ?? undefined,
      status: initialTable?.status ?? 'active',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const title = mode === 'create' ? floorTableSetupCopy.addTable : floorTableSetupCopy.editTable;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {title}
        {floorName ? ` · ${floorName}` : ''}
      </DialogTitle>
      <form
        onSubmit={handleSubmit((values) => {
          onSubmit(values);
        })}
      >
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              {...register('name')}
              label="Table name / number"
              fullWidth
              required
              autoFocus
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />

            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
              <Controller
                name="seats"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Seats"
                    type="number"
                    fullWidth
                    required
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    slotProps={{ htmlInput: { min: 1, max: 50 } }}
                    error={Boolean(errors.seats)}
                    helperText={errors.seats?.message}
                  />
                )}
              />
              <Tooltip title={floorTableSetupCopy.tableSeatsHint}>
                <IconButton size="small" aria-label="Seats help" sx={{ mt: 1 }}>
                  <Info size={16} />
                </IconButton>
              </Tooltip>
            </Stack>

            <FormControl fullWidth error={Boolean(errors.shape)}>
              <InputLabel id="table-shape-label">Shape</InputLabel>
              <Controller
                name="shape"
                control={control}
                render={({ field }) => (
                  <Select {...field} labelId="table-shape-label" label="Shape">
                    {tableShapeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <FormHelperText>
                {errors.shape?.message ?? floorTableSetupCopy.tableShapeHint}
              </FormHelperText>
            </FormControl>

            <Controller
              name="sort_order"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Sort order"
                  type="number"
                  fullWidth
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const raw = event.target.value;
                    field.onChange(raw === '' ? undefined : Number(raw));
                  }}
                  slotProps={{ htmlInput: { min: 0 } }}
                  error={Boolean(errors.sort_order)}
                  helperText={errors.sort_order?.message ?? 'Optional display order on floor map'}
                />
              )}
            />

            <FormControl fullWidth error={Boolean(errors.status)}>
              <InputLabel id="table-status-label">Status</InputLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} labelId="table-status-label" label="Status">
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.status ? <FormHelperText>{errors.status.message}</FormHelperText> : null}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {mode === 'create' ? 'Add table' : 'Save changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
