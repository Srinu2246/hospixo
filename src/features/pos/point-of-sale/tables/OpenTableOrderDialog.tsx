'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown, type DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { Modal } from '@/components/shared/ui/Modal';
import type { PosTableItem } from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface OpenTableOrderFormValues {
  tableId: number;
  tableName: string;
  orderType: 'dine_in';
  guestCount: number;
  mealSessionId?: number;
}

export interface OpenTableOrderDialogProps {
  open: boolean;
  table: PosTableItem | null;
  mealSessionOptions: DropdownOption<string>[];
  /** Prefill meal session when one is active (still optional / clearable). */
  defaultMealSessionId?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (values: OpenTableOrderFormValues) => void;
}

function guestCountOptions(capacity: number | undefined): number[] {
  const max = Math.max(1, capacity ?? 8);
  return Array.from({ length: max }, (_, index) => index + 1);
}

/**
 * Confirm dialog before creating a dine-in order for an available table.
 * Table name + order type are fixed; guest count options follow table capacity;
 * meal session is optional.
 */
export function OpenTableOrderDialog({
  open,
  table,
  mealSessionOptions,
  defaultMealSessionId = '',
  loading = false,
  onClose,
  onConfirm,
}: Readonly<OpenTableOrderDialogProps>) {
  const capacity = table?.capacity;
  const guestOptions = useMemo(() => guestCountOptions(capacity), [capacity]);

  const [guestCount, setGuestCount] = useState(2);
  const [mealSessionId, setMealSessionId] = useState('');

  useEffect(() => {
    if (!open || !table) return;
    const preferred = Math.min(
      Math.max(1, table.guests ?? table.capacity ?? 2),
      guestOptions[guestOptions.length - 1] ?? 2,
    );
    setGuestCount(preferred);
    setMealSessionId(defaultMealSessionId || 'none');
  }, [open, table, guestOptions, defaultMealSessionId]);

  const sessionOptionsWithNone = useMemo<DropdownOption<string>[]>(
    () => [{ id: 'none', label: 'No meal session' }, ...mealSessionOptions],
    [mealSessionOptions],
  );

  const handleConfirm = () => {
    if (!table) return;
    const tableId = Number(table.id);
    if (!Number.isFinite(tableId) || tableId <= 0) return;

    const sessionNumber = Number(mealSessionId);
    onConfirm({
      tableId,
      tableName: table.name,
      orderType: 'dine_in',
      guestCount,
      ...(mealSessionId !== 'none' && Number.isFinite(sessionNumber) && sessionNumber > 0
        ? { mealSessionId: sessionNumber }
        : {}),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      loading={loading}
      title="Start dine-in order"
      subtitle={table ? `Table ${table.name}` : undefined}
      width={480}
      height="auto"
      padding={24}
      gap={16}
      footer={
        <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          <ActionButton variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton variant="primary" onClick={handleConfirm} loading={loading}>
            Start order
          </ActionButton>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography
            sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.75 }}
          >
            Table name
          </Typography>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            {table?.name ?? '—'}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.75 }}
          >
            Order type
          </Typography>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Dine-in
          </Typography>
        </Box>

        <Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 1 }}>
            Number of guest(s)
            {capacity != null ? (
              <Typography
                component="span"
                sx={{ fontWeight: 500, color: 'text.secondary', ml: 0.75 }}
              >
                (capacity {capacity})
              </Typography>
            ) : null}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {guestOptions.map((count) => {
              const isSelected = guestCount === count;
              return (
                <ActionButton
                  key={count}
                  variant="outlined"
                  disabled={loading}
                  onClick={() => setGuestCount(count)}
                  sx={{
                    minWidth: 44,
                    height: 44,
                    p: 0,
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    borderColor: isSelected ? colors.primary.default : 'divider',
                    bgcolor: isSelected ? alpha(colors.primary.default, 0.08) : 'background.paper',
                    color: isSelected ? colors.primary.default : 'text.primary',
                    borderWidth: isSelected ? '1.5px' : '1px',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: isSelected ? colors.primary.default : 'text.disabled',
                      bgcolor: isSelected ? alpha(colors.primary.default, 0.14) : 'action.hover',
                    },
                  }}
                >
                  {count}
                </ActionButton>
              );
            })}
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 1 }}>
            Meal session
            <Typography
              component="span"
              sx={{ fontWeight: 500, color: 'text.secondary', ml: 0.75 }}
            >
              (optional)
            </Typography>
          </Typography>
          <Dropdown
            options={sessionOptionsWithNone}
            value={mealSessionId}
            onChange={setMealSessionId}
            placeholder="Select meal session"
            size="medium"
            minWidth={0}
            disabled={loading}
            sx={{ width: '100%' }}
          />
        </Box>
      </Stack>
    </Modal>
  );
}
