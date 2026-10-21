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
import { POS_CAPTAIN_LIST_BOTTOM_GAP } from '@/lib/helpers/posCaptainFlow';
import { MOCK_READY_ORDERS, type ReadyOrderItem } from '@/lib/mocks/pos/usePosOrders.mocks';
import { colors } from '@/lib/theme/mui/colors';

/**
 * ReadyListPage Component
 *
 * Full-screen "Ready to Serve" management screen featuring:
 * 1. Top bar with order search and "Live Store Ops Online" status indicator.
 * 2. "Ready to Serve" header with dynamic live counter badge.
 * 3. Responsive card grid powered by ReadyOrderCard.
 * 4. Interactive Serve actions with Toast confirmation and View Order details modal.
 */
export function ReadyListPage() {
  const captainCompact = useCaptainCompactLayout();
  const [orders, setOrders] = useState<ReadyOrderItem[]>(MOCK_READY_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [servingOrderId, setServingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ReadyOrderItem | null>(null);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase().trim();
    return orders.filter(
      (order) =>
        order.table.toLowerCase().includes(query) ||
        order.token.toLowerCase().includes(query) ||
        order.dishSummary.toLowerCase().includes(query),
    );
  }, [orders, searchQuery]);

  const handleServe = (order: ReadyOrderItem) => {
    setServingOrderId(order.id);
    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setServingOrderId(null);
      setToastMessage(`${order.table} (${order.token}) marked as served!`);
    }, 350);
  };

  const handleViewOrder = (order: ReadyOrderItem) => {
    setSelectedOrder(order);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        flex: captainCompact ? 1 : undefined,
        minHeight: captainCompact ? 0 : undefined,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflowY: captainCompact ? 'hidden' : 'auto',
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          width: '100%',
          mx: 'auto',
          flex: captainCompact ? 1 : undefined,
          minHeight: captainCompact ? 0 : undefined,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {captainCompact ? (
          <Stack spacing={1.5} sx={{ flexShrink: 0, mb: 1.5 }}>
            <CaptainWorkspaceSubheader title="Ready to Serve" subtitle="Kitchen updates live" />
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search orders, tokens, table numbers..."
              fullWidth
              showClear
              sx={{ height: 44, borderRadius: '12px' }}
            />
          </Stack>
        ) : null}

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
              '&:focus-within': { borderColor: 'primary.main' },
            }}
          >
            <Box component="span" sx={{ display: 'inline-flex', color: 'text.secondary' }}>
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
                '& input::placeholder': { color: 'text.disabled', opacity: 1 },
              }}
            />
          </Box>

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
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: colors.success.default,
              }}
            />
            Live Store Ops Online
          </Box>
        </Box>

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
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, mb: 0.5 }}>
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
              display: 'flex',
              flexDirection: 'column',
              gap: captainCompact ? 1.5 : 2.5,
            }}
          >
            {filteredOrders.map((order) => (
              <ReadyOrderCard
                key={order.id}
                order={order}
                compact={captainCompact}
                onViewOrder={handleViewOrder}
                onServe={handleServe}
                isServing={servingOrderId === order.id}
              />
            ))}
          </Box>
        )}
      </Box>

      {selectedOrder ? (
        <Modal
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details · ${selectedOrder.table}`}
          subtitle={`${selectedOrder.token} · ${selectedOrder.readyTimeAgo}`}
          width={520}
          height="auto"
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
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
            <Box>
              <Typography
                sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.secondary', mb: 0.5 }}
              >
                Prepared Dishes
              </Typography>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                &quot;{selectedOrder.dishSummary}&quot;
              </Typography>
            </Box>
          </Box>
        </Modal>
      ) : null}

      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage ?? ''}
        onClose={() => setToastMessage(null)}
      />
    </Box>
  );
}
