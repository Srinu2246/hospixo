'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { ChevronRight, Minus, Plus, Trash2, Utensils } from 'lucide-react';
import { POS_CAPTAIN_COMPACT_PADDING } from '@/lib/helpers/posCaptainFlow';
import { colors } from '@/lib/theme/mui/colors';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import type { CartItem } from '@/lib/mocks/pos/usePosMenu.mocks';

export interface MenuOrderSummaryBarProps {
  items: CartItem[];
  orderNumber?: string;
  orderTypeLabel?: string;
  discount?: number;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onGenerateBill?: () => void;
  onProceedCheckout?: () => void;
  onServe?: () => void;
  serveLabel?: string;
  /** Captain mobile/tablet sticky footer (Figma) instead of side panel. */
  layout?: 'panel' | 'compactSticky';
}

/**
 * MenuOrderSummaryBar Component
 *
 * Global shared fixed right-side panel spanning full page height with:
 * 1. Fixed header displaying order number and total items badge.
 * 2. Independent scrollable cart list with food previews, quantity steppers, and remove triggers.
 * 3. Fixed bottom bill summary calculation and dual checkout action triggers.
 * Exclusively uses theme tokens from `@/lib/theme/mui/colors`.
 */
export function MenuOrderSummaryBar({
  items,
  orderNumber = '#0029',
  orderTypeLabel = 'COUNTER 01',
  discount = 0,
  onUpdateQuantity,
  onRemoveItem,
  onGenerateBill,
  onProceedCheckout,
  onServe,
  serveLabel,
  layout = 'panel',
}: Readonly<MenuOrderSummaryBarProps>) {
  // Calculations
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  if (layout === 'compactSticky') {
    if (!onServe && items.length === 0) return null;

    return (
      <Box
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          px: POS_CAPTAIN_COMPACT_PADDING,
          py: 1.25,
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: 'text.primary' }}>
            {totalItemCount} Item{totalItemCount === 1 ? '' : 's'} Selected
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.25 }}>
            Subtotal: Rs {subtotal.toLocaleString('en-IN')}
          </Typography>
        </Box>
        {onServe ? (
          <ActionButton
            variant="primary"
            onClick={onServe}
            disabled={items.length === 0}
            endIcon={<ChevronRight size={18} strokeWidth={2.5} />}
            sx={{
              flexShrink: 0,
              minHeight: 44,
              px: 2,
              borderRadius: '10px',
              fontWeight: 700,
              bgcolor: colors.captainFlow.kotAction,
              boxShadow: 'none',
              '&:hover': { bgcolor: colors.captainFlow.kotActionHover },
            }}
          >
            {serveLabel ?? 'Send to KOT'}
          </ActionButton>
        ) : null}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 360, lg: 380 },
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Fixed Header Section                                       */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          p: 2.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.01em',
            }}
          >
            ORDER SUMMARY
          </Typography>

          <Box
            sx={{
              px: 1.25,
              py: 0.35,
              borderRadius: '12px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.2)' : colors.sidebar.badgeBg,
              color: (theme) =>
                theme.palette.mode === 'dark'
                  ? colors.dark.secondary.light
                  : colors.secondary.default,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {totalItemCount} {totalItemCount === 1 ? 'ITEM' : 'ITEMS'}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'text.secondary',
              letterSpacing: '0.02em',
            }}
          >
            {orderTypeLabel}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            ORDER: {orderNumber}
          </Typography>
        </Box>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Scrollable Cart Items List                                 */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 2,
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
        {items.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              color: 'text.secondary',
              textAlign: 'center',
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                color: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : colors.border.dark,
              }}
            >
              <Utensils size={36} />
            </Box>
            <Typography sx={{ mt: 1.5, fontSize: '0.9375rem', fontWeight: 600 }}>
              No items in current order
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              Click items from the menu to add them
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {items.map((cartItem) => (
              <Box
                key={cartItem.cartId}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  pb: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {/* Left: Thumbnail image */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {cartItem.imageUrl ? (
                    <Box
                      component="img"
                      src={cartItem.imageUrl}
                      alt={cartItem.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        color: 'text.secondary',
                        alignItems: 'center',
                      }}
                    >
                      <Utensils size={20} />
                    </Box>
                  )}
                </Box>

                {/* Center: Details & Stepper */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {cartItem.name}
                  </Typography>

                  {/* Badges */}
                  {cartItem.itemBadges && cartItem.itemBadges.length > 0 && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      {cartItem.itemBadges.map((badge, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            px: 0.75,
                            py: 0.15,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: 'text.secondary',
                          }}
                        >
                          {badge}
                        </Box>
                      ))}
                    </Stack>
                  )}

                  {/* Stepper */}
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      alignItems: 'center',
                      bgcolor: 'background.paper',
                      borderRadius: '6px',
                      p: 0.25,
                      border: '1px solid',
                      borderColor: 'divider',
                      width: 'fit-content',
                      mt: 1,
                    }}
                  >
                    <ButtonBase
                      disabled={Boolean(
                        (cartItem.disableDelete || cartItem.isExisting) &&
                        cartItem.quantity <= (cartItem.originalQuantity ?? cartItem.quantity),
                      )}
                      onClick={() => {
                        if (
                          (cartItem.disableDelete || cartItem.isExisting) &&
                          cartItem.quantity <= (cartItem.originalQuantity ?? cartItem.quantity)
                        ) {
                          return;
                        }
                        onUpdateQuantity(cartItem.cartId, -1);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        color:
                          (cartItem.disableDelete || cartItem.isExisting) &&
                          cartItem.quantity <= (cartItem.originalQuantity ?? cartItem.quantity)
                            ? 'text.disabled'
                            : 'text.primary',
                        opacity:
                          (cartItem.disableDelete || cartItem.isExisting) &&
                          cartItem.quantity <= (cartItem.originalQuantity ?? cartItem.quantity)
                            ? 0.35
                            : 1,
                        cursor:
                          (cartItem.disableDelete || cartItem.isExisting) &&
                          cartItem.quantity <= (cartItem.originalQuantity ?? cartItem.quantity)
                            ? 'not-allowed'
                            : 'pointer',
                        '&:hover': {
                          bgcolor:
                            (cartItem.disableDelete || cartItem.isExisting) &&
                            cartItem.quantity <= (cartItem.originalQuantity ?? cartItem.quantity)
                              ? 'transparent'
                              : 'action.hover',
                        },
                      }}
                    >
                      <Minus size={13} />
                    </ButtonBase>
                    <Typography
                      sx={{
                        px: 1,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'text.primary',
                        minWidth: 18,
                        textAlign: 'center',
                      }}
                    >
                      {cartItem.quantity}
                    </Typography>
                    <ButtonBase
                      onClick={() => onUpdateQuantity(cartItem.cartId, 1)}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        color: 'text.primary',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Plus size={13} />
                    </ButtonBase>
                  </Stack>
                </Box>

                {/* Right: Price & Delete */}
                <Stack spacing={1} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: 'text.primary',
                    }}
                  >
                    Rs {(cartItem.unitPrice * cartItem.quantity).toLocaleString('en-IN')}
                  </Typography>

                  <ButtonBase
                    disabled={Boolean(cartItem.disableDelete || cartItem.isExisting)}
                    onClick={() => {
                      if (cartItem.disableDelete || cartItem.isExisting) return;
                      onRemoveItem(cartItem.cartId);
                    }}
                    aria-label={
                      cartItem.disableDelete || cartItem.isExisting
                        ? 'Previous item cannot be removed'
                        : 'Remove item'
                    }
                    sx={{
                      p: 0.5,
                      borderRadius: '6px',
                      color:
                        cartItem.disableDelete || cartItem.isExisting
                          ? 'text.disabled'
                          : colors.danger.light,
                      opacity: cartItem.disableDelete || cartItem.isExisting ? 0.35 : 1,
                      cursor:
                        cartItem.disableDelete || cartItem.isExisting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': {
                        color:
                          cartItem.disableDelete || cartItem.isExisting
                            ? 'text.disabled'
                            : colors.danger.default,
                        bgcolor:
                          cartItem.disableDelete || cartItem.isExisting
                            ? 'transparent'
                            : 'action.hover',
                      },
                    }}
                  >
                    <Trash2 size={16} />
                  </ButtonBase>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 3. Fixed Bottom Bill Summary Section                          */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          p: 2.25,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Stack spacing={1.25}>
          {/* Sub total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
              Sub total
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 700 }}>
              Rs {subtotal.toFixed(2)}
            </Typography>
          </Box>

          {/* Discount */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
              Discount
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 700 }}>
              Rs {discount.toFixed(2)}
            </Typography>
          </Box>

          {/* TOTAL */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 0.75,
              borderTop: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: '1rem', color: 'text.primary', fontWeight: 800 }}>
              TOTAL
            </Typography>
            <Typography
              sx={{
                fontSize: '1.25rem',
                color: 'text.primary',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Rs {total.toFixed(2)}
            </Typography>
          </Box>
        </Stack>

        {/* Primary Serve Action (if in Table / Serve mode) */}
        {onServe && (
          <ActionButton
            variant="primary"
            size="medium"
            onClick={onServe}
            sx={{
              width: '100%',
              mt: 2,
              height: 44,
              fontWeight: 700,
              fontSize: '0.9375rem',
              borderRadius: '8px',
              bgcolor: colors.success.default,
              color: colors.white.default,
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '&:hover': {
                bgcolor: colors.success.dark,
              },
            }}
          >
            <Utensils size={18} />
            {serveLabel ?? 'Serve Items'}
          </ActionButton>
        )}

        {/* Dual Actions: Bill & Proceed check out */}
        <Stack direction="row" spacing={1.5} sx={{ mt: onServe ? 1.5 : 2.5 }}>
          <ActionButton
            variant="outlined"
            size="medium"
            onClick={onGenerateBill}
            sx={{
              px: 2.5,
              height: 42,
              fontWeight: 700,
              fontSize: '0.875rem',
              color: colors.danger.default,
              borderColor: colors.danger.light,
              borderRadius: '8px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'transparent' : 'background.paper',
              boxShadow: 'none',
              '&:hover': {
                borderColor: colors.danger.default,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : colors.surface.muted,
              },
            }}
          >
            Bill
          </ActionButton>

          <ActionButton
            variant="primary"
            size="medium"
            onClick={onProceedCheckout}
            sx={{
              flex: 1,
              height: 42,
              fontWeight: 700,
              fontSize: '0.875rem',
              borderRadius: '8px',
              bgcolor: colors.warning.dark,
              color: colors.white.default,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: colors.danger.dark,
              },
            }}
          >
            Proceed check out
          </ActionButton>
        </Stack>
      </Box>
    </Box>
  );
}

// Aliases for backwards compatibility
