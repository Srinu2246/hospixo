'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import { Search } from 'lucide-react';

import { SearchBar } from '@/components/shared/form-fields/SearchBar';

import { Toast } from '@/components/shared/ui/Toast';
import { Modal } from '@/components/shared/ui/Modal';
import { CaptainWorkspaceSubheader } from '@/features/pos/point-of-sale/components/CaptainWorkspaceSubheader';
import { ReadyOrderCard } from '@/features/pos/point-of-sale/components/ReadyOrderCard';
import { useCaptainCompactLayout } from '@/lib/hooks/useCaptainCompactLayout';
import {
  MOCK_READY_ORDERS,
  MOCK_READY_PENDING,
  type ReadyOrderItem,
} from '@/lib/mocks/pos/usePosOrders.mocks';
import { FilterChips } from '@/components/shared/form-fields/FilterChips';
import { POS_CAPTAIN_LIST_BOTTOM_GAP } from '@/lib/helpers/posCaptainFlow';

type ReadyListTab = 'active' | 'pending' | 'history';
import { colors } from '@/lib/theme/mui/colors';

/**
 * ReadyListPage Component
 *
 * Full-screen "Ready to Serve" management screen featuring:
 * 1. Top bar with order search and "Live Store Ops Online" status indicator.
 * 2. "Ready to Serve" header with dynamic live counter badge.
 * 3. 3-column responsive card grid powered by ReadyOrderCard.
 * 4. Interactive Serve actions with Toast confirmation and View Order details modal.
 */
export function ReadyListPage() {
  const captainCompact = useCaptainCompactLayout();
  const [orders, setOrders] = useState<ReadyOrderItem[]>(MOCK_READY_ORDERS);
  const [pendingOrders] = useState<ReadyOrderItem[]>(MOCK_READY_PENDING);
  const [historyOrders, setHistoryOrders] = useState<ReadyOrderItem[]>([]);
  const [readyTab, setReadyTab] = useState<ReadyListTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [servingOrderId, setServingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ReadyOrderItem | null>(null);

  const tabOrders = useMemo(() => {
    if (readyTab === 'pending') return pendingOrders;
    if (readyTab === 'history') return historyOrders;
    return orders;
  }, [historyOrders, orders, pendingOrders, readyTab]);

  const readyTabItems = useMemo(
    () => [
      { id: 'active' as const, label: `Active (${orders.length})` },
      { id: 'pending' as const, label: `Pending (${pendingOrders.length})` },
      { id: 'history' as const, label: `History (${historyOrders.length})` },
    ],
    [historyOrders.length, orders.length, pendingOrders.length],
  );

  // Filter orders by search query (table, token, or dish summary)
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return tabOrders;
    const query = searchQuery.toLowerCase().trim();
    return tabOrders.filter(
      (order) =>
        order.table.toLowerCase().includes(query) ||
        order.token.toLowerCase().includes(query) ||
        order.dishSummary.toLowerCase().includes(query),
    );
  }, [searchQuery, tabOrders]);

  // Action: Serve order
  const handleServe = (order: ReadyOrderItem) => {
    setServingOrderId(order.id);
    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setHistoryOrders((prev) => [{ ...order, readyTimeAgo: 'Served just now' }, ...prev]);
      setServingOrderId(null);
      setToastMessage(`${order.table} (${order.token}) marked as served!`);
    }, 350);
  };

  // Action: View order details modal
  const handleViewOrder = (order: ReadyOrderItem) => {
    setSelectedOrder(order);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: captainCompact ? 'hidden' : 'auto',
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          width: '100%',
          mx: 'auto',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: captainCompact ? 'hidden' : 'visible',
        }}
      >
        {captainCompact ? (
          <Stack spacing={1.5} sx={{ mb: 1.5 }}>
            <CaptainWorkspaceSubheader title="Ready to Serve" subtitle="Kitchen updates live" />
            <FilterChips
              items={readyTabItems}
              value={readyTab}
              onChange={(value) => setReadyTab(value as ReadyListTab)}
              scrollable
            />
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search orders, tokens, table numbers..."
              fullWidth
              showClear
              sx={{ height: 44 }}
            />
          </Stack>
        ) : null}

        {/* ----------------------------------------------------------- */}
        {/* 1. Top Bar: Search Input & Live Store Ops Online Badge       */}
        {/* ----------------------------------------------------------- */}
        <Box
          sx={{
            display: captainCompact ? 'none' : 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 1.5,
          }}
        >
          {/* Search Field */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '10px',
              px: 1.75,
              py: 1,
              width: { xs: '100%', sm: 380 },
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
              transition: 'border-color 0.15s ease',
              '&:focus-within': {
                borderColor: 'primary.main',
              },
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                color: 'text.secondary',
                alignItems: 'center',
              }}
            >
              <Search size={18} />
            </Box>
            <InputBase
              placeholder="Search orders, tokens, table numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                ml: 1.25,
                flex: 1,
                fontSize: '0.875rem',
                color: 'text.primary',
                '& input::placeholder': {
                  color: 'text.disabled',
                  opacity: 1,
                },
              }}
            />
          </Box>

          {/* Live Store Ops Online Indicator */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(colors.success.default, 0.15)
                  : alpha(colors.success.default, 0.1),
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(colors.success.default, 0.3)
                  : alpha(colors.success.default, 0.25),
              color: (theme) =>
                theme.palette.mode === 'dark' ? colors.success.light : colors.success.dark,
              px: 1.75,
              py: 0.75,
              borderRadius: '20px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: colors.success.default,
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? `0 0 0 2px ${alpha(colors.success.default, 0.4)}`
                    : `0 0 0 2px ${alpha(colors.success.default, 0.25)}`,
              }}
            />
            Live Store Ops Online
          </Box>
        </Box>

        {/* ----------------------------------------------------------- */}
        {/* 2. Section Header: "Ready to Serve" + Count Badge          */}
        {/* ----------------------------------------------------------- */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', mb: 1.5, display: captainCompact ? 'none' : 'flex' }}
        >
          <Box
            sx={{
              minWidth: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(colors.success.default, 0.2)
                  : alpha(colors.success.default, 0.15),
              color: (theme) =>
                theme.palette.mode === 'dark' ? colors.success.light : colors.success.dark,
              fontSize: '0.875rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 0.75,
            }}
          >
            {filteredOrders.length}
          </Box>
        </Stack>

        {/* ----------------------------------------------------------- */}
        {/* 3. Cards Grid (3 Columns)                                   */}
        {/* ----------------------------------------------------------- */}
        {filteredOrders.length === 0 ? (
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              p: 8,
              textAlign: 'center',
              mt: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              No orders ready to serve
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              All kitchen items have been served or try adjusting your search term.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: captainCompact ? 1 : undefined,
              minHeight: captainCompact ? 0 : undefined,
              overflowY: captainCompact ? 'auto' : 'visible',
              pb: captainCompact ? `${POS_CAPTAIN_LIST_BOTTOM_GAP}px` : 0,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {filteredOrders.map((order) => (
              <ReadyOrderCard
                key={order.id}
                order={order}
                compact={captainCompact}
                onViewOrder={handleViewOrder}
                onServe={readyTab === 'active' ? handleServe : undefined}
                isServing={servingOrderId === order.id}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* ----------------------------------------------------------- */}
      {/* 4. View Order Modal Dialog                                  */}
      {/* ----------------------------------------------------------- */}
      {selectedOrder && (
        <Modal
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details · ${selectedOrder.table}`}
          subtitle={`${selectedOrder.token} · ${selectedOrder.readyTimeAgo}`}
          width={520}
          height="auto"
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {/* Summary Row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: '12px',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  Items Ready
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'primary.main' }}>
                  {selectedOrder.itemsCount} Items
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  Priority
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: selectedOrder.priority === 'HIGH' ? 'error.main' : 'text.primary',
                  }}
                >
                  {selectedOrder.priority}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  Payment Status
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: selectedOrder.paymentStatus === 'PAID' ? 'success.main' : 'warning.main',
                  }}
                >
                  {selectedOrder.paymentStatus}
                </Typography>
              </Box>
            </Box>

            {/* Dish Info */}
            <Box>
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  mb: 0.5,
                }}
              >
                Prepared Dishes
              </Typography>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'text.primary' }}>
                &quot;{selectedOrder.dishSummary}&quot;
              </Typography>
            </Box>
          </Box>
        </Modal>
      )}

      {/* Global Toast Feedback */}
      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage ?? ''}
        onClose={() => setToastMessage(null)}
      />
    </Box>
  );
}
