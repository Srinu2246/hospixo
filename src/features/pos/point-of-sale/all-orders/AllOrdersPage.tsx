'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import { Download } from 'lucide-react';

import { FilterBar, type FilterBarItem } from '@/components/shared/form-fields/FilterBar';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import {
  MOCK_POS_ORDERS,
  type PosOrderItem,
  type OrderType,
} from '@/lib/mocks/pos/usePosOrders.mocks';

const ORDER_FILTER_ITEMS: readonly FilterBarItem<OrderType>[] = [
  { id: 'all', label: 'All' },
  { id: 'dine-in', label: 'Dine-In' },
  { id: 'takeaway', label: 'Takeaway' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'online', label: 'Online' },
];

/**
 * AllOrdersPage Component
 *
 * Screen for managing and reviewing running POS orders across Dine-In,
 * Takeaway, Delivery, and Online aggregators with live kitchen status chips,
 * filters, search, and action triggers.
 */
export function AllOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [orders] = useState<PosOrderItem[]>(MOCK_POS_ORDERS);
  const [activeFilter, setActiveFilter] = useState<OrderType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Filter orders based on active tab and search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Type filter
      if (activeFilter !== 'all' && order.type !== activeFilter) {
        return false;
      }

      // Search query across orderNumber, reference, type, status, and amount
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesOrder = order.orderNumber.toLowerCase().includes(query);
        const matchesRef = order.reference.toLowerCase().includes(query);
        const matchesType = order.typeLabel.toLowerCase().includes(query);
        const matchesStatus = order.kitchenStatusLabel.toLowerCase().includes(query);
        const matchesAmount = String(order.amount).includes(query);
        if (!matchesOrder && !matchesRef && !matchesType && !matchesStatus && !matchesAmount) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  // Paginated subset
  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, page, pageSize]);

  // Summary counts
  const awaitingKitchenCount = useMemo(() => {
    return filteredOrders.filter(
      (o) => o.kitchenStatus === 'kot sent' || o.kitchenStatus === 'preparing',
    ).length;
  }, [filteredOrders]);

  const readyToSettleCount = useMemo(() => {
    return filteredOrders.filter(
      (o) => o.kitchenStatus === 'ready' || o.kitchenStatus === 'billing',
    ).length;
  }, [filteredOrders]);

  // Action handlers
  const handleAddItems = (order: PosOrderItem) => {
    const cleanOrderNumber = order.orderNumber.replace(/^#/, '');

    // Derive base flow URL dynamically from the current pathname to preserve branch/tenant prefixes
    // e.g. /indiranagar/pos/captain-flow/all-orders -> /indiranagar/pos/captain-flow
    const baseFlow = pathname ? pathname.replace(/\/all-orders(\/.*)?$/, '') : '/pos/point-of-sale';

    const isCaptain = baseFlow.includes('captain-flow');

    // Parse table from reference (e.g. "Table T4" -> "t-4")
    const tableMatch = order.reference.match(/Table\s*(T\d+|[A-Za-z0-9_-]+)/i);
    const tableParam = tableMatch ? tableMatch[1].toLowerCase().replace(/^t(\d+)$/, 't-$1') : null;

    let targetUrl = '';
    if (isCaptain) {
      if (order.type === 'dine-in' && tableParam) {
        targetUrl = `${baseFlow}/tables?orderId=${cleanOrderNumber}`;
      } else {
        targetUrl = `${baseFlow}/order-menu?orderId=${cleanOrderNumber}`;
      }
    } else if (order.type === 'dine-in' && tableParam) {
      targetUrl = `${baseFlow}/dine-in/${tableParam}?orderId=${cleanOrderNumber}`;
    } else {
      targetUrl = `${baseFlow}/takeaway?orderId=${cleanOrderNumber}`;
    }

    router.push(targetUrl);
  };

  const handleSettle = (order: PosOrderItem) => {
    const basePath = pathname ? pathname.replace(/\/+$/, '') : '/pos/point-of-sale/all-orders';
    const cleanOrderNumber = order.orderNumber.replace(/^#/, '');
    router.push(`${basePath}/${cleanOrderNumber}`);
  };

  const handleDownloadReport = () => {
    // Report download placeholder
  };

  // Table Columns
  const columns: DataGridColumn<PosOrderItem>[] = useMemo(
    () => [
      {
        field: 'orderNumber',
        headerName: 'ORDER #',
        width: 140,
        minWidth: 110,
        renderCell: ({ row }) => (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.9375rem',
              color: 'text.primary',
              letterSpacing: '-0.01em',
            }}
          >
            {row.orderNumber}
          </Typography>
        ),
      },
      {
        field: 'type',
        headerName: 'TYPE',
        width: 160,
        minWidth: 120,
        renderCell: ({ row }) => (
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'text.primary',
            }}
          >
            {row.typeLabel}
          </Typography>
        ),
      },
      {
        field: 'reference',
        headerName: 'REFERENCE',
        width: 220,
        minWidth: 170,
        renderCell: ({ row }) => (
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'text.primary',
            }}
          >
            {row.reference}
          </Typography>
        ),
      },
      {
        field: 'kitchenStatus',
        headerName: 'KITCHEN STATUS',
        width: 180,
        minWidth: 140,
        renderCell: ({ row }) => (
          <StatusChip
            status={row.kitchenStatus}
            label={row.kitchenStatusLabel}
            showDot
            size="small"
          />
        ),
      },
      {
        field: 'amount',
        headerName: 'AMOUNT',
        width: 140,
        minWidth: 110,
        renderCell: ({ row }) => (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.9375rem',
              color: 'text.primary',
              letterSpacing: '-0.01em',
            }}
          >
            {row.amountFormatted}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'ACTIONS',
        width: 220,
        minWidth: 190,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: ({ row }) => (
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ justifyContent: 'center', width: '100%', alignItems: 'center' }}
          >
            <ActionButton
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleAddItems(row);
              }}
              sx={{
                px: 1.75,
                height: 32,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'text.primary',
                borderColor: 'divider',
                borderRadius: '6px',
                bgcolor: 'background.paper',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: 'text.primary',
                  bgcolor: 'action.hover',
                },
              }}
            >
              Add Items
            </ActionButton>
            <ActionButton
              variant="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleSettle(row);
              }}
              sx={{
                px: 2,
                height: 32,
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: '6px',
                bgcolor: colors.primary.default,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: colors.primary.dark,
                },
              }}
            >
              Settle
            </ActionButton>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Row: Title + FilterBar + SearchBar + Online Synced   */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        {/* Left: Title + FilterBar */}
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: '1.5rem',
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            All Orders
          </Typography>

          <FilterBar
            items={ORDER_FILTER_ITEMS}
            value={activeFilter}
            onChange={(val) => {
              setActiveFilter(val);
              setPage(1);
            }}
            variant="segmented"
            size="small"
            sx={{
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.paper' : '#F1F3F5'),
              p: 0.5,
              borderRadius: '10px',
            }}
          />
        </Stack>

        {/* Right: SearchBar + Online Synced Badge */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <SearchBar
            value={searchQuery}
            onChange={(val: string) => {
              setSearchQuery(val);
              setPage(1);
            }}
            onClear={() => setSearchQuery('')}
            placeholder="Order, table or bill no."
            width={{ xs: 200, sm: 260 }}
            showClear
          />

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              height: 38,
              borderRadius: '10px',
              bgcolor: alpha(colors.success.default, 0.12),
              color: colors.success.default,
              fontSize: '0.8125rem',
              fontWeight: 600,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: colors.success.default,
                display: 'inline-block',
              }}
            />
            Online · synced
          </Box>
        </Stack>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Table Container: Full Page Height, Scrollable Rows only     */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <DataGrid
          columns={columns}
          rows={paginatedRows}
          totalRows={filteredOrders.length}
          pagination
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          paginationEntityName="orders"
          stickyHeader
          height="100%"
          rowHeight={68}
          onRowClick={(row) => handleSettle(row)}
          emptyTitle="No orders found"
          emptySubtitle="There are no running orders matching your selected filter or search."
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: '12px',
            boxShadow: 'none',
            bgcolor: 'background.paper',
          }}
          tableSx={{
            '& th': {
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'action.hover' : '#F9FAFB'),
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& td': {
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& th:first-of-type, & td:first-of-type': {
              pl: 3.5,
            },
            '& td:last-of-type': {
              pr: 2,
            },
          }}
        />
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 3. Bottom Summary Info Bar                                     */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          flexShrink: 0,
        }}
      >
        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          Showing{' '}
          <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {filteredOrders.length} running orders
          </Box>{' '}
          · {awaitingKitchenCount} awaiting kitchen, {readyToSettleCount} ready to settle
        </Typography>

        <ButtonBase
          onClick={handleDownloadReport}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            color: colors.primary.default,
            fontWeight: 600,
            fontSize: '0.875rem',
            p: 0.5,
            borderRadius: 1,
            transition: 'opacity 0.15s ease',
            '&:hover': {
              textDecoration: 'underline',
              opacity: 0.85,
            },
          }}
        >
          <Download size={15} />
          Download Report
        </ButtonBase>
      </Box>
    </Box>
  );
}
