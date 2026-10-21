'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';

import { colors } from '@/lib/theme/mui/colors';
import type { OrderReviewData } from '@/features/pos/point-of-sale/components/OrderReviewSection';

export interface CaptainOrderReviewCardProps {
  order: OrderReviewData;
  onApplyCoupon?: (code: string) => void;
}

/** Captain mobile order review card (Figma: ORDERED ITEMS → Generate Receipt). */
export function CaptainOrderReviewCard({
  order,
  onApplyCoupon,
}: Readonly<CaptainOrderReviewCardProps>) {
  const [couponCode, setCouponCode] = useState('');
  const couponTotal = order.discounts.reduce((sum, d) => sum + d.amount, 0);

  const formatRs = (value: number) =>
    value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: 'text.secondary',
          mb: 1.5,
        }}
      >
        ORDERED ITEMS
      </Typography>

      <Stack spacing={1.75} divider={<Divider flexItem />}>
        {order.items.map((item) => (
          <Box
            key={item.id}
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.25 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{item.name}</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.25 }}>
                {item.quantity} × Rs {formatRs(item.unitPrice)}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', flexShrink: 0 }}>
              Rs {formatRs(item.unitPrice * item.quantity)}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '10px',
          px: 1.5,
          py: 0.75,
          '&:focus-within': { borderColor: 'primary.main' },
        }}
      >
        <InputBase
          placeholder="Apply coupon"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && couponCode.trim() && onApplyCoupon) {
              onApplyCoupon(couponCode.trim());
            }
          }}
          sx={{ flex: 1, fontSize: '0.875rem' }}
        />
        <ButtonBase
          onClick={() => {
            if (couponCode.trim() && onApplyCoupon) onApplyCoupon(couponCode.trim());
          }}
          sx={{
            color: colors.primary.default,
            fontWeight: 700,
            fontSize: '0.875rem',
            px: 1,
          }}
        >
          Apply
        </ButtonBase>
      </Box>

      <Stack spacing={1} sx={{ mt: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Subtotal</Typography>
          <Typography sx={{ fontWeight: 600 }}>Rs {formatRs(order.subtotal)}</Typography>
        </Box>
        {couponTotal > 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Coupon</Typography>
            <Typography sx={{ fontWeight: 600, color: colors.danger.default }}>
              -Rs {formatRs(couponTotal)}
            </Typography>
          </Box>
        ) : null}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            Tax ({Math.round(order.taxRate * 100)}% GST)
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>Rs {formatRs(order.taxAmount)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Grand Total</Typography>
          <Typography
            sx={{ fontWeight: 800, fontSize: '1.0625rem', color: colors.primary.default }}
          >
            Rs {formatRs(order.total)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
