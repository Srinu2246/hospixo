'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Modal } from '@/components/shared/ui/Modal';
import { useMealSessions } from '@/lib/hooks/pos/point-of-sale/tables/useMealSessions';
import type { PosTableItem } from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';

const ORDER_TYPE_OPTIONS = [{ id: 'dine_in', label: 'Dine In' }] as const;

function guestCountOptions(capacity: number): Array<{ id: string; label: string }> {
  const max = Math.max(capacity, 1);
  return Array.from({ length: max }, (_, index) => {
    const count = index + 1;
    return { id: String(count), label: String(count) };
  });
}

function titleCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface CreateTableOrderValues {
  guestCount: number;
  mealSessionId: number;
}

export interface CreateTableOrderModalProps {
  open: boolean;
  table: PosTableItem | null;
  branchId?: number;
  loading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (values: CreateTableOrderValues) => void | Promise<void>;
}

/**
 * Start a dine-in order for an available table.
 * Guest count defaults to table capacity; order type is fixed to dine_in.
 * Meal session comes from GET /v1/branches/{branch_id}/meal-sessions.
 */
export function CreateTableOrderModal({
  open,
  table,
  branchId,
  loading = false,
  errorMessage = null,
  onClose,
  onConfirm,
}: Readonly<CreateTableOrderModalProps>) {
  const capacity = Math.max(table?.capacity ?? 2, 1);
  const guestOptions = useMemo(() => guestCountOptions(capacity), [capacity]);
  const [guestCount, setGuestCount] = useState(String(capacity));
  const [guestResetKey, setGuestResetKey] = useState<string | null>(null);
  const [mealSessionId, setMealSessionId] = useState('');
  const [sessionsResetKey, setSessionsResetKey] = useState('');

  const mealSessionsQuery = useMealSessions(open ? branchId : undefined);
  const activeSessions = useMemo(
    () => (mealSessionsQuery.data ?? []).filter((session) => session.is_active !== false),
    [mealSessionsQuery.data],
  );
  const mealSessionOptions = useMemo(
    () =>
      activeSessions.map((session) => ({
        id: String(session.id),
        label: titleCase(session.name),
      })),
    [activeSessions],
  );

  const nextGuestKey = open && table ? `${table.id}:${capacity}` : null;
  if (nextGuestKey && nextGuestKey !== guestResetKey) {
    setGuestResetKey(nextGuestKey);
    setGuestCount(String(capacity));
  }

  const nextSessionsKey =
    open && activeSessions.length > 0 ? activeSessions.map((session) => session.id).join(',') : '';
  if (nextSessionsKey && nextSessionsKey !== sessionsResetKey) {
    setSessionsResetKey(nextSessionsKey);
    const nextMealSessionId =
      mealSessionId && activeSessions.some((session) => String(session.id) === mealSessionId)
        ? mealSessionId
        : String(activeSessions[0].id);
    setMealSessionId(nextMealSessionId);
  }

  const canSubmit =
    Boolean(table) &&
    Boolean(mealSessionId) &&
    !mealSessionsQuery.isLoading &&
    !mealSessionsQuery.isError;

  return (
    <Modal
      open={open}
      onClose={onClose}
      loading={loading}
      title={table ? `New order · ${table.name}` : 'New order'}
      subtitle="Confirm guests and meal session to open the menu."
      width={420}
      height="auto"
      padding={24}
      footer={
        <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'flex-end', width: '100%' }}>
          <ActionButton variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            loading={loading}
            disabled={!canSubmit}
            onClick={() => {
              const parsedGuests = Number(guestCount);
              const parsedSession = Number(mealSessionId);
              void onConfirm({
                guestCount:
                  Number.isFinite(parsedGuests) && parsedGuests > 0 ? parsedGuests : capacity,
                mealSessionId:
                  Number.isFinite(parsedSession) && parsedSession >= 0 ? parsedSession : 0,
              });
            }}
          >
            Create Order
          </ActionButton>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Order type
          </Typography>
          <Dropdown
            options={[...ORDER_TYPE_OPTIONS]}
            value="dine_in"
            onChange={() => undefined}
            disabled
            minWidth="100%"
            size="medium"
            sx={{ mt: 0.75, width: '100%' }}
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Meal session
          </Typography>
          <Dropdown
            options={mealSessionOptions}
            value={mealSessionId}
            onChange={setMealSessionId}
            placeholder={mealSessionsQuery.isLoading ? 'Loading sessions…' : 'Select meal session'}
            disabled={loading || mealSessionsQuery.isLoading || mealSessionOptions.length === 0}
            minWidth="100%"
            size="medium"
            sx={{ mt: 0.75, width: '100%' }}
          />
          {mealSessionsQuery.isError ? (
            <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: 'error.main' }}>
              {mealSessionsQuery.error instanceof Error
                ? mealSessionsQuery.error.message
                : 'Unable to load meal sessions.'}
            </Typography>
          ) : null}
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Guest count
          </Typography>
          <Dropdown
            options={guestOptions}
            value={guestCount}
            onChange={setGuestCount}
            minWidth="100%"
            size="medium"
            sx={{ mt: 0.75, width: '100%' }}
          />
          <Typography
            variant="caption"
            sx={{ mt: 0.75, display: 'block', color: 'text.secondary' }}
          >
            Defaults to table capacity ({capacity} seats).
          </Typography>
        </Box>

        {errorMessage ? (
          <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        ) : null}
      </Stack>
    </Modal>
  );
}
