'use client';

/**
 * Cash Counter management — list, create, detail, and edit.
 * APIs: GET/POST /v1/branches/{branch_id}/cash-registers
 *       GET/PATCH /v1/branches/{branch_id}/cash-registers/{register_id}
 */

import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import {
  useCashCounter,
  useCashCounters,
  useCreateCashCounter,
  useUpdateCashCounter,
} from '@/lib/hooks/pos/point-of-sale/cash-counter';
import type { CashCounterFormValues } from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useToastStore } from '@/stores/toastStore';

import { CashCounterDetail } from './CashCounterDetail';
import { CashCounterForm } from './CashCounterForm';
import { CashCounterList } from './CashCounterList';

export interface CashCounterPageProps {
  basePath?: string;
}

type CashCounterMode = 'list' | 'create' | 'detail' | 'edit';

function parseCashCounterPath(pathname: string): {
  basePath: string;
  mode: CashCounterMode;
  counterId?: number;
} {
  const markers = ['/management/cash-counter', '/management/cash-registers'];
  let marker = markers[0];
  let idx = -1;
  for (const candidate of markers) {
    const found = pathname.indexOf(candidate);
    if (found >= 0) {
      marker = candidate;
      idx = found;
      break;
    }
  }

  const basePath =
    idx >= 0 ? pathname.slice(0, idx + marker.length) : '/branch-manager/management/cash-counter';
  const rest = idx >= 0 ? pathname.slice(idx + marker.length) : '';

  if (!rest || rest === '/') {
    return { basePath, mode: 'list' };
  }
  if (rest === '/create' || rest.startsWith('/create/')) {
    return { basePath, mode: 'create' };
  }

  const editMatch = rest.match(/^\/(\d+)\/edit\/?$/);
  if (editMatch) {
    return { basePath, mode: 'edit', counterId: Number(editMatch[1]) };
  }

  const detailMatch = rest.match(/^\/(\d+)\/?$/);
  if (detailMatch) {
    return { basePath, mode: 'detail', counterId: Number(detailMatch[1]) };
  }

  return { basePath, mode: 'list' };
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function CashCounterPage({ basePath: basePathProp }: Readonly<CashCounterPageProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const branchId = useSidebarStore((state) => state.context.branchId);
  const parsed = parseCashCounterPath(pathname);
  const basePath = basePathProp ?? parsed.basePath;
  const { mode, counterId } = parsed;

  const listQuery = useCashCounters(branchId);
  const detailQuery = useCashCounter(
    branchId,
    mode === 'detail' || mode === 'edit' ? counterId : undefined,
  );
  const createMutation = useCreateCashCounter(branchId);
  const updateMutation = useUpdateCashCounter(branchId);

  const activeCounter = detailQuery.data ?? null;
  const submitting = createMutation.isPending || updateMutation.isPending;

  function goToList() {
    router.push(basePath);
  }

  function goToCreate() {
    router.push(`${basePath}/create`);
  }

  function goToDetail(id: number) {
    router.push(`${basePath}/${id}`);
  }

  function goToEdit(id: number) {
    router.push(`${basePath}/${id}/edit`);
  }

  async function handleCreate(values: CashCounterFormValues) {
    try {
      const created = await createMutation.mutateAsync({ name: values.name });
      showToast('Cash counter created', 'success');
      goToDetail(created.id);
    } catch (error) {
      showToast(errorMessage(error, 'Could not create cash counter.'), 'error');
    }
  }

  async function handleSave(values: CashCounterFormValues) {
    if (!activeCounter) return;
    try {
      await updateMutation.mutateAsync({
        registerId: activeCounter.id,
        body: {
          name: values.name,
          status: values.status ?? activeCounter.status,
        },
      });
      showToast('Cash counter updated', 'success');
      goToDetail(activeCounter.id);
    } catch (error) {
      showToast(errorMessage(error, 'Could not update cash counter.'), 'error');
    }
  }

  if (typeof branchId !== 'number') {
    return (
      <AlertMessage
        variant="warning"
        title="Branch required"
        message="Select a branch before managing cash counters."
      />
    );
  }

  if (mode === 'create') {
    return (
      <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.default' }}>
        <CashCounterForm
          key="create"
          mode="create"
          basePath={basePath}
          submitting={submitting}
          onCancel={goToList}
          onSubmit={(values) => {
            void handleCreate(values);
          }}
        />
      </Box>
    );
  }

  if (mode === 'edit' || mode === 'detail') {
    if (detailQuery.isLoading) {
      return <Loading message="Loading cash counter..." fullPage={false} />;
    }

    if (detailQuery.isError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AlertMessage
            variant="error"
            title="Unable to load cash counter"
            message={errorMessage(detailQuery.error, 'The cash counter request failed.')}
          />
          <ActionButton variant="outlined" onClick={goToList}>
            Back to Cash Counters
          </ActionButton>
        </Box>
      );
    }

    if (!activeCounter) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Cash counter not found
          </Typography>
          <ActionButton variant="outlined" onClick={goToList}>
            Back to Cash Counters
          </ActionButton>
        </Box>
      );
    }

    if (mode === 'edit') {
      return (
        <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.default' }}>
          <CashCounterForm
            key={activeCounter.id}
            mode="edit"
            basePath={basePath}
            initial={activeCounter}
            submitting={submitting}
            onCancel={() => goToDetail(activeCounter.id)}
            onSubmit={(values) => {
              void handleSave(values);
            }}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.default' }}>
        <CashCounterDetail
          counter={activeCounter}
          basePath={basePath}
          onBack={goToList}
          onEdit={() => goToEdit(activeCounter.id)}
        />
      </Box>
    );
  }

  if (listQuery.isLoading) {
    return <Loading message="Loading cash counters..." fullPage={false} />;
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.default' }}>
      {listQuery.isError ? (
        <AlertMessage
          variant="error"
          title="Unable to load cash counters"
          message={errorMessage(listQuery.error, 'The cash counters request failed.')}
        />
      ) : null}
      <CashCounterList
        rows={listQuery.data ?? []}
        onCreate={goToCreate}
        onRowClick={(row) => goToDetail(row.id)}
      />
    </Box>
  );
}
