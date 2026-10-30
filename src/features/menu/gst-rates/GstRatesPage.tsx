'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { CreateGstRateForm } from './CreateGstRateForm';
import { GstRatesTable } from './GstRatesTable';
import {
  getGstRatesDashboardHref,
  GST_RATES_BREADCRUMB_ACTIVE_SX,
  GST_RATES_BREADCRUMB_LINK_SX,
} from '@/lib/helpers/gstRatesNav';
import {
  menuFeaturePaneInsetSx,
  menuPageHeaderGridSx,
  menuWorkspaceBottomNavPbSx,
} from '@/lib/helpers/menu/menuLayout';
import { screen } from '@/lib/theme/mui/breakpoints';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { useCreateGstRate, useGstRate, useGstRates } from '@/lib/hooks/menu/gst-rates';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import {
  mapApiValidationToGstFormErrors,
  type CreateGstRateFormFieldErrors,
} from '@/lib/schemas/menu/gst-rates/createGstRateFormSchema';
import {
  GST_RATES_LIST_PAGE_SIZE,
  type CreateGstRateBody,
} from '@/lib/schemas/menu/gstRatesSchema';
import { ApiError } from '@/services/api/types';

type GstRatesMode = 'list' | 'create' | 'view';

function parseGstRatesPath(pathname: string): {
  basePath: string;
  mode: GstRatesMode;
  rateId?: string;
} {
  const marker = '/menu/gst-rates';
  const idx = pathname.indexOf(marker);
  const basePath = idx >= 0 ? pathname.slice(0, idx + marker.length) : pathname.replace(/\/$/, '');
  const rest = idx >= 0 ? pathname.slice(idx + marker.length) : '';

  if (!rest || rest === '/') {
    return { basePath, mode: 'list' };
  }
  if (rest === '/create' || rest.startsWith('/create/')) {
    return { basePath, mode: 'create' };
  }

  const rateId = rest.replace(/^\//, '').split('/')[0];
  return { basePath, mode: 'view', rateId: rateId || undefined };
}

/**
 * GST Rates for any scope (`/company/...`, `/branch-manager/...`).
 * URL drives list / create / view; data comes from /v1/restaurant/gst-rates.
 */
export function GstRatesPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { basePath, mode, rateId } = parseGstRatesPath(pathname);
  const dashboardHref = getGstRatesDashboardHref(pathname);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedCode = useDebouncedValue(searchQuery.trim(), 300);
  const [page, setPage] = useState(1);
  const pageSize = GST_RATES_LIST_PAGE_SIZE;
  const [createError, setCreateError] = useState<string | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<CreateGstRateFormFieldErrors>({});

  const numericRateId = rateId && /^\d+$/.test(rateId) ? Number(rateId) : undefined;

  const listQuery = useGstRates({
    code: debouncedCode ? debouncedCode : undefined,
    page,
    page_size: pageSize,
  });
  const detailQuery = useGstRate(mode === 'view' ? numericRateId : undefined);
  const createMutation = useCreateGstRate();

  function goToList() {
    router.push(basePath);
  }

  async function handleSubmit(input: CreateGstRateBody) {
    setCreateError(null);
    setCreateFieldErrors({});
    try {
      await createMutation.mutateAsync(input);
      router.push(basePath);
    } catch (error) {
      if (error instanceof ApiError && error.details != null) {
        setCreateFieldErrors(mapApiValidationToGstFormErrors(error.details));
      }
      setCreateError(getErrorMessage(error, 'Could not create GST rate.'));
    }
  }

  if (mode === 'create') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'auto',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          ...menuFeaturePaneInsetSx,
          ...menuWorkspaceBottomNavPbSx,
        }}
      >
        <CreateGstRateForm
          mode="create"
          submitting={createMutation.isPending}
          serverFormError={createError}
          serverFieldErrors={createFieldErrors}
          dashboardHref={dashboardHref}
          gstRatesBasePath={basePath}
          onCancel={goToList}
          onClearServerError={() => {
            setCreateError(null);
            setCreateFieldErrors({});
          }}
          onSubmit={handleSubmit}
        />
      </Box>
    );
  }

  if (mode === 'view') {
    if (detailQuery.isPending) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <CircularProgress size={28} />
        </Box>
      );
    }

    if (detailQuery.isError || !detailQuery.data) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            GST rate not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {detailQuery.error instanceof Error
              ? detailQuery.error.message
              : 'This rate may have been removed or the link is invalid.'}
          </Typography>
          <ActionButton onClick={goToList}>Back to GST Rates</ActionButton>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'auto',
          bgcolor: 'background.default',
          ...menuFeaturePaneInsetSx,
          ...menuWorkspaceBottomNavPbSx,
        }}
      >
        <CreateGstRateForm
          mode="view"
          rate={detailQuery.data}
          dashboardHref={dashboardHref}
          gstRatesBasePath={basePath}
          onCancel={goToList}
          onSubmit={handleSubmit}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden',
        bgcolor: 'background.default',
        boxSizing: 'border-box',
        ...menuFeaturePaneInsetSx,
        ...menuWorkspaceBottomNavPbSx,
      }}
    >
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: dashboardHref },
          { label: 'GST Rates', active: true },
        ]}
        linkSx={GST_RATES_BREADCRUMB_LINK_SX}
        activeSx={GST_RATES_BREADCRUMB_ACTIVE_SX}
      />

      <Box sx={{ ...menuPageHeaderGridSx, flexShrink: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.375rem', sm: '1.5rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: 'text.primary',
            }}
          >
            GST Rates
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}
          >
            Configure GST slabs used across menu items and billing.
          </Typography>
        </Box>

        <ActionButton
          startIcon={<Plus size={16} />}
          onClick={() => router.push(`${basePath}/create`)}
          size="small"
          sx={{
            flexShrink: 0,
            px: { [screen.mobile]: 1.25, [screen.tablet]: 1.5, [screen.desktop]: 2 },
            fontSize: { [screen.mobile]: '0.8125rem', [screen.tablet]: '0.875rem' },
          }}
        >
          Create GST Rate
        </ActionButton>
      </Box>

      <SearchBar
        value={searchQuery}
        onChange={(value: string) => {
          setSearchQuery(value);
          setPage(1);
        }}
        placeholder="Filter by GST code (e.g. GST_)"
        showClear
        fullWidth
        width="100%"
        sx={{ flexShrink: 0, maxWidth: { [screen.desktop]: 420 } }}
      />

      {listQuery.isError ? (
        <Alert severity="error" sx={{ flexShrink: 0 }}>
          {listQuery.error instanceof Error ? listQuery.error.message : 'Could not load GST rates.'}
        </Alert>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: { [screen.mobile]: 360, [screen.tablet]: 360, [screen.desktop]: 0 },
          display: 'flex',
          flexDirection: 'column',
          overflow: {
            [screen.mobile]: 'auto',
            [screen.tablet]: 'auto',
            [screen.desktop]: 'hidden',
          },
          position: 'relative',
        }}
      >
        {listQuery.isPending ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : (
          <GstRatesTable
            rates={listQuery.data?.items ?? []}
            page={page}
            pageSize={pageSize}
            totalRows={listQuery.data?.total ?? 0}
            onPageChange={setPage}
            onCreate={() => router.push(`${basePath}/create`)}
            onView={(rate) => router.push(`${basePath}/${rate.id}`)}
          />
        )}
      </Box>
    </Box>
  );
}
