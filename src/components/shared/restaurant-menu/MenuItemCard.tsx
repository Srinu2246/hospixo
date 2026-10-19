'use client';

import { useState, useMemo, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import { Minus, Plus, Utensils } from 'lucide-react';

import { colors } from '@/lib/theme/mui/colors';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Modal } from '@/components/shared/ui/Modal';
import type {
  PosMenuItem,
  ItemSizeOption,
  ItemAddOnOption,
  CookingPreference,
  CartCustomization,
} from '@/lib/mocks/pos/usePosMenu.mocks';

export interface MenuItemCardProps {
  item: PosMenuItem;
  viewMode?: 'list' | 'grid';
  quantityInCart?: number;
  /** Captain mobile/tablet list row + bottom sheet (Figma). */
  captainCompact?: boolean;
  onAddDefault: () => void;
  onDecrementDefault?: () => void;
  onAddCustomized: (customization: CartCustomization, quantity: number, unitPrice: number) => void;
}

/**
 * MenuItemCard Component
 *
 * Versatile menu item card supporting both:
 * 1. List View: Collapsible row displaying thumbnail, name, price, instant add button,
 *    and expanding drawer with customization options.
 * 2. Grid View: Rich card displaying top food image, name, size badges (Mini, Single, Medium),
 *    cost, direct Add button / stepper, and opening a full customization Modal on click.
 */
export function MenuItemCard({
  item,
  viewMode = 'list',
  quantityInCart = 0,
  captainCompact = false,
  onAddDefault,
  onDecrementDefault,
  onAddCustomized,
}: Readonly<MenuItemCardProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Customization state
  const defaultSize = item.sizes[1] ??
    item.sizes[0] ?? { id: 'regular', name: 'Regular', price: item.basePrice };
  const [selectedSizes, setSelectedSizes] = useState<ItemSizeOption[]>([defaultSize]);
  const [selectedAddOns, setSelectedAddOns] = useState<ItemAddOnOption[]>([]);
  const [cookingPref, setCookingPref] = useState<CookingPreference>(
    item.cookingPreferences[0] ?? 'Mild',
  );
  const [customQty, setCustomQty] = useState(1);

  // Toggle size selection (supports selecting multiple sizes like Single, Full, Family)
  const handleToggleSize = (size: ItemSizeOption) => {
    setSelectedSizes((prev) => {
      const exists = prev.some((s) => s.id === size.id);
      if (exists) {
        // Keep at least one size selected
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s.id !== size.id);
      }
      return [...prev, size];
    });
  };

  // Toggle add-on checkbox
  const handleToggleAddOn = (addon: ItemAddOnOption) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  // Calculate live single item unit price & total based on selected sizes and add-ons
  const calculatedUnitPrice = useMemo(() => {
    const sizeSum = selectedSizes.reduce((acc, s) => acc + s.price, 0);
    const addOnSum = selectedAddOns.reduce((acc, a) => acc + a.price, 0);
    return (sizeSum > 0 ? sizeSum : item.basePrice) + addOnSum;
  }, [selectedSizes, selectedAddOns, item.basePrice]);

  const calculatedTotalPrice = calculatedUnitPrice * customQty;

  // Direct click on "+ Add" button adds the default item immediately
  const handleDirectAddClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddDefault();
  };

  const handleDirectDecrementClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDecrementDefault?.();
  };

  // Add customized item to cart
  const handleConfirmCustomization = () => {
    onAddCustomized(
      {
        selectedSizes,
        selectedAddOns,
        cookingPreference: cookingPref,
      },
      customQty,
      calculatedUnitPrice,
    );
    setIsExpanded(false);
    setIsModalOpen(false);
    setCustomQty(1);
  };

  // Render reusable customization form controls
  const renderCustomizationContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Section Header: Customize & 1 item badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '1.0625rem', fontWeight: 800, color: 'text.primary' }}>
          Customize
        </Typography>
        <Box
          sx={{
            px: 1.25,
            py: 0.35,
            borderRadius: '12px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
            border: '1px solid',
            borderColor: 'divider',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          1 item
        </Box>
      </Box>

      {/* Section 1: Choose Size */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
            Choose Size
          </Typography>
          <Box
            sx={{
              px: 0.75,
              py: 0.2,
              bgcolor: colors.danger.default,
              color: colors.white.default,
              fontSize: '0.625rem',
              fontWeight: 800,
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}
          >
            REQUIRED
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1.25,
          }}
        >
          {item.sizes.map((size) => {
            const isSelected = selectedSizes.some((s) => s.id === size.id);
            return (
              <ButtonBase
                key={size.id}
                onClick={() => handleToggleSize(size)}
                sx={{
                  p: 1.25,
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: (theme) =>
                    isSelected
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(51, 84, 244, 0.2)'
                        : 'rgba(51, 84, 244, 0.08)'
                      : theme.palette.mode === 'dark'
                        ? 'action.hover'
                        : 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.light',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? 'primary.main' : 'text.primary',
                  }}
                >
                  {size.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'text.primary',
                  }}
                >
                  ₹{size.price}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      {/* Section 2: Extra Add-ons */}
      {item.addOns.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
            Extra Add-ons
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 1.25,
            }}
          >
            {item.addOns.map((addon) => {
              const isChecked = selectedAddOns.some((a) => a.id === addon.id);
              return (
                <Box
                  key={addon.id}
                  onClick={() => handleToggleAddOn(addon)}
                  sx={{
                    p: 1,
                    px: 1.25,
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: isChecked ? 'primary.main' : 'divider',
                    bgcolor: (theme) =>
                      isChecked
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(51, 84, 244, 0.15)'
                          : 'rgba(51, 84, 244, 0.06)'
                        : theme.palette.mode === 'dark'
                          ? 'action.hover'
                          : 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Checkbox
                      checked={isChecked}
                      size="small"
                      sx={{
                        p: 0.25,
                        color: 'text.secondary',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                    >
                      {addon.name}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}
                  >
                    +₹{addon.price}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Section 3: Cooking Preference */}
      {item.cookingPreferences.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
            Cooking Preference
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              p: 0.5,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
              borderRadius: '10px',
              width: 'fit-content',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {item.cookingPreferences.map((pref) => {
              const isSelected = cookingPref === pref;
              return (
                <ButtonBase
                  key={pref}
                  onClick={() => setCookingPref(pref)}
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: '8px',
                    bgcolor: isSelected ? 'background.paper' : 'transparent',
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.8125rem',
                    boxShadow: isSelected
                      ? (theme) =>
                          theme.palette.mode === 'dark'
                            ? '0 1px 3px rgba(0,0,0,0.4)'
                            : `0 1px 3px ${colors.border.default}`
                      : 'none',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  {pref}
                </ButtonBase>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Bottom Action Row: Stepper + Add Item Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Quantity Stepper */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            p: 0.25,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ButtonBase
            onClick={() => setCustomQty((prev) => Math.max(1, prev - 1))}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Minus size={15} />
          </ButtonBase>
          <Typography
            sx={{
              px: 1.5,
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'text.primary',
              minWidth: 24,
              textAlign: 'center',
            }}
          >
            {customQty}
          </Typography>
          <ButtonBase
            onClick={() => setCustomQty((prev) => prev + 1)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Plus size={15} />
          </ButtonBase>
        </Stack>

        {/* Final Add Item Button */}
        <ActionButton
          variant="primary"
          size="medium"
          onClick={handleConfirmCustomization}
          sx={{
            bgcolor: colors.primary.default,
            color: colors.white.default,
            fontSize: '0.875rem',
            fontWeight: 700,
            px: 3,
            height: 38,
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: colors.primary.dark,
            },
          }}
        >
          Add item | ₹{calculatedTotalPrice}
        </ActionButton>
      </Box>
    </Box>
  );

  // -------------------------------------------------------------------
  // A. GRID VIEW RENDERING
  // -------------------------------------------------------------------
  if (viewMode === 'grid') {
    return (
      <>
        <Box
          onClick={() => setIsModalOpen(true)}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            height: '100%',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 20px rgba(0, 0, 0, 0.6)'
                  : '0 8px 20px -4px rgba(0, 0, 0, 0.08)',
              borderColor: 'primary.main',
            },
          }}
        >
          {/* 1. Item Image Banner */}
          <Box
            sx={{
              width: '100%',
              height: 140,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {item.imageUrl ? (
              <Box
                component="img"
                src={item.imageUrl}
                alt={item.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.04)',
                  },
                }}
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
                <Utensils size={32} />
              </Box>
            )}

            {/* Popular Badge */}
            {item.isPopular && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  bgcolor: colors.primary.default,
                  color: colors.white.default,
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  px: 1,
                  py: 0.25,
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                }}
              >
                POPULAR
              </Box>
            )}
          </Box>

          {/* 2. Item Card Content */}
          <Box
            sx={{
              p: 1.75,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'space-between',
              gap: 1.25,
            }}
          >
            {/* Top: Name & Size Types */}
            <Box>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.3,
                  mb: 0.75,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.name}
              </Typography>

              {/* Quantity default type pills (Mini, Single, Medium, etc.) */}
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {item.sizes.map((size) => (
                  <Box
                    key={size.id}
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '6px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                    }}
                  >
                    {size.name}
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Bottom: Cost & Add Button / Stepper */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* Cost */}
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: colors.success.default,
                }}
              >
                Rs {item.basePrice}
              </Typography>

              {/* Stepper or Add Button */}
              {quantityInCart > 0 ? (
                <Stack
                  direction="row"
                  spacing={0.5}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    alignItems: 'center',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                    borderRadius: '8px',
                    p: 0.25,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ButtonBase
                    onClick={handleDirectDecrementClick}
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '6px',
                      color: 'text.primary',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Minus size={13} />
                  </ButtonBase>
                  <Typography
                    sx={{
                      px: 0.75,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'text.primary',
                      minWidth: 16,
                      textAlign: 'center',
                    }}
                  >
                    {quantityInCart}
                  </Typography>
                  <ButtonBase
                    onClick={handleDirectAddClick}
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '6px',
                      color: 'text.primary',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Plus size={13} />
                  </ButtonBase>
                </Stack>
              ) : (
                <ActionButton
                  variant="primary"
                  size="small"
                  onClick={handleDirectAddClick}
                  sx={{
                    height: 30,
                    px: 1.75,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    bgcolor: colors.primary.default,
                    color: colors.white.default,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: colors.primary.dark,
                    },
                  }}
                >
                  Add +
                </ActionButton>
              )}
            </Box>
          </Box>
        </Box>

        {/* Customization Details Modal */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Customize Item"
          subtitle={item.name}
          width={560}
          height="auto"
          paperSx={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Item Top Preview */}
          {item.imageUrl && (
            <Box
              sx={{
                width: '100%',
                height: 160,
                borderRadius: '10px',
                overflow: 'hidden',
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                component="img"
                src={item.imageUrl}
                alt={item.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          )}

          {renderCustomizationContent()}
        </Modal>
      </>
    );
  }

  // -------------------------------------------------------------------
  // B. CAPTAIN LIST VIEW (Figma)
  // -------------------------------------------------------------------
  if (captainCompact && viewMode === 'list') {
    const openCustomize = () => {
      if (item.sizes.length > 1 || item.addOns.length > 0) {
        setIsModalOpen(true);
        return;
      }
      onAddDefault();
    };

    return (
      <>
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            p: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '10px',
              overflow: 'hidden',
              flexShrink: 0,
              bgcolor: colors.surface.muted,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {item.imageUrl ? (
              <Box
                component="img"
                src={item.imageUrl}
                alt={item.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'text.secondary',
                }}
              >
                <Utensils size={22} />
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }} onClick={openCustomize}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3 }} noWrap>
              {item.name}
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '0.9375rem',
                color: colors.captainFlow.primary,
                mt: 0.35,
              }}
            >
              Rs {item.basePrice}
            </Typography>
          </Box>
          {quantityInCart > 0 ? (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: 'center',
                bgcolor: colors.surface.muted,
                borderRadius: '10px',
                p: 0.35,
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              <ButtonBase
                onClick={handleDirectDecrementClick}
                sx={{ width: 30, height: 30, borderRadius: '8px' }}
              >
                <Minus size={14} />
              </ButtonBase>
              <Typography
                sx={{
                  px: 0.75,
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  minWidth: 18,
                  textAlign: 'center',
                }}
              >
                {quantityInCart}
              </Typography>
              <ButtonBase
                onClick={handleDirectAddClick}
                sx={{ width: 30, height: 30, borderRadius: '8px' }}
              >
                <Plus size={14} />
              </ButtonBase>
            </Stack>
          ) : (
            <ActionButton
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                openCustomize();
              }}
              sx={{
                flexShrink: 0,
                minWidth: 64,
                height: 36,
                borderRadius: '8px',
                borderColor: colors.captainFlow.primary,
                color: colors.captainFlow.primary,
                fontWeight: 800,
                fontSize: '0.8125rem',
                boxShadow: 'none',
              }}
            >
              ADD
            </ActionButton>
          )}
        </Box>

        <Drawer
          anchor="bottom"
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          slotProps={{
            paper: {
              sx: {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: '88vh',
                px: 2,
                pt: 1.5,
                pb: 2.5,
              },
            },
          }}
        >
          <Box
            sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider', mx: 'auto', mb: 1.5 }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 0.5,
            }}
          >
            <Box sx={{ pr: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.125rem' }}>{item.name}</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.35 }}>
                Customize cooking preferences and add-ons
              </Typography>
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1rem',
                color: colors.captainFlow.primary,
                flexShrink: 0,
              }}
            >
              Rs {calculatedUnitPrice}
            </Typography>
          </Box>
          <Box sx={{ overflowY: 'auto', maxHeight: 'calc(88vh - 140px)', pr: 0.5 }}>
            {renderCustomizationContent()}
          </Box>
        </Drawer>
      </>
    );
  }

  // -------------------------------------------------------------------
  // C. LIST VIEW RENDERING (DEFAULT)
  // -------------------------------------------------------------------
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: (theme) => (isExpanded ? theme.palette.primary.main : theme.palette.divider),
        transition: 'all 0.18s ease-in-out',
        overflow: 'hidden',
        '&:hover': {
          borderColor: (theme) =>
            isExpanded
              ? theme.palette.primary.main
              : theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.25)'
                : colors.border.dark,
        },
      }}
    >
      {/* 1. Collapsed Item Row Header */}
      <Box
        onClick={() => setIsExpanded((prev) => !prev)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          cursor: 'pointer',
          gap: 2,
        }}
      >
        {/* Left: Thumbnail & Name */}
        <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
          {/* Thumbnail */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '8px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {item.imageUrl ? (
              <Box
                component="img"
                src={item.imageUrl}
                alt={item.name}
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

          {/* Name */}
          <Typography
            sx={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'text.primary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.name}
          </Typography>
        </Stack>

        {/* Right: Price & Quick Action */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: colors.success.default,
              whiteSpace: 'nowrap',
            }}
          >
            Rs {item.basePrice}
          </Typography>

          {/* Stepper if in cart or "+ Add" button */}
          {quantityInCart > 0 ? (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: 'center',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                borderRadius: '8px',
                p: 0.25,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ButtonBase
                onClick={handleDirectDecrementClick}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Minus size={14} />
              </ButtonBase>
              <Typography
                sx={{
                  px: 1,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  minWidth: 20,
                  textAlign: 'center',
                }}
              >
                {quantityInCart}
              </Typography>
              <ButtonBase
                onClick={handleDirectAddClick}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Plus size={14} />
              </ButtonBase>
            </Stack>
          ) : (
            <ActionButton
              variant="primary"
              size="small"
              onClick={handleDirectAddClick}
              sx={{
                height: 32,
                px: 2,
                fontSize: '0.8125rem',
                fontWeight: 700,
                borderRadius: '8px',
                bgcolor: colors.primary.default,
                color: colors.white.default,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: colors.primary.dark,
                },
              }}
            >
              Add +
            </ActionButton>
          )}
        </Stack>
      </Box>

      {/* 2. Expanded Customization Drawer */}
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {renderCustomizationContent()}
        </Box>
      </Collapse>
    </Box>
  );
}
