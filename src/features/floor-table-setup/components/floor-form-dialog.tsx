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

import { floorTableSetupCopy, statusOptions } from '@/features/floor-table-setup/config/copy';
import {
  createFloorFormSchema,
  type CreateFloorFormValues,
} from '@/features/floor-table-setup/schemas/floor-table';
import type { FloorDto } from '@/features/floor-table-setup/types/floor-table';

type FloorFormDialogProps = Readonly<{
  open: boolean;
  mode: 'create' | 'edit';
  initialFloor?: FloorDto | null;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateFloorFormValues) => void;
}>;

export function FloorFormDialog({
  open,
  mode,
  initialFloor,
  isPending = false,
  onClose,
  onSubmit,
}: FloorFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFloorFormValues>({
    resolver: zodResolver(createFloorFormSchema),
    defaultValues: {
      name: initialFloor?.name ?? '',
      sort_order: initialFloor?.sort_order ?? undefined,
      status: initialFloor?.status ?? 'active',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const title = mode === 'create' ? floorTableSetupCopy.addFloor : floorTableSetupCopy.editFloor;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <form
        onSubmit={handleSubmit((values) => {
          onSubmit(values);
        })}
      >
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
              <TextField
                {...register('name')}
                label="Floor name"
                fullWidth
                required
                autoFocus
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
              <Tooltip title={floorTableSetupCopy.floorNameHint}>
                <IconButton size="small" aria-label="Floor name help" sx={{ mt: 1 }}>
                  <Info size={16} />
                </IconButton>
              </Tooltip>
            </Stack>

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
                  helperText={errors.sort_order?.message ?? 'Optional display order on POS'}
                />
              )}
            />

            <FormControl fullWidth error={Boolean(errors.status)}>
              <InputLabel id="floor-status-label">Status</InputLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} labelId="floor-status-label" label="Status">
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {mode === 'create' ? 'Create floor' : 'Save changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
