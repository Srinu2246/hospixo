'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useMenu } from '../../context/menu-context';
import { getPrimaryMenuItemImageUrl } from '../../api/menu-item-images-map';
import { isPersistedMenuItemId } from '../../lib/menu-item-id';
import { hasLoadedMenuItemMedia, resolveMenuItemImages } from '../../lib/menu-item-media';
import { formatModifierGroupLabel } from '@/features/modifier-groups/api/modifier-groups';
import { StatusToggleButton } from '../status-toggle/status-toggle';
import type { ExposeChannel, OrderType } from '../../types/menu';

const allOrderTypes: OrderType[] = ['Delivery', 'Take Away', 'Dine In'];
const allExposeChannels: ExposeChannel[] = ['Captain App', 'Online order', 'Kiosk', 'Other'];

export function ViewItemDetail() {
  const {
    pageConfig,
    items,
    selectedItem: selectedItemFromContext,
    preparationStations = [],
    modifierGroups = [],
    tagDefinitions,
    backToList,
    openEditItemPage,
    openDeleteModal,
    loadMenuItemVariants,
    loadMenuItemImages,
    activateMenuItemVariant,
    deactivateMenuItemVariant,
    activateMenuItemImage,
    deactivateMenuItemImage,
    activateMenuItemByItemId,
    deactivateMenuItemByItemId,
  } = useMenu();

  const resolvedItem =
    selectedItemFromContext == null
      ? null
      : (items.find((entry) => entry.id === selectedItemFromContext.id) ?? selectedItemFromContext);

  const loadedItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!resolvedItem) return;
    if (loadedItemIdRef.current === resolvedItem.id) return;
    loadedItemIdRef.current = resolvedItem.id;

    if (
      pageConfig?.scope === 'company' &&
      isPersistedMenuItemId(resolvedItem.id) &&
      !hasLoadedMenuItemMedia(resolvedItem)
    ) {
      if (!Array.isArray(resolvedItem.images)) {
        void loadMenuItemImages(resolvedItem.id);
      }
      if (!Array.isArray(resolvedItem.variants)) {
        void loadMenuItemVariants(resolvedItem.id);
      }
    }
  }, [resolvedItem, pageConfig?.scope, loadMenuItemImages, loadMenuItemVariants]);

  const variants = resolvedItem?.variants ?? [];
  const images = resolvedItem ? resolveMenuItemImages(resolvedItem) : [];
  const imagesLoading = false;
  const [variantActionId, setVariantActionId] = useState<string | null>(null);
  const [imageActionId, setImageActionId] = useState<string | null>(null);
  const [itemStatusBusy, setItemStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  async function handleActivateVariant(variantId: string) {
    if (!resolvedItem) return;

    setStatusError(null);
    setVariantActionId(variantId);
    const result = await activateMenuItemVariant(resolvedItem.id, variantId);
    setVariantActionId(null);

    if (!result.ok) {
      setStatusError(result.message ?? 'Failed to activate variant.');
    }
  }

  async function handleDeactivateVariant(variantId: string) {
    if (!resolvedItem) return;

    setStatusError(null);
    setVariantActionId(variantId);
    const result = await deactivateMenuItemVariant(resolvedItem.id, variantId);
    setVariantActionId(null);

    if (!result.ok) {
      setStatusError(result.message ?? 'Failed to deactivate variant.');
    }
  }

  async function handleActivateImage(imageId: string) {
    if (!resolvedItem) return;

    setStatusError(null);
    setImageActionId(imageId);
    const result = await activateMenuItemImage(resolvedItem.id, imageId);
    setImageActionId(null);

    if (!result.ok) {
      setStatusError(result.message ?? 'Failed to activate image.');
    }
  }

  async function handleDeactivateImage(imageId: string) {
    if (!resolvedItem) return;

    setStatusError(null);
    setImageActionId(imageId);
    const result = await deactivateMenuItemImage(resolvedItem.id, imageId);
    setImageActionId(null);

    if (!result.ok) {
      setStatusError(result.message ?? 'Failed to deactivate image.');
    }
  }

  async function handleToggleItemStatus() {
    if (!resolvedItem) return;

    setStatusError(null);
    setItemStatusBusy(true);
    const isHidden = resolvedItem.status === 'Hidden';
    const result = await (isHidden
      ? activateMenuItemByItemId(resolvedItem.id)
      : deactivateMenuItemByItemId(resolvedItem.id));
    setItemStatusBusy(false);
    if (!result.ok) {
      setStatusError(result.message ?? 'Failed to update item status.');
    }
  }

  if (!resolvedItem) return null;

  const selectedItem = resolvedItem;

  const defaultModifiers = [
    { id: 'm1', name: 'Extra Roti', price: 10 },
    { id: 'm2', name: 'Extra Gravy', price: 50 },
    { id: 'm3', name: 'Egg', price: 20 },
  ];

  const itemVariants = variants;
  const itemModifiers = selectedItem.modifiers?.length ? selectedItem.modifiers : defaultModifiers;
  const itemImages = images;
  const primaryImageUrl = getPrimaryMenuItemImageUrl(itemImages) ?? selectedItem.image;
  const safePreparationStations = preparationStations ?? [];
  const safeModifierGroups = modifierGroups ?? [];

  const assignedPreparationStations = (selectedItem.preparationStations ?? [])
    .slice()
    .sort((left, right) => left.defaultOrder - right.defaultOrder)
    .map((assignment: { stationId: string; defaultOrder: number }) => {
      const station = safePreparationStations.find((entry) => entry.id === assignment.stationId);
      return {
        ...assignment,
        label: station ? `${station.name} (${station.code})` : assignment.stationId,
      };
    });

  const assignedModifierGroups = (selectedItem.modifierGroups ?? [])
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((assignment: { groupId: string; displayOrder: number }) => {
      const group = safeModifierGroups.find((entry) => entry.id === assignment.groupId);
      return {
        ...assignment,
        label: group ? formatModifierGroupLabel(group) : assignment.groupId,
      };
    });

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      {/* Sticky Breadcrumb Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: { xs: -16, md: -24 },
          zIndex: 10,
          mx: { xs: -2, md: -3 },
          mt: { xs: -2, md: -3 },
          mb: 2.5,
          px: { xs: 2, md: 3 },
          py: 1.25,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
          sx={{ fontSize: '0.8125rem' }}
        >
          <Link
            component="button"
            type="button"
            onClick={backToList}
            underline="hover"
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Home
          </Link>
          <Link
            component="button"
            type="button"
            onClick={backToList}
            underline="hover"
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Menu Creation
          </Link>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            View Item
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <IconButton onClick={backToList} size="small" aria-label="Back to items list">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {selectedItem.name}
          </Typography>
          <Chip label={selectedItem.categoryName} size="small" variant="outlined" />
          <Chip
            label={selectedItem.status === 'Hidden' ? 'Hidden' : 'Available'}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor:
                selectedItem.status === 'Hidden' ? 'action.focus' : 'rgba(46, 125, 50, 0.08)',
              color: selectedItem.status === 'Hidden' ? 'text.secondary' : 'success.main',
            }}
          />
          <Chip
            label={selectedItem.dietary === 'Veg' ? '● Veg' : '● Non-Veg'}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor:
                selectedItem.dietary === 'Veg'
                  ? 'rgba(46, 125, 50, 0.08)'
                  : 'rgba(211, 47, 47, 0.08)',
              color: selectedItem.dietary === 'Veg' ? 'success.main' : 'error.main',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusToggleButton
            isActive={selectedItem.status !== 'Hidden'}
            disabled={itemStatusBusy}
            resourceLabel={selectedItem.name}
            onClick={() => void handleToggleItemStatus()}
          />
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlinedIcon />}
            onClick={() => openDeleteModal(selectedItem)}
          >
            Delete Item
          </Button>
          <Button
            variant="contained"
            startIcon={<EditOutlinedIcon />}
            onClick={() => openEditItemPage(selectedItem)}
          >
            Edit Item
          </Button>
        </Box>
      </Box>

      {statusError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {statusError}
        </Alert>
      )}

      {/* Card 1: Basic Details */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Basic Details
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2.5,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedItem.categoryName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedItem.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Online Display Name
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedItem.onlineDisplayName || selectedItem.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Item Code / SKU
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedItem.code || 'PNT'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Base Price
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ₹{selectedItem.basePrice}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Profit Margin
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedItem.profitMargin || '10%'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              GST Tax Rate
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedItem.gst || '5%'} (Services)
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Card 2: Description & Image */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Description & Media
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {selectedItem.description ||
            'Soft cottage cheese cubes marinated in aromatic spices and grilled in a tandoor. Served with mint chutney and fresh onion rings.'}
        </Typography>

        {(() => {
          if (imagesLoading) {
            return (
              <Typography variant="body2" color="text.secondary">
                Loading images…
              </Typography>
            );
          }
          if (itemImages.length > 0) {
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {itemImages.map((image) => (
                  <Box
                    key={image.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      width: 160,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.previewUrl ?? image.url}
                      alt={selectedItem.name}
                      style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6 }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                      }}
                    >
                      {image.isPrimary && (
                        <Chip
                          label="Primary"
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      <Chip
                        label={image.status ?? 'Active'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor:
                            image.status === 'Inactive'
                              ? 'action.focus'
                              : 'rgba(46, 125, 50, 0.08)',
                          color: image.status === 'Inactive' ? 'text.secondary' : 'success.main',
                        }}
                      />
                      {pageConfig?.scope === 'company' && (
                        <StatusToggleButton
                          isActive={image.status !== 'Inactive'}
                          disabled={imageActionId === image.id}
                          resourceLabel="image"
                          onClick={() =>
                            void (image.status === 'Inactive'
                              ? handleActivateImage(image.id)
                              : handleDeactivateImage(image.id))
                          }
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            );
          }
          if (primaryImageUrl) {
            return (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={primaryImageUrl}
                alt={selectedItem.name}
                style={{ maxWidth: 300, maxHeight: 180, objectFit: 'cover', borderRadius: 6 }}
              />
            );
          }
          return null;
        })()}
      </Paper>

      {/* Card 3: Dietary & Order Type */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Dietary & Order Type
        </Typography>
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Dietary Type
            </Typography>
            <Chip
              label={selectedItem.dietary === 'Veg' ? '● Veg' : '● Non-Veg'}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor:
                  selectedItem.dietary === 'Veg'
                    ? 'rgba(46, 125, 50, 0.08)'
                    : 'rgba(211, 47, 47, 0.08)',
                color: selectedItem.dietary === 'Veg' ? 'success.main' : 'error.main',
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Order Types
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {allOrderTypes.map((type) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={selectedItem.orderTypes?.includes(type) ?? false}
                      disabled
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{type}</Typography>}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Expose In
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {allExposeChannels.map((channel) => (
                <FormControlLabel
                  key={channel}
                  control={
                    <Checkbox
                      checked={selectedItem.exposeIn?.includes(channel) ?? false}
                      disabled
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{channel}</Typography>}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Card 4: Tags */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {(selectedItem.tags?.length
            ? selectedItem.tags
            : (selectedItem.tagIds ?? []).map(
                (id) => tagDefinitions.find((tag) => tag.id === id)?.name ?? id,
              )
          ).map((tagName) => (
            <Chip key={tagName} label={tagName} size="small" variant="outlined" />
          ))}
          {!selectedItem.tags?.length && !selectedItem.tagIds?.length && (
            <Typography variant="body2" color="text.secondary">
              No tags assigned
            </Typography>
          )}
        </Box>
      </Paper>

      {pageConfig?.scope === 'company' && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            Preparation Stations
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {assignedPreparationStations.length > 0 ? (
              assignedPreparationStations.map((station) => (
                <Chip
                  key={station.stationId}
                  label={`${station.label} · #${station.defaultOrder}`}
                  size="small"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No preparation stations assigned
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {pageConfig?.scope === 'company' && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            Modifier Groups
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {assignedModifierGroups.length > 0 ? (
              assignedModifierGroups.map((group) => (
                <Chip
                  key={group.groupId}
                  label={`${group.label} · #${group.displayOrder}`}
                  size="small"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No modifier groups assigned
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {/* Two Column Grid for Variants & Modifiers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {/* Quantity / Size Options */}
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Quantity / Size Options
          </Typography>
          {itemVariants.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No variants configured for this item.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemVariants.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.size}</TableCell>
                      <TableCell>₹{v.price}</TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 1,
                          }}
                        >
                          <Chip
                            label={v.status ?? 'Active'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor:
                                v.status === 'Inactive'
                                  ? 'action.focus'
                                  : 'rgba(46, 125, 50, 0.08)',
                              color: v.status === 'Inactive' ? 'text.secondary' : 'success.main',
                            }}
                          />
                          {pageConfig?.scope === 'company' && (
                            <StatusToggleButton
                              isActive={v.status !== 'Inactive'}
                              disabled={variantActionId === v.id}
                              resourceLabel={v.size}
                              onClick={() =>
                                void (v.status === 'Inactive'
                                  ? handleActivateVariant(v.id)
                                  : handleDeactivateVariant(v.id))
                              }
                            />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Add-Ons */}
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            {pageConfig?.scope === 'company' ? 'Legacy Add-Ons' : 'Add-Ons'}
          </Typography>
          {pageConfig?.scope === 'company' ? (
            <Typography variant="body2" color="text.secondary">
              Add-on pricing is managed through modifier groups and their options.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Add-On</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Price
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemModifiers.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell align="right">₹{m.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
