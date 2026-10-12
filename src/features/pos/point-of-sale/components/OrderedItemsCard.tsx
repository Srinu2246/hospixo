'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ButtonBase from '@mui/material/ButtonBase';
import type { SxProps, Theme } from '@mui/material/styles';
import { colors } from '@/lib/theme/mui/colors';
import type { OrderedItem } from '@/lib/mocks/pos/usePosOrders.mocks';

export interface OrderedItemsCardProps {
  items: OrderedItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount: number;
  grandTotal: number;
  onGenerateReceipt?: () => void;
  isGeneratingReceipt?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * OrderedItemsCard Component
 *
 * Renders the ordered items card persisted on the page. The items list is
 * scrollable, while the top header and bottom total calculations & CTA remain fixed.
 * All styling exclusively uses theme color tokens from `@/lib/theme/mui/colors`.
 */
export function OrderedItemsCard({
  items,
  subtotal,
  taxRate = 0.05,
  taxAmount,
  grandTotal,
  onGenerateReceipt,
  isGeneratingReceipt = false,
  sx,
}: Readonly<OrderedItemsCardProps>) {
  const taxPercentage = Math.round(taxRate * 100);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 680,
        height: '100%',
        maxHeight: { xs: '100%', sm: 720 },
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        p: { xs: 2.5, sm: 3.5 },
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        ...((sx as object) || {}),
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Fixed Header Section                                       */}
      {/* ------------------------------------------------------------- */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'text.secondary',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          ORDERED ITEMS
        </Typography>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Scrollable Items Section                                    */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          pr: 1,
          mr: -0.5,
          scrollbarWidth: 'thin',
          scrollbarColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.15) transparent'
              : `${colors.border.default} transparent`,
          '&::-webkit-scrollbar': {
            width: 5,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : colors.border.default,
            borderRadius: 3,
            '&:hover': {
              background: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : colors.gray.light,
            },
          },
        }}
      >
        <Stack spacing={2.25} sx={{ py: 0.5 }}>
          {items.map((item) => {
            const itemTotal = item.totalPrice ?? item.quantity * item.unitPrice;
            return (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      color: 'text.secondary',
                      mt: 0.35,
                      fontWeight: 500,
                    }}
                  >
                    {item.quantity} × Rs {item.unitPrice.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Rs {itemTotal.toLocaleString('en-IN')}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 3. Fixed Bottom Total & Actions Section                       */}
      {/* ------------------------------------------------------------- */}
      <Box sx={{ flexShrink: 0, mt: 'auto', pt: 1 }}>
        {/* Separator */}
        <Divider sx={{ my: 2.25, borderColor: 'divider' }} />

        {/* Financial Breakdown */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {/* Subtotal */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', fontWeight: 500 }}>
              Subtotal
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 600 }}>
              Rs {subtotal.toLocaleString('en-IN')}
            </Typography>
          </Box>

          {/* Tax */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', fontWeight: 500 }}>
              Tax ({taxPercentage}% GST)
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 600 }}>
              Rs {taxAmount.toLocaleString('en-IN')}
            </Typography>
          </Box>

          {/* Grand Total */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 0.5,
            }}
          >
            <Typography sx={{ fontSize: '1rem', color: 'text.primary', fontWeight: 700 }}>
              Grand Total
            </Typography>
            <Typography
              sx={{
                fontSize: '1.25rem',
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Rs {grandTotal.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Box>

        {/* Bottom CTA Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <ButtonBase
            onClick={onGenerateReceipt}
            disabled={isGeneratingReceipt}
            sx={{
              bgcolor: colors.primary.default,
              color: colors.white.default,
              fontSize: '0.9375rem',
              fontWeight: 600,
              px: 3,
              py: 1.25,
              borderRadius: '8px',
              boxShadow: 'none',
              transition: 'background-color 0.15s ease-in-out',
              opacity: isGeneratingReceipt ? 0.7 : 1,
              cursor: isGeneratingReceipt ? 'not-allowed' : 'pointer',
              '&:hover': {
                bgcolor: isGeneratingReceipt ? colors.primary.default : colors.primary.dark,
              },
            }}
          >
            {isGeneratingReceipt ? 'Generating...' : 'Generate Receipt'}
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
}
