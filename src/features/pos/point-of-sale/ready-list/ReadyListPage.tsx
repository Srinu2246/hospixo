'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import { Search } from 'lucide-react';

import { Toast } from '@/components/shared/ui/Toast';
import { CaptainWorkspaceSubheader } from '@/features/pos/point-of-sale/components/CaptainWorkspaceSubheader';
import { ReadyOrderCard } from '@/features/pos/point-of-sale/components/ReadyOrderCard';
import { ReadyOrderDetailsModal } from '@/features/pos/point-of-sale/ready-list/ReadyOrderDetailsModal';
import { useCaptainCompactLayout } from '@/lib/hooks/useCaptainCompactLayout';
import { POS_CAPTAIN_LIST_BOTTOM_GAP } from '@/lib/helpers/posCaptainFlow';
import { MOCK_READY_ORDERS, type ReadyOrderItem } from '@/lib/mocks/pos/usePosOrders.mocks';
import { colors } from '@/lib/theme/mui/colors';

/**
 * Ready to Serve — original grid layout (search, live ops badge, full order cards).
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
          <Box sx={{ flexShrink: 0, mb: 1.5 }}>
            <CaptainWorkspaceSubheader title="Ready to Serve" subtitle="Kitchen updates live" />
          </Box>
        ) : null}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 1.5,
            flexShrink: 0,
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
              transition: 'border-color 0.15s ease',
              '&:focus-within': { borderColor: 'primary.main' },
            }}
          >
            <Box
              component="span"
              sx={{ display: 'inline-flex', color: 'text.secondary', alignItems: 'center' }}
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

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5, flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: '1.35rem', sm: '1.65rem' },
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            Ready to Serve
          </Typography>
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
            <Typography
              sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', mb: 0.5 }}
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
                onViewOrder={setSelectedOrder}
                onServe={handleServe}
                isServing={servingOrderId === order.id}
              />
            ))}
          </Box>
        )}
      </Box>

      <ReadyOrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage ?? ''}
        onClose={() => setToastMessage(null)}
      />
    </Box>
  );
}
