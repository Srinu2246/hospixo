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
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Loading } from '@/components/shared/ui/Loading';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { gstLabelFromItem, toMenuCatalogItem } from '@/lib/helpers/menuItemHelpers';
import { useMenuItem } from '@/lib/hooks/menu/useMenuItems';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';
import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';
import { colors } from '@/lib/theme/mui/colors';

import { DeleteMenuItemModal } from './DeleteMenuItemModal';
import { DietaryIcon } from './DietaryIcon';

const DEFAULT_ITEM_IMG =
  'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?w=600&auto=format&fit=crop&q=80';

export interface MenuItemDetailPanelProps {
  /** List-row item used for id / category fallback while detail loads. */
  item: MenuCatalogItem;
  onBack: () => void;
  onEdit: () => void;
  onDelete?: () => void | Promise<void>;
  /** Disables delete modal actions while deactivate is in flight. */
  isDeleting?: boolean;
}

/**
 * Menu item detail. Loads full record from GET /v1/restaurant/menu/items/{item_id}.
 */
export function MenuItemDetailPanel({
  item,
  onBack,
  onEdit,
  onDelete,
  isDeleting = false,
}: Readonly<MenuItemDetailPanelProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const itemId = Number(item.id);
  const detailQuery = useMenuItem(Number.isFinite(itemId) && itemId > 0 ? itemId : undefined);

  const handleDeleteConfirm = async () => {
    if (!onDelete) {
      setDeleteDialogOpen(false);
      onBack();
      return;
    }

    setDeleteError(null);
    try {
      await onDelete();
      setDeleteDialogOpen(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'The delete request failed.');
    }
  };

  if (detailQuery.isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: 2 }}>
        <Loading fullPage={false} />
      </Box>
    );
  }

  if (detailQuery.isError) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: 2 }}>
        <AlertMessage
          variant="error"
          title="Unable to load menu item"
          message={
            detailQuery.error instanceof Error
              ? detailQuery.error.message
              : 'The menu item request failed.'
          }
        />
        <ActionButton variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
          Back to list
        </ActionButton>
      </Box>
    );
  }

  const detail = detailQuery.data;
  const catalog = detail ? toMenuCatalogItem(detail, undefined, item.categoryName) : item;

  return (
    <MenuItemDetailBody
      catalog={catalog}
      detail={detail}
      onBack={onBack}
      onEdit={onEdit}
      deleteDialogOpen={deleteDialogOpen}
      isDeleting={isDeleting}
      deleteError={deleteError}
      onOpenDelete={() => {
        setDeleteError(null);
        setDeleteDialogOpen(true);
      }}
      onCloseDelete={() => {
        if (isDeleting) return;
        setDeleteDialogOpen(false);
        setDeleteError(null);
      }}
      onConfirmDelete={handleDeleteConfirm}
    />
  );
}

function MenuItemDetailBody({
  catalog,
  detail,
  onBack,
  onEdit,
  deleteDialogOpen,
  isDeleting,
  deleteError,
  onOpenDelete,
  onCloseDelete,
  onConfirmDelete,
}: Readonly<{
  catalog: MenuCatalogItem;
  detail: MenuItemResponse | undefined;
  onBack: () => void;
  onEdit: () => void;
  deleteDialogOpen: boolean;
  isDeleting: boolean;
  deleteError: string | null;
  onOpenDelete: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => void | Promise<void>;
}>) {
  const isVeg = catalog.dietary === 'Veg' || catalog.dietary === 'Vegan';
  const primaryImage =
    detail?.images.find((image) => image.is_primary)?.url ??
    detail?.images[0]?.url ??
    catalog.imageUrl ??
    DEFAULT_ITEM_IMG;

  const orderTypes = catalog.orderTypes.length
    ? catalog.orderTypes
    : ['Delivery', 'Take Away', 'Dine In'];

  const tags =
    detail?.tags.map((tag) => tag.name) ??
    catalog.tags.filter((tag) => tag !== 'Set As Favorite' && tag !== 'Set As Combo');

  const variants = detail?.variants ?? [];
  const modifiers = detail?.modifier_groups ?? [];

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
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/company/dashboard' },
          { label: 'Menu Creation', onClick: onBack },
          { label: 'View item', active: true },
        ]}
        linkSx={{
          color: 'text.primary',
          fontWeight: 500,
          '&:hover': { color: 'primary.main', textDecoration: 'underline' },
        }}
        activeSx={{ color: 'primary.main', fontWeight: 600 }}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
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
              '&:hover': { bgcolor: 'action.hover' },
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
              {catalog.name}
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
                {catalog.categoryName}
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
                    catalog.dietary === 'Non-Veg'
                      ? 'Non-Veg'
                      : catalog.dietary === 'Egg'
                        ? 'Egg'
                        : 'Veg'
                  }
                  size={14}
                />
                <span>{catalog.dietary}</span>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0, mt: { xs: 1, sm: 0 } }}>
          <ActionButton
            variant="outlined"
            onClick={onOpenDelete}
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

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2.5, bgcolor: 'background.paper' }}
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
          <DetailField label="CATEGORY" value={catalog.categoryName} />
          <DetailField label="NAME" value={catalog.name} />
          <DetailField label="CODE" value={catalog.code || '—'} />
          <DetailField label="BASE PRICE" value={`₹${catalog.basePrice}`} />
          <DetailField
            label="PROFIT MARGIN"
            value={detail?.profit_margin_percent != null ? `${detail.profit_margin_percent}%` : '—'}
          />
          <DetailField label="GST TYPE" value={detail ? gstLabelFromItem(detail) : '—'} />
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2.5, bgcolor: 'background.paper' }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
          Description
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(200px, 320px) 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Box
            component="img"
            src={primaryImage}
            alt={catalog.name}
            sx={{
              width: '100%',
              height: { xs: 200, md: 180 },
              objectFit: 'cover',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
            }}
          />

          <Typography
            sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.65, minWidth: 0 }}
          >
            {catalog.description || 'No description provided.'}
          </Typography>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2.5, bgcolor: 'background.paper' }}
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
              <ReadOnlyCheck checked />
              <DietaryIcon
                type={
                  catalog.dietary === 'Non-Veg'
                    ? 'Non-Veg'
                    : catalog.dietary === 'Egg'
                      ? 'Egg'
                      : 'Veg'
                }
                size={18}
              />
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                {catalog.dietary}
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
                  control={<ReadOnlyCheck checked={orderTypes.includes(type)} />}
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
              control={<ReadOnlyCheck checked={detail?.expose_captain_app ?? true} />}
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

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2.5, bgcolor: 'background.paper' }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
          Tags
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {tags.length === 0 ? (
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>No tags</Typography>
          ) : (
            tags.map((tag) => (
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
            ))
          )}
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'stretch' }}>
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

            {variants.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  No variants
                </Typography>
              </Box>
            ) : (
              variants.map((row, idx) => (
                <Box
                  key={row.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr',
                    alignItems: 'center',
                    px: 2,
                    py: 1.25,
                    borderBottom: idx < variants.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                    {row.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                    ₹{row.final_price}
                  </Typography>
                  <Box>
                    <StatusChip
                      label={row.status === 'active' ? 'Active' : 'Inactive'}
                      variantType={row.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Paper>

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
                REQUIRED
              </Typography>
            </Box>

            {modifiers.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  No modifiers
                </Typography>
              </Box>
            ) : (
              modifiers.map((row, idx) => (
                <Box
                  key={row.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    alignItems: 'center',
                    px: 2,
                    py: 1.25,
                    borderBottom: idx < modifiers.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                    {row.modifier_group?.name ?? `Group #${row.modifier_group_id}`}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                    {row.modifier_group?.is_required ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Paper>
      </Stack>

      {deleteError ? (
        <AlertMessage
          variant="error"
          title="Unable to delete menu item"
          message={deleteError}
          sx={{ mt: 2 }}
        />
      ) : null}

      <DeleteMenuItemModal
        open={deleteDialogOpen}
        loading={isDeleting}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        item={catalog}
      />
    </Box>
  );
}

function DetailField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary', mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );
}

function ReadOnlyCheck({ checked }: Readonly<{ checked: boolean }>) {
  return (
    <Checkbox
      checked={checked}
      readOnly
      disableRipple
      size="small"
      sx={{
        p: 0.5,
        cursor: 'default',
        color: 'primary.main',
        '&.Mui-checked': { color: 'primary.main' },
        '&.Mui-disabled': { color: 'primary.main !important' },
        '& .MuiSvgIcon-root': { color: checked ? 'primary.main !important' : undefined },
      }}
    />
  );
}
