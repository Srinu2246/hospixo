'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { ArrowLeft, Pencil } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';
import { colors } from '@/lib/theme/mui/colors';

import { DeleteMenuItemModal } from './DeleteMenuItemModal';
import { DietaryIcon } from './DietaryIcon';

const DEFAULT_PANEER_TIKKA_IMG =
  'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?w=600&auto=format&fit=crop&q=80';

export interface MenuItemDetailPanelProps {
  item: MenuCatalogItem;
  onBack: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

/**
 * Full-fidelity Menu Item Detail screen matching reference design:
 * 1. Breadcrumbs: Home > Menu Creation > View Item
 * 2. Header: Back button, Item name, Starters & Veg badges, Delete and Edit action buttons
 * 3. Basic Details: 3-column key-value grid (Category, Name, Display Name, Code, Price, Profit Margin, GST)
 * 4. Description: Text description paired with food imagery
 * 5. Dietary & Order Type: Checkbox matrices for dietary, order types, and POS channels
 * 6. Tags: Rounded operational tags
 * 7. Side-by-side tables: Quantity / Size Options & Add-Ons
 */
export function MenuItemDetailPanel({
  item,
  onBack,
  onEdit,
  onDelete,
}: Readonly<MenuItemDetailPanelProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    if (onDelete) {
      onDelete();
    } else {
      onBack();
    }
  };

  const isVeg = item.dietary === 'Veg' || item.dietary === 'Vegan';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        gap: 2.5,
        pb: 6,
      }}
    >
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          {
            label: 'Home',
            href: '/company/dashboard',
          },
          {
            label: 'Menu Creation',
            onClick: onBack,
          },
          {
            label: 'View item',
            active: true,
          },
        ]}
        linkSx={{
          color: 'text.primary',
          fontWeight: 500,
          '&:hover': {
            color: 'primary.main',
            textDecoration: 'underline',
          },
        }}
        activeSx={{
          color: 'primary.main',
          fontWeight: 600,
        }}
      />

      {/* 2. Header with Back button, Title & Action buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { sm: 'flex-start' },
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <IconButton
            onClick={onBack}
            aria-label="Back to menu list"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            <ArrowLeft size={18} />
          </IconButton>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.375rem', sm: '1.625rem' },
                letterSpacing: '-0.02em',
                color: 'text.primary',
                lineHeight: 1.2,
              }}
            >
              {item.name}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Box
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: '16px',
                  bgcolor: alpha(colors.primary.default, 0.1),
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {item.categoryName}
              </Box>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.25,
                  borderRadius: '16px',
                  bgcolor: isVeg
                    ? alpha(colors.success.default, 0.1)
                    : alpha(colors.danger.default, 0.1),
                  color: isVeg ? colors.success.dark : colors.danger.dark,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <DietaryIcon
                  type={
                    item.dietary === 'Non-Veg' ? 'Non-Veg' : item.dietary === 'Egg' ? 'Egg' : 'Veg'
                  }
                  size={14}
                />
                <span>{item.dietary}</span>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0, mt: { xs: 1, sm: 0 } }}>
          <ActionButton
            variant="outlined"
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              color: 'error.main',
              borderColor: 'error.main',
              fontWeight: 600,
              height: 38,
              px: 2.25,
              borderRadius: '8px',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: 'error.dark',
                bgcolor: alpha(colors.danger.default, 0.05),
              },
            }}
          >
            Delete Item
          </ActionButton>

          <ActionButton
            variant="primary"
            startIcon={<Pencil size={16} />}
            onClick={onEdit}
            sx={{
              height: 38,
              px: 2.5,
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Edit Item
          </ActionButton>
        </Stack>
      </Stack>

      {/* 3. Basic Details Card */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2.5,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2.5 }}>
          Basic Details
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            rowGap: 2.5,
            columnGap: 3,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              CATEGORY
            </Typography>
            <Typography
              sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary', mt: 0.5 }}
            >
              {item.categoryName}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              NAME
            </Typography>
            <Typography
              sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary', mt: 0.5 }}
            >
              {item.name}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              ONLINE DISPLAY NAME
            </Typography>
            <Typography
              sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary', mt: 0.5 }}
            >
              {item.name} Masala
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              CODE
            </Typography>
            <Typography
              sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary', mt: 0.5 }}
            >
              {item.code || 'PNT'}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              BASE PRICE
            </Typography>
            <Typography
              sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary', mt: 0.5 }}
            >
              ₹{item.basePrice}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              PROFIT MARGIN
            </Typography>
            <Typography
              sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary', mt: 0.5 }}
            >
              10%
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              GST TYPE
            </Typography>
            <Typography
              sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary', mt: 0.5 }}
            >
              5% (Services)
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 4. Description Card */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2.5,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
          Description
        </Typography>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
        >
          <Typography
            sx={{
              flex: 1,
              color: 'text.secondary',
              fontSize: '0.875rem',
              lineHeight: 1.65,
            }}
          >
            {item.description ||
              'Soft cottage cheese cubes marinated in aromatic spices and grilled in a tandoor. Served with mint chutney and fresh onion rings. A classic Indian starter that never goes out of style.'}
          </Typography>

          <Box
            component="img"
            src={item.imageUrl || DEFAULT_PANEER_TIKKA_IMG}
            alt={item.name}
            sx={{
              width: { xs: '100%', md: 320 },
              height: 180,
              objectFit: 'cover',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
            }}
          />
        </Stack>
      </Paper>

      {/* 5. Dietary & Order Type Card */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2.5,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Dietary & Order Type
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}
          >
            Dietary flags are shown on online platforms. Order types apply to offline POS billing.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr 1fr' },
            gap: 2.5,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 1 }}
            >
              Dietary Type
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Checkbox
                checked
                readOnly
                disableRipple
                size="small"
                sx={{
                  p: 0.5,
                  cursor: 'default',
                  color: 'primary.main',
                  '&.Mui-checked': { color: 'primary.main' },
                  '&.Mui-disabled': { color: 'primary.main !important' },
                  '& .MuiSvgIcon-root': { color: 'primary.main !important' },
                }}
              />
              <DietaryIcon
                type={
                  item.dietary === 'Non-Veg' ? 'Non-Veg' : item.dietary === 'Egg' ? 'Egg' : 'Veg'
                }
                size={18}
              />
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                {item.dietary}
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 1 }}
            >
              Order Types
            </Typography>
            <Stack direction="row" spacing={2.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              {['Delivery', 'Take Away', 'Dine In'].map((type) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked
                      readOnly
                      disableRipple
                      size="small"
                      sx={{
                        p: 0.5,
                        cursor: 'default',
                        color: 'primary.main',
                        '&.Mui-checked': { color: 'primary.main' },
                        '&.Mui-disabled': { color: 'primary.main !important' },
                        '& .MuiSvgIcon-root': { color: 'primary.main !important' },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}
                    >
                      {type}
                    </Typography>
                  }
                  sx={{ m: 0, mr: 1, cursor: 'default' }}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 1 }}
            >
              Expose This Item In
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked
                  readOnly
                  disableRipple
                  size="small"
                  sx={{
                    p: 0.5,
                    cursor: 'default',
                    color: 'primary.main',
                    '&.Mui-checked': { color: 'primary.main' },
                    '&.Mui-disabled': { color: 'primary.main !important' },
                    '& .MuiSvgIcon-root': { color: 'primary.main !important' },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                  Captain app
                </Typography>
              }
              sx={{ m: 0, cursor: 'default' }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 6. Tags Card */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2.5,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
          Tags
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {['Chef Special', 'Spicy'].map((tag) => (
            <Box
              key={tag}
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#F8FAFC',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              {tag}
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* 7. Bottom Side-by-side Tables: Quantity / Size Options & Add-Ons */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'stretch' }}>
        {/* Left: Quantity / Size Options */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1.2,
            minWidth: 0,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
            Quantity / Size Options
          </Typography>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr',
                px: 2,
                py: 1,
                bgcolor: alpha('#F8FAFC', 0.9),
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                SIZE
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                PRICE
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                STATUS
              </Typography>
            </Box>

            {[
              { size: 'Mini', price: 149, status: 'Active' },
              { size: 'Single', price: 249, status: 'Active' },
              { size: 'Double', price: 399, status: 'Active' },
              { size: 'Family Pack', price: 599, status: 'Active' },
            ].map((row, idx) => (
              <Box
                key={row.size}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr',
                  alignItems: 'center',
                  px: 2,
                  py: 1.25,
                  borderBottom: idx < 3 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                  {row.size}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                  ₹{row.price}
                </Typography>
                <Box>
                  <StatusChip label={row.status} variantType="success" size="small" />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Right: Add-Ons */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
            Add-Ons
          </Typography>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                px: 2,
                py: 1,
                bgcolor: alpha('#F8FAFC', 0.9),
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                ADD-ON
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                PRICE
              </Typography>
            </Box>

            {[
              { addon: 'Extra Raita', price: 49 },
              { addon: 'Extra Gravy', price: 69 },
              { addon: 'Egg', price: 29 },
            ].map((row, idx) => (
              <Box
                key={row.addon}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  alignItems: 'center',
                  px: 2,
                  py: 1.25,
                  borderBottom: idx < 2 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                  {row.addon}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                  ₹{row.price}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Stack>

      {/* Delete Confirmation Modal */}
      <DeleteMenuItemModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        item={item}
      />
    </Box>
  );
}
