'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  Image as ImageIcon,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
  X,
} from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { FieldHelperText } from '@/components/shared/form-fields/FieldHelperText';
import { Input } from '@/components/shared/form-fields/Input';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Loading } from '@/components/shared/ui/Loading';
import { Modal } from '@/components/shared/ui/Modal';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import { toMenuCatalogItem } from '@/lib/helpers/menuItemHelpers';
import { useCreateMenuItem } from '@/lib/hooks/menu/menu-creation/useCreateMenuItem';
import type { MenuCataloguePageScope } from '@/lib/helpers/menuBranchContext';
import { menuItemTagNameToCode } from '@/lib/helpers/menuItemTagHelpers';
import { useCreateMenuItemTag, useMenuItemTags } from '@/lib/hooks/menu/useMenuItemTags';
import { useGstRates } from '@/lib/hooks/menu/gst-rates';
import { useMenuItem } from '@/lib/hooks/menu/useMenuItems';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useToastStore } from '@/stores/toastStore';
import { ApiError } from '@/services/api/types';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import { shouldSimulateMenuItemUploadError } from '@/lib/params/menu';
import type {
  CreateMenuItemSubmitValues,
  MenuCatalogItem,
  ItemOptionFormPayload,
  ModifierItem,
  VariantItem,
} from '@/lib/schemas/menu/menuCreationSchema';
import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';
import { colors } from '@/lib/theme/mui/colors';

import { useMenuCreation } from '@/features/menu/context';
import { DietaryIcon, type DietaryType } from './DietaryIcon';

function isPreviewImageSrc(value: string | undefined | null): value is string {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  );
}

export interface CreateMenuItemScreenProps {
  initialItem?: MenuCatalogItem | null;
  mode?: 'create' | 'edit';
  onBack?: () => void;
  onSaveSuccess?: () => void;
}

/**
 * CreateMenuItemScreen Component
 *
 * Full-fidelity Create / Edit Menu Item screen matching reference designs:
 * 1. Breadcrumbs: Home > Menu Creation > Edit item / Create Menu Item
 * 2. Header with Back button, Title and Subtitle
 * 3. Configuration Card (Category, Name, Online Display Name, Code, Item Base Price, Profit Margin, GST %, Description, Dietary & Order Type)
 * 4. Tags Information Card (Outer blue-tinted banner, "+ Create Tags", "Tags information" header with "12 tags" badge, 3-column selectable grid)
 * 5. Item Images Card (Paneer Tikka thumbnail, 2 placeholder slots, + add slot, "Allowed JPG, PNG. Max 10MB.")
 * 6. Variants & Modifiers (Side-by-side 2-column tables with SIZE/ADD-ON, PRICE, ACTIONS pencil/trash, and Add modals)
 * 7. Fixed Action Footer (Sticky / Portal with Cancel & Save Changes / Save Item)
 */
export function CreateMenuItemScreen({
  initialItem = null,
  mode = 'create',
  onBack,
  onSaveSuccess,
}: Readonly<CreateMenuItemScreenProps>) {
  let menuContext: ReturnType<typeof useMenuCreation> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    menuContext = useMenuCreation();
  } catch {
    menuContext = null;
  }

  const editItemId = mode === 'edit' && initialItem ? Number(initialItem.id) : undefined;
  const detailQuery = useMenuItem(
    typeof editItemId === 'number' && Number.isFinite(editItemId) && editItemId > 0
      ? editItemId
      : undefined,
  );

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else if (menuContext) {
      menuContext.backToList();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  if (mode === 'edit' && detailQuery.isLoading && !detailQuery.data) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: 2 }}>
        <Loading fullPage={false} />
      </Box>
    );
  }

  if (mode === 'edit' && detailQuery.isError && !detailQuery.data) {
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
        <ActionButton variant="outlined" onClick={handleBackNavigation} sx={{ mt: 2 }}>
          Back to list
        </ActionButton>
      </Box>
    );
  }

  const seededItem =
    mode === 'edit' && detailQuery.data
      ? toMenuCatalogItem(detailQuery.data, undefined, initialItem?.categoryName)
      : initialItem;

  return (
    <CreateMenuItemForm
      key={mode === 'edit' ? `edit-${detailQuery.data?.id ?? initialItem?.id}` : 'create'}
      initialItem={seededItem}
      initialDetail={mode === 'edit' ? (detailQuery.data ?? null) : null}
      mode={mode}
      onBack={onBack}
      onSaveSuccess={onSaveSuccess}
      menuContext={menuContext}
    />
  );
}

const OPERATIONAL_TAG_COUNT = 2;

function CreateMenuItemForm({
  initialItem = null,
  initialDetail = null,
  mode = 'create',
  onBack,
  onSaveSuccess,
  menuContext,
}: Readonly<
  CreateMenuItemScreenProps & {
    initialDetail?: MenuItemResponse | null;
    menuContext: ReturnType<typeof useMenuCreation> | null;
  }
>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toastFeedback, setToastFeedback] = useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const footerTarget = useAppShellFooterTarget();

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else if (menuContext) {
      menuContext.backToList();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleSaveItem = async (values: CreateMenuItemSubmitValues) => {
    try {
      if (mode === 'edit' && initialItem && menuContext) {
        await menuContext.updateItem(initialItem.id, values);
        onSaveSuccess?.();
        return;
      }

      if (menuContext) {
        await menuContext.addItem(values);
        onSaveSuccess?.();
        return;
      }

      if (mode === 'create') {
        throw new ApiError('Open Menu Creation from the sidebar to save new items.', 400);
      }
    } catch (error) {
      setToastFeedback({
        open: true,
        message: getErrorMessage(error),
        severity: 'error',
      });
    }
  };

  const gstRatesQuery = useGstRates({ active_only: true, page_size: 100 });
  const itemTagsQuery = useMenuItemTags({ status: 'active', page_size: 100 });
  const account = useSidebarStore((state) => state.account);
  const sidebarContext = useSidebarStore((state) => state.context);
  const tagCreateBranchId = useMemo(() => {
    if (menuContext?.pageConfig.scope !== 'branch') return undefined;
    const raw = sidebarContext.branchId ?? account?.branch_id;
    if (raw == null) return undefined;
    const id = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  }, [account?.branch_id, menuContext?.pageConfig.scope, sidebarContext.branchId]);

  const formHook = useCreateMenuItem({
    mode,
    initialItem,
    initialDetail,
    defaultCategoryId: mode === 'create' ? (menuContext?.activeCategoryId ?? undefined) : undefined,
    apiTagDefinitions: itemTagsQuery.data?.items,
    onSave: handleSaveItem,
    onBack: handleBackNavigation,
  });

  const existingRemoteImageUrl = useMemo(() => {
    if (mode !== 'edit') return undefined;
    const primary =
      initialDetail?.images.find((image) => image.is_primary) ?? initialDetail?.images[0];
    const candidate = primary?.url ?? initialItem?.imageUrl;
    return isPreviewImageSrc(candidate) ? candidate.trim() : undefined;
  }, [initialDetail, initialItem?.imageUrl, mode]);

  const primaryPreviewSrc = formHook.images[0] ?? existingRemoteImageUrl;
  const [failedPreviewSrc, setFailedPreviewSrc] = useState<string | null>(null);
  const showPrimaryPreview = Boolean(primaryPreviewSrc) && failedPreviewSrc !== primaryPreviewSrc;

  const { setUploadError } = formHook;
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (shouldSimulateMenuItemUploadError()) {
      setUploadError({
        fileName: 'high-res-hero-banner.png',
        fileSizeMb: 14.2,
        message: '"high-res-hero-banner.png" (14.2 MB) exceeds the maximum 10MB limit.',
      });
    }
  }, [setUploadError]);

  // Available categories from context or fallback mocks
  const gstRateOptions = (gstRatesQuery.data?.items ?? []).map((rate) => ({
    id: String(rate.id),
    label: `${rate.total_rate}% — ${rate.name}`,
  }));

  const categoryOptions = (
    menuContext?.categories ?? [
      { id: 'cat_starters', name: 'Starters' },
      { id: 'cat_mains', name: 'Main Course' },
      { id: 'cat_breads', name: 'Breads' },
      { id: 'cat_beverages', name: 'Beverages' },
      { id: 'cat_desserts', name: 'Desserts' },
    ]
  ).map((cat) => ({
    id: cat.id,
    label: cat.name,
  }));

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      formHook.handleImageUpload(e.target.files);
    }
  };

  const stickyFooterContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
        px: { xs: 2, sm: 3 },
        py: 1.5,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
      }}
    >
      <ActionButton
        variant="outlined"
        onClick={handleBackNavigation}
        disabled={formHook.isSubmitting}
        sx={{
          height: 40,
          px: 3,
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        Cancel
      </ActionButton>
      <ActionButton
        variant="primary"
        onClick={formHook.handleSubmit}
        disabled={!formHook.canSubmit}
        loading={
          formHook.isSubmitting ||
          Boolean(menuContext?.isCreatingItem) ||
          Boolean(menuContext?.isUpdatingItem)
        }
        sx={{
          height: 40,
          px: 3,
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        {mode === 'edit' ? 'Save Changes' : 'Save Item'}
      </ActionButton>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        pb: 8,
        gap: 2.5,
      }}
    >
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          {
            label: 'Home',
            href: menuContext?.pageConfig.homeHref ?? '/company/dashboard',
          },
          {
            label: 'Menu Creation',
            onClick: handleBackNavigation,
          },
          {
            label: mode === 'edit' ? 'Edit item' : 'Create Menu Item',
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

      {/* 2. Header */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <IconButton
          onClick={handleBackNavigation}
          aria-label="Back to menu creation"
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
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              letterSpacing: '-0.02em',
              color: 'text.primary',
              lineHeight: 1.25,
            }}
          >
            {mode === 'edit' ? 'Edit Menu Item' : 'Create Menu Item'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.875rem' }}
          >
            {mode === 'edit'
              ? `Update the details for ${initialItem?.name ?? 'Paneer Tikka'}.`
              : 'Fill in the details below to add a new item to your menu'}
          </Typography>
        </Box>
      </Stack>

      {/* 3. Configuration Card */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2.5,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem', mb: 2.5 }}>
          Configuration
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {/* Row 1: Category, Name, Online Display Name */}
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography
              component="label"
              htmlFor="item-category-select"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              Category
              <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
                *
              </Box>
            </Typography>
            <Select
              id="item-category-select"
              value={formHook.category}
              onChange={(e) => {
                formHook.setCategory(e.target.value);
                if (formHook.isFieldTouched('category')) {
                  formHook.validateField('category');
                }
              }}
              onClose={() => formHook.handleFieldBlur('category')}
              displayEmpty
              IconComponent={ChevronDown}
              sx={{
                width: '100%',
                height: 44,
                minHeight: 44,
                borderRadius: '10px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: formHook.fieldError('category') ? 'error.main' : 'divider',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: formHook.category ? 'text.primary' : 'text.secondary',
                transition: 'all 0.15s ease',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:focus-within, &.Mui-focused': {
                  borderColor: formHook.fieldError('category') ? 'error.main' : 'primary.main',
                  boxShadow: (theme) =>
                    formHook.fieldError('category')
                      ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
                      : `0 0 0 2px ${theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.35)' : 'rgba(51, 84, 244, 0.15)'}`,
                },
                '&:hover': {
                  borderColor: formHook.fieldError('category') ? 'error.main' : 'text.secondary',
                },
                '& .MuiSelect-select': {
                  py: 0,
                  px: 1.75,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  color: formHook.category ? 'text.primary' : 'text.secondary',
                },
                '& .MuiSelect-icon': {
                  right: 12,
                  color: 'text.secondary',
                  fontSize: 18,
                },
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      mt: 0.75,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      p: 0.5,
                      '& .MuiMenuItem-root': {
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        py: 1.25,
                        px: 1.5,
                        my: 0.25,
                        color: 'text.primary',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: alpha(colors.primary.default, 0.08),
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(colors.primary.default, 0.12),
                          color: 'primary.main',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: alpha(colors.primary.default, 0.16),
                          },
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="" disabled sx={{ color: 'text.secondary' }}>
                Select category
              </MenuItem>
              {categoryOptions.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
            <FieldHelperText message={formHook.fieldError('category')} reserveSpace />
          </Box>

          <Input
            id="item-name"
            label="Name"
            required
            placeholder="eg. Paneer Tikka"
            value={formHook.name}
            onChange={(e) => {
              formHook.setName(e.target.value);
              if (formHook.isFieldTouched('name')) formHook.validateField('name');
            }}
            onBlur={() => formHook.handleFieldBlur('name')}
            error={Boolean(formHook.fieldError('name'))}
            helperText={formHook.fieldError('name')}
            fullWidth
          />

          <Input
            id="item-online-display-name"
            label="Online Display Name"
            required
            placeholder="eg. Paneer Tikka Masala"
            value={formHook.onlineDisplayName}
            onChange={(e) => {
              formHook.setOnlineDisplayName(e.target.value);
              if (formHook.isFieldTouched('onlineDisplayName')) {
                formHook.validateField('onlineDisplayName');
              }
            }}
            onBlur={() => formHook.handleFieldBlur('onlineDisplayName')}
            error={Boolean(formHook.fieldError('onlineDisplayName'))}
            helperText={formHook.fieldError('onlineDisplayName')}
            fullWidth
          />

          {/* Row 2: Code, Item Base Price (₹) *, Profit Margin (%) */}
          <Input
            id="item-code"
            label="Code"
            required
            placeholder="eg. PNT"
            value={formHook.code}
            onChange={(e) => {
              formHook.setCode(e.target.value);
              if (formHook.isFieldTouched('code')) formHook.validateField('code');
            }}
            onBlur={() => formHook.handleFieldBlur('code')}
            error={Boolean(formHook.fieldError('code'))}
            helperText={formHook.fieldError('code')}
            fullWidth
          />

          <Input
            id="item-base-price"
            label="Item Base Price (₹)"
            required
            type="number"
            placeholder="0.00"
            value={formHook.itemPrice}
            onChange={(e) => {
              formHook.setItemPrice(e.target.value);
              if (formHook.isFieldTouched('itemPrice')) formHook.validateField('itemPrice');
            }}
            onBlur={() => formHook.handleFieldBlur('itemPrice')}
            error={Boolean(formHook.fieldError('itemPrice'))}
            helperText={formHook.fieldError('itemPrice')}
            fullWidth
          />

          <Input
            id="item-profit-margin"
            label="Profit Margin (%)"
            placeholder="20"
            value={formHook.profitMargin}
            onChange={(e) => formHook.setProfitMargin(e.target.value)}
            fullWidth
          />

          {/* Row 3: GST % */}
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography
              component="label"
              htmlFor="item-gst-select"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              GST rate
              <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
                *
              </Box>
            </Typography>
            <Select
              id="item-gst-select"
              value={formHook.gst}
              onChange={(e) => {
                formHook.setGst(e.target.value);
                if (formHook.isFieldTouched('gst')) formHook.validateField('gst');
              }}
              onClose={() => formHook.handleFieldBlur('gst')}
              displayEmpty
              disabled={gstRatesQuery.isLoading}
              IconComponent={ChevronDown}
              sx={{
                width: '100%',
                height: 44,
                minHeight: 44,
                borderRadius: '10px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: formHook.fieldError('gst') ? 'error.main' : 'divider',
                transition: 'all 0.15s ease',
                '&:focus-within, &.Mui-focused': {
                  borderColor: formHook.fieldError('gst') ? 'error.main' : 'primary.main',
                  boxShadow: (theme) =>
                    formHook.fieldError('gst')
                      ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
                      : `0 0 0 2px ${theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.35)' : 'rgba(51, 84, 244, 0.15)'}`,
                },
                '&:hover': {
                  borderColor: formHook.fieldError('gst') ? 'error.main' : 'text.secondary',
                },
                fontSize: '0.875rem',
                fontWeight: 500,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSelect-select': {
                  py: 0,
                  px: 1.75,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            >
              <MenuItem value="" disabled>
                {gstRatesQuery.isLoading ? 'Loading GST rates…' : 'Select GST rate'}
              </MenuItem>
              {gstRateOptions.map((rate) => (
                <MenuItem key={rate.id} value={rate.id}>
                  {rate.label}
                </MenuItem>
              ))}
            </Select>
            <FieldHelperText message={formHook.fieldError('gst')} reserveSpace />
          </Box>

          {/* Empty spacer for 3-column layout */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }} />
          <Box sx={{ display: { xs: 'none', md: 'block' } }} />

          {/* Row 4: Description (full span) */}
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
            <Input
              id="item-description"
              label="Description"
              placeholder="Enter item description here..."
              multiline
              rows={4}
              value={formHook.description}
              onChange={(e) => formHook.setDescription(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>

        {/* Dietary & Order Type (within Configuration card as in reference) */}
        <Box sx={{ mt: 3.5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
              Dietary & Order Type
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}
            >
              Dietary flags are shown on online platforms. Order types apply to offline POS billing.
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {/* Dietary Type */}
            <Box>
              <Typography
                sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 1 }}
              >
                Dietary Type
              </Typography>
              <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                {(['Veg', 'Non-Veg', 'Egg'] as DietaryType[]).map((type) => {
                  const isSelected = formHook.dietaryType === type;
                  return (
                    <Stack
                      key={type}
                      direction="row"
                      spacing={1}
                      onClick={() => formHook.setDietaryType(type)}
                      sx={{
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => formHook.setDietaryType(type)}
                        size="small"
                        sx={{ p: 0.5, '&.Mui-checked': { color: 'primary.main' } }}
                      />
                      <DietaryIcon type={type} size={18} />
                      <Typography
                        sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}
                      >
                        {type}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>

            {/* Order Type */}
            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Order Type
                <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
                  *
                </Box>
              </Typography>
              <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                {['Delivery', 'Take Away', 'Dine In'].map((type) => {
                  const isChecked = formHook.orderTypes.includes(type);
                  return (
                    <FormControlLabel
                      key={type}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={() => formHook.toggleOrderType(type)}
                          size="small"
                          sx={{ p: 0.5, '&.Mui-checked': { color: 'primary.main' } }}
                        />
                      }
                      label={
                        <Typography
                          sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}
                        >
                          {type}
                        </Typography>
                      }
                      sx={{ m: 0, mr: 2.5 }}
                    />
                  );
                })}
              </Stack>
              <FieldHelperText message={formHook.fieldError('orderTypes')} reserveSpace />
            </Box>

            {/* Expose This Item In */}
            <Box>
              <Typography
                sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 1 }}
              >
                Expose This Item In
              </Typography>
              <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                {['Captain App', 'Online order', 'Kiosk', 'Other'].map((channel) => {
                  const isChecked = formHook.exposedIn.includes(channel);
                  return (
                    <FormControlLabel
                      key={channel}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={() => formHook.toggleExposedIn(channel)}
                          size="small"
                          sx={{ p: 0.5, '&.Mui-checked': { color: 'primary.main' } }}
                        />
                      }
                      label={
                        <Typography
                          sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}
                        >
                          {channel}
                        </Typography>
                      }
                      sx={{ m: 0, mr: 2.5 }}
                    />
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* 4. Tags Information Card */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: alpha(colors.primary.default, 0.2),
          borderRadius: 2.5,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            bgcolor: alpha(colors.primary.default, 0.08),
            px: { xs: 2, sm: 3 },
            py: 1.25,
            borderBottom: '1px solid',
            borderColor: alpha(colors.primary.default, 0.15),
          }}
        >
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'primary.main' }}>
            Tags Information
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              justifyContent: 'space-between',
              alignItems: { sm: 'center' },
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                Tags
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}
              >
                Platform specific tags (e.g. spicy, vegan) and operational flags.
              </Typography>
            </Box>

            <ActionButton
              variant="outlined"
              size="small"
              startIcon={<Plus size={15} />}
              onClick={() => formHook.setIsCreateTagOpen(true)}
              sx={{
                alignSelf: { xs: 'flex-start', sm: 'center' },
                borderColor: alpha(colors.primary.default, 0.3),
                bgcolor: alpha(colors.primary.default, 0.06),
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.8125rem',
              }}
            >
              Create Tags
            </ActionButton>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              bgcolor: 'background.paper',
              borderColor: 'divider',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'primary.main' }}>
                Tags information
              </Typography>
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
                {formHook.availableTags.length} tags
              </Box>
            </Stack>

            {itemTagsQuery.isError ? (
              <AlertMessage
                variant="error"
                title="Unable to load tags"
                message={getErrorMessage(itemTagsQuery.error)}
              />
            ) : null}

            {itemTagsQuery.isLoading && formHook.availableTags.length <= OPERATIONAL_TAG_COUNT ? (
              <Loading fullPage={false} sx={{ minHeight: 120, py: 2 }} />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 1.5,
                }}
              >
                {formHook.availableTags.map((tag) => {
                  const isSelected = formHook.selectedTags.includes(tag);
                  return (
                    <Box
                      key={tag}
                      onClick={() => formHook.toggleTag(tag)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        p: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => formHook.toggleTag(tag)}
                        size="small"
                        sx={{ p: 0, '&.Mui-checked': { color: 'primary.main' } }}
                      />
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          userSelect: 'none',
                        }}
                      >
                        {tag}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* 5. Item Images Card */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2.5,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem', mb: 2 }}>
          Item Image
        </Typography>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          multiple
          style={{ display: 'none' }}
        />

        {formHook.uploadError ? (
          <Box
            sx={{
              border: '1.5px dashed',
              borderColor: '#EF4444',
              bgcolor: '#FEF2F2',
              borderRadius: 2.5,
              py: { xs: 4, sm: 5 },
              px: 3,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: '#FEE2E2',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                mb: 1.5,
              }}
            >
              <AlertTriangle size={22} />
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: '#991B1B',
                lineHeight: 1.3,
              }}
            >
              Upload failed
            </Typography>

            <Typography
              sx={{
                fontSize: '0.875rem',
                color: '#EF4444',
                mt: 0.5,
                maxWidth: 600,
              }}
            >
              {formHook.uploadError.message}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2.5,
              }}
            >
              <ActionButton
                variant="primary"
                startIcon={<RotateCw size={15} />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  bgcolor: '#DC2626',
                  '&:hover': {
                    bgcolor: '#B91C1C',
                  },
                  height: 38,
                  px: 2.5,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Try again
              </ActionButton>

              <Typography
                component="button"
                type="button"
                onClick={() => {
                  formHook.setUploadError(null);
                  fileInputRef.current?.click();
                }}
                sx={{
                  background: 'none',
                  border: 'none',
                  p: 0,
                  m: 0,
                  font: 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'text.secondary',
                  },
                }}
              >
                Choose another file
              </Typography>
            </Stack>
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Main / Active uploaded image */}
              <Box
                onClick={!showPrimaryPreview ? () => fileInputRef.current?.click() : undefined}
                sx={{
                  position: 'relative',
                  width: 84,
                  height: 84,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0,
                  bgcolor: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  ...(!showPrimaryPreview ? { cursor: 'pointer' } : {}),
                }}
              >
                {showPrimaryPreview && primaryPreviewSrc ? (
                  <Box
                    component="img"
                    src={primaryPreviewSrc}
                    alt="Item thumbnail"
                    onError={() => setFailedPreviewSrc(primaryPreviewSrc)}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <ImageIcon size={22} />
                )}
                {formHook.images.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      formHook.removeImage(0);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      p: 0.25,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' },
                    }}
                  >
                    <X size={12} />
                  </IconButton>
                )}
              </Box>

              {/* Placeholder slot 1 */}
              <Box
                sx={{
                  width: 84,
                  height: 84,
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  flexShrink: 0,
                }}
              >
                <ImageIcon size={22} />
              </Box>

              {/* Placeholder slot 2 */}
              <Box
                sx={{
                  width: 84,
                  height: 84,
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  flexShrink: 0,
                }}
              >
                <ImageIcon size={22} />
              </Box>

              {/* Add image slot */}
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: 84,
                  height: 84,
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  border: '1.5px dashed',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: alpha(colors.primary.default, 0.04),
                  },
                }}
              >
                <Plus size={22} />
              </Box>
            </Stack>

            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}
            >
              Allowed JPG, PNG. Max 10MB.
            </Typography>
          </>
        )}
      </Paper>

      {/* 6. Side-by-side Tables: Variants & Modifiers */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'stretch' }}>
        {/* Left: Variants */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
              Variants
            </Typography>
            <ActionButton
              variant="outlined"
              size="small"
              startIcon={<Plus size={15} />}
              onClick={() => {
                formHook.setEditingVariant(null);
                formHook.setIsAddVariantOpen(true);
              }}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'primary.main',
                borderColor: alpha(colors.primary.default, 0.3),
                bgcolor: alpha(colors.primary.default, 0.06),
              }}
            >
              Add Variants
            </ActionButton>
          </Stack>

          {/* Variants Table */}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Table Header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr',
                alignItems: 'center',
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
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  textAlign: 'right',
                }}
              >
                ACTIONS
              </Typography>
            </Box>

            {/* Table Rows */}
            {formHook.variants.length === 0 ? (
              <Box sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No variants added yet.
                </Typography>
              </Box>
            ) : (
              formHook.variants.map((v, index) => (
                <Box
                  key={v.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr',
                    alignItems: 'center',
                    px: 2,
                    py: 1.25,
                    borderBottom: index < formHook.variants.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                    {v.name}
                  </Typography>

                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                    ₹{v.price}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'flex-end', alignItems: 'center' }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        formHook.setEditingVariant(v);
                        formHook.setIsAddVariantOpen(true);
                      }}
                      aria-label={`Edit ${v.name} variant`}
                      sx={{
                        color: 'primary.main',
                        p: 0.5,
                        '&:hover': {
                          bgcolor: alpha(colors.primary.default, 0.08),
                        },
                      }}
                    >
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => formHook.removeVariant(v.id)}
                      aria-label={`Delete ${v.name} variant`}
                      sx={{
                        color: 'error.main',
                        p: 0.5,
                        '&:hover': {
                          bgcolor: alpha(colors.danger.default, 0.08),
                        },
                      }}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </Stack>
                </Box>
              ))
            )}
          </Box>
        </Paper>

        {/* Right: Modifiers */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
              Modifiers
            </Typography>
            <ActionButton
              variant="outlined"
              size="small"
              startIcon={<Plus size={15} />}
              onClick={() => {
                formHook.setEditingModifier(null);
                formHook.setIsAddModifierOpen(true);
              }}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'primary.main',
                borderColor: alpha(colors.primary.default, 0.3),
                bgcolor: alpha(colors.primary.default, 0.06),
              }}
            >
              Modifiers
            </ActionButton>
          </Stack>

          {/* Modifiers Table */}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Table Header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr',
                alignItems: 'center',
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
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  textAlign: 'right',
                }}
              >
                ACTIONS
              </Typography>
            </Box>

            {/* Table Rows */}
            {formHook.modifiers.length === 0 ? (
              <Box sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No modifiers added yet.
                </Typography>
              </Box>
            ) : (
              formHook.modifiers.map((mod, index) => (
                <Box
                  key={mod.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr',
                    alignItems: 'center',
                    px: 2,
                    py: 1.25,
                    borderBottom: index < formHook.modifiers.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                    {mod.name}
                  </Typography>

                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                    ₹{mod.price}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'flex-end', alignItems: 'center' }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        formHook.setEditingModifier(mod);
                        formHook.setIsAddModifierOpen(true);
                      }}
                      aria-label={`Edit ${mod.name} modifier`}
                      sx={{
                        color: 'primary.main',
                        p: 0.5,
                        '&:hover': {
                          bgcolor: alpha(colors.primary.default, 0.08),
                        },
                      }}
                    >
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => formHook.removeModifier(mod.id)}
                      aria-label={`Remove modifier ${mod.name}`}
                      sx={{
                        p: 0.5,
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: alpha(colors.danger.default, 0.08),
                        },
                      }}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </Stack>
                </Box>
              ))
            )}
          </Box>
        </Paper>
      </Stack>

      {/* 7. Action Footer */}
      {footerTarget ? (
        createPortal(stickyFooterContent, footerTarget)
      ) : (
        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, mt: 'auto' }}>
          {stickyFooterContent}
        </Box>
      )}

      {/* Unified Modals */}
      <ItemOptionModal
        key={formHook.editingVariant?.id ?? (formHook.isAddVariantOpen ? 'open-v' : 'closed-v')}
        open={formHook.isAddVariantOpen}
        type="variant"
        initialItem={formHook.editingVariant}
        onClose={() => {
          formHook.setIsAddVariantOpen(false);
          formHook.setEditingVariant(null);
        }}
        onAdd={formHook.addVariant}
        onUpdate={formHook.updateVariant}
      />

      <ItemOptionModal
        key={formHook.editingModifier?.id ?? (formHook.isAddModifierOpen ? 'open-m' : 'closed-m')}
        open={formHook.isAddModifierOpen}
        type="modifier"
        initialItem={formHook.editingModifier}
        onClose={() => {
          formHook.setIsAddModifierOpen(false);
          formHook.setEditingModifier(null);
        }}
        onAdd={formHook.addModifier}
        onUpdate={formHook.updateModifier}
      />

      <CreateTagModal
        open={formHook.isCreateTagOpen}
        onClose={() => formHook.setIsCreateTagOpen(false)}
        pageScope={menuContext?.pageConfig.scope ?? 'branch'}
        branchId={tagCreateBranchId}
        onCreateTag={formHook.addCustomTag}
      />

      {/* Toast Notification */}
      <Toast
        open={toastFeedback.open}
        message={toastFeedback.message}
        severity={toastFeedback.severity}
        onClose={() => setToastFeedback((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

interface ItemOptionModalProps {
  open: boolean;
  type: 'variant' | 'modifier';
  initialItem?: VariantItem | ModifierItem | null;
  onClose: () => void;
  onAdd: (item: ItemOptionFormPayload) => void;
  onUpdate?: (id: string, item: ItemOptionFormPayload) => void;
}

function ItemOptionModal({
  open,
  type,
  initialItem = null,
  onClose,
  onAdd,
  onUpdate,
}: Readonly<ItemOptionModalProps>) {
  const isVariant = type === 'variant';
  const [name, setName] = useState(initialItem?.name ?? '');
  const [price, setPrice] = useState(initialItem ? String(initialItem.price) : '');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    const trimmed = name.trim();
    const priceNum = parseFloat(price);
    if (!trimmed) {
      setError(`${isVariant ? 'Variant' : 'Modifier'} name is required`);
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Please enter a valid price');
      return;
    }

    const payload: ItemOptionFormPayload = { name: trimmed, price: priceNum };

    if (initialItem && onUpdate) {
      onUpdate(initialItem.id, payload);
    } else {
      onAdd(payload);
    }
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        isVariant
          ? initialItem
            ? 'Edit Item Variant'
            : 'Add Item Variant'
          : initialItem
            ? 'Edit Item Modifier'
            : 'Add Item Modifier'
      }
      subtitle={
        isVariant
          ? 'Define size or portion options for this menu item'
          : 'Add-on name and price; group rules are applied on the server'
      }
      width={460}
      height="auto"
      footer={
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', width: '100%' }}>
          <ActionButton variant="outlined" onClick={handleClose}>
            Cancel
          </ActionButton>
          <ActionButton variant="primary" onClick={handleConfirm}>
            {initialItem
              ? isVariant
                ? 'Save Variant'
                : 'Save Modifier'
              : isVariant
                ? 'Add Variant'
                : 'Add Modifier'}
          </ActionButton>
        </Stack>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Input
          label={isVariant ? 'Variant Name' : 'Modifier Name'}
          placeholder={isVariant ? 'e.g. Medium, Half, Large' : 'e.g. Extra Raita, Extra Gravy'}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          required
          autoFocus
        />
        <Input
          label="Price (₹)"
          placeholder={isVariant ? 'e.g. 249' : 'e.g. 40'}
          type="number"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            if (error) setError(null);
          }}
          error={Boolean(error)}
          helperText={error ?? undefined}
          required
        />
      </Box>
    </Modal>
  );
}

interface CreateTagModalProps {
  open: boolean;
  onClose: () => void;
  pageScope: MenuCataloguePageScope;
  branchId?: number;
  onCreateTag: (tag: { id: number; name: string }) => void;
}

function CreateTagModal({
  open,
  onClose,
  pageScope,
  branchId,
  onCreateTag,
}: Readonly<CreateTagModalProps>) {
  const createTag = useCreateMenuItemTag();
  const showToast = useToastStore((state) => state.show);
  const [tagName, setTagName] = useState('');
  const [tagCode, setTagCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    const trimmed = tagName.trim();
    if (!trimmed) {
      setError('Tag name is required');
      return;
    }

    try {
      const created = await createTag.mutateAsync({
        name: trimmed,
        code: tagCode.trim() || menuItemTagNameToCode(trimmed),
        pageScope,
        branchId,
      });
      onCreateTag({ id: created.id, name: created.name });
      showToast(`Tag "${created.name}" created successfully`, 'success');
      setTagName('');
      setTagCode('');
      setError(null);
      onClose();
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  };

  const handleClose = () => {
    setTagName('');
    setTagCode('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Custom Tag"
      subtitle="Add operational, dietary, or marketing flags for menu items"
      width={440}
      height="auto"
      footer={
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', width: '100%' }}>
          <ActionButton variant="outlined" onClick={handleClose} disabled={createTag.isPending}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={() => void handleConfirm()}
            loading={createTag.isPending}
          >
            Create Tag
          </ActionButton>
        </Stack>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Input
          label="Tag Name"
          placeholder="e.g. gluten-free, bestseller, sugar-free"
          value={tagName}
          onChange={(e) => {
            setTagName(e.target.value);
            if (error) setError(null);
          }}
          required
          autoFocus
        />
        <Input
          label="Tag Code"
          placeholder="Auto-generated from name if empty"
          value={tagCode}
          onChange={(e) => {
            setTagCode(e.target.value);
            if (error) setError(null);
          }}
          error={Boolean(error)}
          helperText={error ?? undefined}
        />
      </Box>
    </Modal>
  );
}
