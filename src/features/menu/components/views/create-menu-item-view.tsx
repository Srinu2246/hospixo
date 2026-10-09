'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { BranchScopeSelector } from '../shared/branch-scope-selector';
import { usesPersistedMenuItemApi, type MenuScopeSelection } from '../../lib/menu-scope';
import { useMenu } from '../../context/menu-context';
import { MenuItemTagsSkeleton } from '../skeleton/menu-item-tags-skeleton';
import { getPrimaryMenuItemImageUrl } from '../../api/menu-item-images-map';
import { isPersistedMenuItemId } from '../../lib/menu-item-id';
import { hasLoadedMenuItemMedia, resolveMenuItemImages } from '../../lib/menu-item-media';
import { isPersistedMenuItemImageId } from '../../lib/menu-item-image-id';
import { isPersistedMenuItemVariantId } from '../../lib/menu-item-variant-id';
import { createBranchTagDefinitions } from '../../config/mock-menu';
import type {
  DietaryType,
  ExposeChannel,
  ItemImage,
  ItemModifier,
  ItemVariant,
  MenuItemModifierGroup,
  MenuItemPreparationStation,
  MenuItemTag,
  MenuItemStatus,
  OrderType,
} from '../../types/menu';
import { CreateTagsModal } from '../modals/create-tags-modal';
import { AddVariantModal } from '../modals/add-variant-modal';
import { AddModifierModal } from '../modals/add-modifier-modal';
import { fetchGstRates } from '@/lib/gst-cache';
import { formatGstRateLabel, resolveGstDisplayValue } from '@/features/gst-rates/api/gst-rates';
import type { GstRate } from '@/features/gst-rates/types/gst-rate';
import { formatModifierGroupLabel } from '@/features/modifier-groups/api/modifier-groups';
import { StatusToggleButton } from '../status-toggle/status-toggle';
import { getMenuItemFormValidationErrors } from '../../lib/menu-item-form-validation';

const dietaryOptions: {
  type: DietaryType;
  label: string;
  paletteColor: 'success' | 'error' | 'warning';
}[] = [
  { type: 'Veg', label: 'Veg', paletteColor: 'success' },
  { type: 'Non-Veg', label: 'Non-Veg', paletteColor: 'error' },
  { type: 'Egg', label: 'Egg', paletteColor: 'warning' },
  { type: 'Vegan', label: 'Vegan', paletteColor: 'success' },
];

const orderTypeOptions: OrderType[] = ['Delivery', 'Take Away', 'Dine In'];
const exposeChannelOptions: ExposeChannel[] = ['Captain App', 'Online order', 'Kiosk', 'Other'];

function resolveInitialGstRate(
  ratesList: readonly GstRate[],
  editingGst?: string,
): { rateId: string; gst: string } | null {
  if (ratesList.length === 0 || !editingGst) return null;
  const cleanGst = editingGst.replace('%', '').trim();
  const match = ratesList.find(
    (rate) => resolveGstDisplayValue(rate).replace('%', '').trim() === cleanGst,
  );
  if (match) {
    return { rateId: match.id, gst: resolveGstDisplayValue(match) };
  }
  return null;
}

function validateImageFile(
  file: File,
  currentTotal: number,
): { valid: boolean; error?: string; uploadError?: { fileName: string; fileSizeMb: string } } {
  if (currentTotal >= 3) {
    return { valid: false, error: 'You can upload up to 3 images.' };
  }
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    const mbSize = (file.size / (1024 * 1024)).toFixed(1);
    return { valid: false, uploadError: { fileName: file.name, fileSizeMb: mbSize } };
  }
  return { valid: true };
}

function buildSubmitItemPayload(params: {
  effectiveCategoryId: string;
  scope?: 'company' | 'branch';
  assignBranchId: string | null;
  name: string;
  onlineDisplayName: string;
  submitCode: string;
  basePrice: string;
  profitMargin: string;
  gst: string;
  gstRateId?: string;
  description: string;
  dietary: DietaryType;
  orderTypes: OrderType[];
  exposeIn: ExposeChannel[];
  selectedTagIds: string[];
  selectedTags: string[];
  selectedPreparationStations: MenuItemPreparationStation[];
  selectedModifierGroups: MenuItemModifierGroup[];
  modifiers: ItemModifier[];
  images: ItemImage[];
  isCompanyScope: boolean;
}) {
  return {
    categoryId: params.effectiveCategoryId,
    scope: (params.isCompanyScope ? params.scope : 'branch') as 'company' | 'branch' | undefined,
    assignBranchId:
      params.isCompanyScope && params.scope === 'branch' ? params.assignBranchId : null,
    name: params.name.trim(),
    onlineDisplayName: params.onlineDisplayName.trim() || params.name.trim(),
    code: params.submitCode,
    basePrice: Number(params.basePrice),
    profitMargin: params.profitMargin,
    gst: params.gst,
    gstRateId: params.isCompanyScope ? params.gstRateId : undefined,
    description: params.description.trim() || undefined,
    dietary: params.dietary,
    orderTypes: params.orderTypes,
    exposeIn: params.exposeIn,
    tagIds: params.selectedTagIds,
    tags: params.selectedTags,
    preparationStations: params.selectedPreparationStations,
    modifierGroups: params.isCompanyScope ? params.selectedModifierGroups : undefined,
    modifiers: params.isCompanyScope ? undefined : params.modifiers,
    image: getPrimaryMenuItemImageUrl(params.images),
    images: params.images,
  };
}

export function CreateMenuItemView() {
  const {
    pageConfig,
    categories,
    activeCategoryId,
    editingItem,
    addMenuItem,
    updateMenuItem,
    backToList,
    loadMenuItemVariants,
    createMenuItemVariant,
    updateMenuItemVariant,
    activateMenuItemVariant,
    deactivateMenuItemVariant,
    loadMenuItemImages,
    uploadMenuItemImage,
    setPrimaryMenuItemImage,
    activateMenuItemImage,
    deactivateMenuItemImage,
    activateMenuItemByItemId,
    deactivateMenuItemByItemId,
    tagDefinitions,
    tagsLoading,
    tagsError,
    preparationStations = [],
    modifierGroups = [],
    catalogsLoading,
    createMenuItemTag,
    updateMenuItemTag,
  } = useMenu();

  const safePreparationStations = preparationStations ?? [];
  const safeModifierGroups = modifierGroups ?? [];

  const prepStationsLoading = catalogsLoading;
  const modifierGroupsLoading = catalogsLoading;

  // Form State
  const [categoryId, setCategoryId] = useState(
    () => editingItem?.categoryId ?? activeCategoryId ?? categories[0]?.id ?? '',
  );
  const [name, setName] = useState(() => editingItem?.name ?? '');
  const [onlineDisplayName, setOnlineDisplayName] = useState(
    () => editingItem?.onlineDisplayName ?? editingItem?.name ?? '',
  );
  const [code, setCode] = useState(() => editingItem?.code ?? '');
  const [basePrice, setBasePrice] = useState(() =>
    editingItem ? String(editingItem.basePrice) : '',
  );
  const [profitMargin, setProfitMargin] = useState(() => editingItem?.profitMargin ?? '10%');
  const [gst, setGst] = useState(() => editingItem?.gst ?? '');
  const [gstRateId, setGstRateId] = useState('');
  const [gstRates, setGstRates] = useState<readonly GstRate[]>([]);
  const [selectedPreparationStations, setSelectedPreparationStations] = useState<
    MenuItemPreparationStation[]
  >(() => editingItem?.preparationStations ?? []);
  const [selectedModifierGroups, setSelectedModifierGroups] = useState<MenuItemModifierGroup[]>(
    () => editingItem?.modifierGroups ?? [],
  );
  const [description, setDescription] = useState(() => editingItem?.description ?? '');
  const [scopeSelection, setScopeSelection] = useState<MenuScopeSelection>(() => ({
    scope: editingItem?.scope ?? 'company',
    assignBranchId: editingItem?.assignBranchId ?? null,
  }));

  const [dietary, setDietary] = useState<DietaryType>(() => editingItem?.dietary ?? 'Veg');
  const [orderTypes, setOrderTypes] = useState<OrderType[]>(
    () => editingItem?.orderTypes ?? ['Delivery', 'Take Away', 'Dine In'],
  );
  const [exposeIn, setExposeIn] = useState<ExposeChannel[]>(
    () => editingItem?.exposeIn ?? ['Captain App'],
  );
  const [localTagDefinitions, setLocalTagDefinitions] = useState<MenuItemTag[]>(
    pageConfig?.scope === 'company' ? [] : createBranchTagDefinitions(),
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => editingItem?.tagIds ?? []);

  // Modals state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<MenuItemTag | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ItemVariant | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);

  // Images state
  const [images, setImages] = useState<ItemImage[]>(() =>
    editingItem ? resolveMenuItemImages(editingItem) : [],
  );
  const [pendingImageFiles, setPendingImageFiles] = useState<Record<string, File>>({});
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [imageActionId, setImageActionId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<{
    fileName: string;
    fileSizeMb: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [variants, setVariants] = useState<ItemVariant[]>(() => editingItem?.variants ?? []);
  const [variantsError, setVariantsError] = useState<string | null>(null);
  const [variantActionId, setVariantActionId] = useState<string | null>(null);
  const [itemStatus, setItemStatus] = useState<MenuItemStatus>(
    () => editingItem?.status ?? 'Available',
  );
  const [itemStatusBusy, setItemStatusBusy] = useState(false);

  const [modifiers, setModifiers] = useState<ItemModifier[]>(() => editingItem?.modifiers ?? []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = useMemo(() => {
    const merged = pageConfig?.scope === 'company' ? tagDefinitions : localTagDefinitions;
    return merged.filter((tag) => tag.status !== 'Inactive');
  }, [localTagDefinitions, pageConfig?.scope, tagDefinitions]);

  const requiresScopeSelection = pageConfig?.scope === 'company' && !editingItem;

  const effectiveCategoryId =
    categoryId || (editingItem?.categoryId ?? activeCategoryId ?? categories[0]?.id ?? '');

  const availableGstOptions = useMemo(() => {
    return [...gstRates]
      .map((rate) => {
        const val = resolveGstDisplayValue(rate);
        return {
          id: rate.id,
          value: val,
          label: formatGstRateLabel(rate),
        };
      })
      .sort((a, b) => {
        const numA = Number.parseFloat(a.value) || 0;
        const numB = Number.parseFloat(b.value) || 0;
        return numA - numB;
      });
  }, [gstRates]);

  useEffect(() => {
    if (!usesPersistedMenuItemApi(pageConfig?.scope)) return;

    let cancelled = false;

    void fetchGstRates({ activeOnly: true })
      .then((data) => {
        if (cancelled) return;
        const ratesList = Array.isArray(data) ? [...data] : [];
        setGstRates(ratesList);
        if (ratesList.length === 0) return;

        const match = resolveInitialGstRate(ratesList, editingItem?.gst);
        if (match) {
          setGstRateId(match.rateId);
          setGst(match.gst);
          return;
        }

        if (!editingItem) {
          setGstRateId((prev) => {
            if (!prev.trim()) {
              const first = ratesList[0]!;
              setGst(resolveGstDisplayValue(first));
              return first.id;
            }
            return prev;
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGstRates([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editingItem, pageConfig?.scope]);

  // Load media if editing an existing item
  useEffect(() => {
    if (
      !editingItem ||
      !usesPersistedMenuItemApi(pageConfig?.scope) ||
      !isPersistedMenuItemId(editingItem.id) ||
      hasLoadedMenuItemMedia(editingItem)
    ) {
      return;
    }

    const targetItemId = editingItem.id;
    if (!Array.isArray(editingItem.images)) {
      void loadMenuItemImages(targetItemId).then((result) => {
        if (result.ok && result.data && result.data.length > 0) {
          setImages((prev) => (prev.length === 0 ? result.data! : prev));
        }
      });
    }

    if (!Array.isArray(editingItem.variants)) {
      void loadMenuItemVariants(targetItemId).then((result) => {
        if (result.ok && result.data) {
          setVariants(result.data);
        }
      });
    }
  }, [editingItem, loadMenuItemImages, loadMenuItemVariants, pageConfig?.scope]);

  function toggleOrderType(t: OrderType) {
    setOrderTypes((prev) => (prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]));
  }

  function toggleExpose(c: ExposeChannel) {
    setExposeIn((prev) => (prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]));
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  function togglePreparationStation(stationId: string) {
    setSelectedPreparationStations((prev) => {
      if (prev.some((station) => station.stationId === stationId)) {
        return prev
          .filter((station) => station.stationId !== stationId)
          .map((station, index) => ({ ...station, defaultOrder: index + 1 }));
      }
      return [...prev, { stationId, defaultOrder: prev.length + 1 }];
    });
  }

  function toggleModifierGroup(groupId: string) {
    setSelectedModifierGroups((prev) => {
      if (prev.some((group) => group.groupId === groupId)) {
        return prev
          .filter((group) => group.groupId !== groupId)
          .map((group, index) => ({ ...group, displayOrder: index + 1 }));
      }
      return [...prev, { groupId, displayOrder: prev.length + 1 }];
    });
  }

  async function handleCreateTag(input: { name: string; code: string }) {
    const result = await createMenuItemTag(input);
    if (!result.ok || !result.data) {
      return { ok: false, message: result.message ?? 'Failed to create tag.' };
    }

    if (pageConfig?.scope !== 'company') {
      setLocalTagDefinitions((prev) => [...prev, result.data!]);
    }

    setSelectedTagIds((prev) =>
      prev.includes(result.data!.id) ? prev : [...prev, result.data!.id],
    );
    return { ok: true };
  }

  async function handleUpdateTag(
    tagId: string,
    input: { name: string; code: string } & Partial<Pick<MenuItemTag, 'status'>>,
  ) {
    const result = await updateMenuItemTag(tagId, input);
    if (!result.ok) {
      return { ok: false, message: result.message ?? 'Failed to update tag.' };
    }

    if (pageConfig?.scope !== 'company' && result.data) {
      setLocalTagDefinitions((prev) => prev.map((tag) => (tag.id === tagId ? result.data! : tag)));
    }

    if (result.data?.status === 'Inactive') {
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
    }

    return { ok: true };
  }

  function openCreateTagModal() {
    setEditingTag(null);
    setIsTagModalOpen(true);
  }

  function openEditTagModal(tag: MenuItemTag) {
    setEditingTag(tag);
    setIsTagModalOpen(true);
  }

  function closeTagModal() {
    setIsTagModalOpen(false);
    setEditingTag(null);
  }

  async function handleAddVariant(sizeName: string, priceNum: number) {
    setVariantsError(null);

    if (editingItem && isPersistedMenuItemId(editingItem.id)) {
      const result = await createMenuItemVariant(
        editingItem.id,
        { size: sizeName, price: priceNum },
        variants.length,
      );
      if (!result.ok || !result.data) {
        const message = result.message ?? 'Failed to add variant.';
        setVariantsError(message);
        throw new Error(message);
      }
      setVariants((prev) => [...prev, result.data!]);
      return;
    }

    setVariants((prev) => [
      ...prev,
      { id: `v_${Date.now()}`, size: sizeName, price: priceNum, status: 'Active' },
    ]);
  }

  async function removeVariantRow(id: string) {
    setVariantsError(null);
    setVariantActionId(id);

    if (editingItem && isPersistedMenuItemId(editingItem.id) && isPersistedMenuItemVariantId(id)) {
      const result = await deactivateMenuItemVariant(editingItem.id, id);
      setVariantActionId(null);
      if (!result.ok) {
        setVariantsError(result.message ?? 'Failed to remove variant.');
        return;
      }
      setVariants((prev) => prev.filter((v) => v.id !== id));
      return;
    }

    setVariantActionId(null);
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  async function handleUpdateVariant(variantId: string, sizeName: string, priceNum: number) {
    setVariantsError(null);

    if (
      editingItem &&
      isPersistedMenuItemId(editingItem.id) &&
      isPersistedMenuItemVariantId(variantId)
    ) {
      const result = await updateMenuItemVariant(editingItem.id, variantId, {
        size: sizeName,
        price: priceNum,
      });
      if (!result.ok || !result.data) {
        const message = result.message ?? 'Failed to update variant.';
        setVariantsError(message);
        throw new Error(message);
      }
      setVariants((prev) =>
        prev.map((variant) => (variant.id === variantId ? result.data! : variant)),
      );
      return;
    }

    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId ? { ...variant, size: sizeName, price: priceNum } : variant,
      ),
    );
  }

  async function handleActivateVariant(variantId: string) {
    if (!editingItem || !isPersistedMenuItemId(editingItem.id)) {
      setVariants((prev) =>
        prev.map((variant) =>
          variant.id === variantId ? { ...variant, status: 'Active' } : variant,
        ),
      );
      return;
    }

    setVariantsError(null);
    setVariantActionId(variantId);
    const result = await activateMenuItemVariant(editingItem.id, variantId);
    setVariantActionId(null);

    if (!result.ok || !result.data) {
      setVariantsError(result.message ?? 'Failed to activate variant.');
      return;
    }

    setVariants((prev) =>
      prev.map((variant) => (variant.id === variantId ? result.data! : variant)),
    );
  }

  async function handleDeactivateVariant(variantId: string) {
    setVariantsError(null);

    if (
      editingItem &&
      isPersistedMenuItemId(editingItem.id) &&
      isPersistedMenuItemVariantId(variantId)
    ) {
      setVariantActionId(variantId);
      const result = await deactivateMenuItemVariant(editingItem.id, variantId);
      setVariantActionId(null);
      if (!result.ok) {
        setVariantsError(result.message ?? 'Failed to deactivate variant.');
        return;
      }
      setVariants((prev) =>
        prev.map((variant) =>
          variant.id === variantId ? (result.data ?? { ...variant, status: 'Inactive' }) : variant,
        ),
      );
      return;
    }

    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId ? { ...variant, status: 'Inactive' } : variant,
      ),
    );
  }

  async function handleToggleItemStatus() {
    if (!editingItem) return;

    const previousStatus = itemStatus;
    const targetStatus = previousStatus === 'Hidden' ? 'Available' : 'Hidden';
    setItemStatus(targetStatus);
    setItemStatusBusy(true);
    setErrors((prev) => ({ ...prev, form: '' }));
    const result = await (previousStatus === 'Hidden'
      ? activateMenuItemByItemId(editingItem.id)
      : deactivateMenuItemByItemId(editingItem.id));
    setItemStatusBusy(false);

    if (!result.ok) {
      setItemStatus(previousStatus);
      setErrors((prev) => ({ ...prev, form: result.message ?? 'Failed to update item status.' }));
      return;
    }

    setItemStatus(result.data?.status ?? targetStatus);
  }

  function openVariantModal(variant?: ItemVariant) {
    setEditingVariant(variant ?? null);
    setIsVariantModalOpen(true);
  }

  function closeVariantModal() {
    setIsVariantModalOpen(false);
    setEditingVariant(null);
  }

  function handleAddModifier(modifierName: string, priceNum: number) {
    setModifiers((prev) => [
      ...prev,
      { id: `m_${Date.now()}`, name: modifierName, price: priceNum },
    ]);
  }

  function removeModifier(id: string) {
    setModifiers((prev) => prev.filter((m) => m.id !== id));
  }

  function getImagePreviewUrl(image: ItemImage): string {
    return image.previewUrl ?? image.url;
  }

  async function handleFilesSelected(files: FileList | File[]) {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    let currentCount = images.length;
    const toUpload: Array<{ file: File; localId: string; optimisticImage: ItemImage }> = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file) continue;

      const check = validateImageFile(file, currentCount);
      if (!check.valid) {
        if (check.error) setImagesError(check.error);
        if (check.uploadError) setUploadError(check.uploadError);
        return;
      }

      setUploadError(null);
      setImagesError(null);

      const localId = `img_${Date.now()}_${i}`;
      const previewUrl = URL.createObjectURL(file);
      const optimisticImage: ItemImage = {
        id: localId,
        url: previewUrl,
        previewUrl,
        mimeType: file.type,
        isPrimary: currentCount === 0,
        status: 'Active',
      };

      currentCount++;
      toUpload.push({ file, localId, optimisticImage });
    }

    if (editingItem && isPersistedMenuItemId(editingItem.id)) {
      setImages((prev) => [...prev, ...toUpload.map((u) => u.optimisticImage)]);
      const initialSort = images.length;
      await Promise.all(
        toUpload.map(async ({ file, localId }, idx) => {
          const result = await uploadMenuItemImage(editingItem.id, file, {
            sortOrder: initialSort + idx,
            isPrimary: initialSort === 0 && idx === 0,
          });
          if (result.ok && result.data) {
            setImages((prev) => prev.map((img) => (img.id === localId ? result.data! : img)));
            if (result.message) {
              setImagesError(result.message);
            }
          } else {
            setImagesError(result.message ?? 'Failed to upload image.');
          }
        }),
      );
      return;
    }

    setPendingImageFiles((prev) => {
      const next = { ...prev };
      for (const { localId, file } of toUpload) {
        next[localId] = file;
      }
      return next;
    });
    setImages((prev) => [
      ...prev,
      ...toUpload.map((u, idx) => ({
        ...u.optimisticImage,
        isPrimary: prev.length === 0 && idx === 0,
      })),
    ]);
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      void handleFilesSelected(e.target.files);
      e.target.value = '';
    }
  }

  function triggerFileSelect() {
    fileInputRef.current?.click();
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFilesSelected(e.dataTransfer.files);
    }
  }

  async function handleActivateImage(imageId: string) {
    if (!editingItem || !isPersistedMenuItemId(editingItem.id)) {
      setImages((prev) =>
        prev.map((image) => (image.id === imageId ? { ...image, status: 'Active' } : image)),
      );
      return;
    }

    setImagesError(null);
    setImageActionId(imageId);
    const result = await activateMenuItemImage(editingItem.id, imageId);
    setImageActionId(null);
    if (!result.ok || !result.data) {
      setImagesError(result.message ?? 'Failed to activate image.');
      return;
    }
    setImages((prev) => prev.map((image) => (image.id === imageId ? result.data! : image)));
  }

  async function handleDeactivateImage(imageId: string) {
    setImagesError(null);

    if (
      editingItem &&
      isPersistedMenuItemId(editingItem.id) &&
      isPersistedMenuItemImageId(imageId)
    ) {
      setImageActionId(imageId);
      const result = await deactivateMenuItemImage(editingItem.id, imageId);
      setImageActionId(null);
      if (!result.ok) {
        setImagesError(result.message ?? 'Failed to deactivate image.');
        return;
      }
      setImages((prev) =>
        prev.map((image) =>
          image.id === imageId ? (result.data ?? { ...image, status: 'Inactive' }) : image,
        ),
      );
      return;
    }

    setImages((prev) =>
      prev.map((image) => (image.id === imageId ? { ...image, status: 'Inactive' } : image)),
    );
  }

  function removeLocalImage(imageId: string) {
    const pendingFile = pendingImageFiles[imageId];
    if (pendingFile) {
      setPendingImageFiles((prev) => {
        const next = { ...prev };
        delete next[imageId];
        return next;
      });
    }
    setImages((prev) => {
      const target = prev.find((image) => image.id === imageId);
      if (target?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const next = prev.filter((image) => image.id !== imageId);
      if (next.length > 0 && !next.some((image) => image.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  }

  async function makePrimaryImage(imageId: string) {
    if (
      editingItem &&
      isPersistedMenuItemId(editingItem.id) &&
      isPersistedMenuItemImageId(imageId)
    ) {
      setImageActionId(imageId);
      const result = await setPrimaryMenuItemImage(editingItem.id, imageId);
      setImageActionId(null);
      if (!result.ok) {
        setImagesError(result.message ?? 'Failed to set primary image.');
        return;
      }
    }

    setImages((prev) =>
      prev.map((image) => ({
        ...image,
        isPrimary: image.id === imageId,
      })),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const submitCode = code.trim();

    const validationErrors = getMenuItemFormValidationErrors({
      categoryId: effectiveCategoryId,
      name,
      code: submitCode,
      gst: pageConfig?.scope === 'company' ? gst : undefined,
      gstRateId: pageConfig?.scope === 'company' ? gstRateId : undefined,
      requiresGstSelection: pageConfig?.scope === 'company' && availableGstOptions.length > 0,
      basePrice,
      requiresScopeSelection,
      scope: scopeSelection.scope,
      assignBranchId: scopeSelection.assignBranchId,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const selectedTags = selectedTagIds
      .map((id) => availableTags.find((tag) => tag.id === id)?.name ?? id)
      .filter(Boolean);

    const isCompany = pageConfig?.scope === 'company';
    const selectedGstRate = isCompany ? gstRates.find((rate) => rate.id === gstRateId) : undefined;
    const resolvedGst =
      isCompany && selectedGstRate ? resolveGstDisplayValue(selectedGstRate) : gst;

    const itemPayload = buildSubmitItemPayload({
      effectiveCategoryId,
      scope: scopeSelection.scope,
      assignBranchId: scopeSelection.assignBranchId,
      name,
      onlineDisplayName,
      submitCode,
      basePrice,
      profitMargin,
      gst: resolvedGst,
      gstRateId,
      description,
      dietary,
      orderTypes,
      exposeIn,
      selectedTagIds,
      selectedTags,
      selectedPreparationStations,
      selectedModifierGroups,
      modifiers,
      images,
      isCompanyScope: isCompany,
    });

    setIsSubmitting(true);
    try {
      if (editingItem) {
        const result = await updateMenuItem(editingItem.id, {
          ...itemPayload,
          status: itemStatus,
          assignBranchId: itemPayload.assignBranchId ?? undefined,
        });
        if (!result.ok) {
          setErrors({ form: result.message ?? 'Failed to save menu item.' });
          return;
        }
        backToList();
        return;
      }

      const imageFiles = Object.values(pendingImageFiles);
      const result = await addMenuItem({
        ...itemPayload,
        variants,
        imageFiles,
      });
      if (!result.ok) {
        setErrors({ form: result.message ?? 'Failed to save menu item.' });
        return;
      }
      backToList();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
        {/* Breadcrumb Sticky Bar */}
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
              {editingItem ? 'Edit Menu Item' : 'Create Menu Item'}
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
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={backToList} size="small" aria-label="Back to items list">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {editingItem ? 'Edit Menu Item' : 'Create Menu Item'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the details below to add a new dish to your menu.
              </Typography>
            </Box>
          </Box>

          {editingItem && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={itemStatus === 'Hidden' ? 'Hidden' : 'Available'}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: itemStatus === 'Hidden' ? 'action.focus' : 'rgba(46, 125, 50, 0.08)',
                  color: itemStatus === 'Hidden' ? 'text.secondary' : 'success.main',
                }}
              />
              <StatusToggleButton
                isActive={itemStatus !== 'Hidden'}
                disabled={itemStatusBusy}
                resourceLabel={editingItem.name}
                onClick={() => void handleToggleItemStatus()}
              />
            </Box>
          )}
        </Box>

        {/* Card 1: Essentials */}
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Essentials
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Core details used across all channels and POS.
          </Typography>

          {pageConfig?.scope === 'company' && !editingItem && (
            <Box sx={{ mb: 3 }}>
              <BranchScopeSelector
                value={scopeSelection}
                onChange={(next) => {
                  setScopeSelection(next);
                  if (errors.form) {
                    setErrors((prev) => {
                      const rest = { ...prev };
                      delete rest.form;
                      return rest;
                    });
                  }
                }}
              />
              {requiresScopeSelection &&
                scopeSelection.scope === 'branch' &&
                !scopeSelection.assignBranchId && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Select an outlet for branch-only items.
                  </Alert>
                )}
            </Box>
          )}

          {/* Row 1: Category, Name, Online Display Name */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 2.5,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography
                component="label"
                htmlFor="itemCat"
                sx={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.75,
                }}
              >
                Category *
              </Typography>
              <FormControl fullWidth size="small" error={Boolean(errors.categoryId)}>
                <Select
                  id="itemCat"
                  value={effectiveCategoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
                  }}
                  displayEmpty
                  sx={{ height: 40, borderRadius: '8px' }}
                >
                  <MenuItem value="" disabled>
                    <em>Select category</em>
                  </MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && <FormHelperText error>{errors.categoryId}</FormHelperText>}
              </FormControl>
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="itemName"
                sx={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.75,
                }}
              >
                Name *
              </Typography>
              <TextField
                id="itemName"
                hiddenLabel
                placeholder="e.g. Paneer Tikka"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                error={Boolean(errors.name)}
                helperText={errors.name}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="itemOnlineName"
                sx={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.75,
                }}
              >
                Online Display Name
              </Typography>
              <TextField
                id="itemOnlineName"
                hiddenLabel
                placeholder="e.g. PNT"
                value={onlineDisplayName}
                onChange={(e) => setOnlineDisplayName(e.target.value)}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
              />
            </Box>
          </Box>

          {/* Row 2: Code, Base Price, Profit Margin */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 2.5,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography
                component="label"
                htmlFor="itemCode"
                sx={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.75,
                }}
              >
                Item Code / SKU *
              </Typography>
              <TextField
                id="itemCode"
                hiddenLabel
                placeholder="e.g. ITM-001, PNT-01"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
                }}
                error={Boolean(errors.code)}
                helperText={errors.code ?? 'POS short code / kitchen SKU.'}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="itemPrice"
                sx={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.75,
                }}
              >
                Item Price (₹) *
              </Typography>
              <TextField
                id="itemPrice"
                hiddenLabel
                type="number"
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                placeholder="120"
                value={basePrice}
                onChange={(e) => {
                  setBasePrice(e.target.value);
                  if (errors.basePrice) setErrors((prev) => ({ ...prev, basePrice: '' }));
                }}
                error={Boolean(errors.basePrice)}
                helperText={errors.basePrice}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="itemProfitMargin"
                sx={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.75,
                }}
              >
                Profit Margin (%)
              </Typography>
              <TextField
                id="itemProfitMargin"
                hiddenLabel
                placeholder="10%"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
              />
            </Box>
          </Box>

          {/* Row 3: GST Slab */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 2.5,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography
                component="label"
                htmlFor="itemGst"
                sx={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.75,
                }}
              >
                GST Tax Slab (%)
              </Typography>
              {pageConfig?.scope === 'company' ? (
                <FormControl fullWidth size="small">
                  <Select
                    id="itemGst"
                    displayEmpty
                    value={gstRateId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setGstRateId(nextId);
                      const rate = gstRates.find((item) => item.id === nextId);
                      if (rate) setGst(resolveGstDisplayValue(rate));
                      if (errors.gst) setErrors((prev) => ({ ...prev, gst: '' }));
                    }}
                    error={Boolean(errors.gst)}
                    sx={{ height: 40, borderRadius: '8px' }}
                  >
                    <MenuItem value="" disabled>
                      Select GST rate
                    </MenuItem>
                    {availableGstOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.gst ? <FormHelperText error>{errors.gst}</FormHelperText> : null}
                  <FormHelperText>Applicable GST tax slab for invoice calculations.</FormHelperText>
                </FormControl>
              ) : (
                <TextField
                  id="itemGst"
                  hiddenLabel
                  placeholder="5%"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  helperText="Applicable GST tax slab for invoice calculations."
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              )}
            </Box>
          </Box>

          {/* Preparation Stations if company scope */}
          {pageConfig?.scope === 'company' && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Preparation Stations
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Route this item to kitchen prep stations for KOT tickets.
                  </Typography>
                </Box>
                <Chip
                  label={`${selectedPreparationStations.length} selected`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {(() => {
                if (prepStationsLoading) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      Loading stations...
                    </Typography>
                  );
                }
                if (safePreparationStations.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      No active preparation stations yet. Create stations under Company → Prep
                      Stations.
                    </Typography>
                  );
                }
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {safePreparationStations.map((station) => {
                      const isSelected = selectedPreparationStations.some(
                        (selected) => selected.stationId === station.id,
                      );
                      const order = selectedPreparationStations.find(
                        (selected) => selected.stationId === station.id,
                      )?.defaultOrder;

                      return (
                        <FormControlLabel
                          key={station.id}
                          control={
                            <Checkbox
                              checked={isSelected}
                              onChange={() => togglePreparationStation(station.id)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {station.name} ({station.code}) {isSelected ? `· #${order}` : ''}
                            </Typography>
                          }
                        />
                      );
                    })}
                  </Box>
                );
              })()}
            </Paper>
          )}

          {/* Description */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              component="label"
              htmlFor="itemDesc"
              sx={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              Description
            </Typography>
            <TextField
              id="itemDesc"
              hiddenLabel
              placeholder="Describe the dish, ingredients, allergens, preparation style..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>

          {/* Section: Dietary & Order Type */}
          <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Dietary & Order Type
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Dietary flags are shown on online platforms. Order types apply to offline POS billing.
            </Typography>

            {/* Dietary Type */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                Dietary Type
              </Typography>
              <RadioGroup
                row
                value={dietary}
                onChange={(e) => setDietary(e.target.value as DietaryType)}
              >
                {dietaryOptions.map((opt) => (
                  <FormControlLabel
                    key={opt.type}
                    value={opt.type}
                    control={<Radio size="small" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: `${opt.paletteColor}.main`,
                          }}
                        />
                        <Typography variant="body2">{opt.label}</Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </Box>

            {/* Order Type */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                Order Type
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {orderTypeOptions.map((opt) => (
                  <FormControlLabel
                    key={opt}
                    control={
                      <Checkbox
                        checked={orderTypes.includes(opt)}
                        onChange={() => toggleOrderType(opt)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{opt}</Typography>}
                  />
                ))}
              </Box>
            </Box>

            {/* Expose This Item In */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                Expose This Item In
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {exposeChannelOptions.map((channel) => (
                  <FormControlLabel
                    key={channel}
                    control={
                      <Checkbox
                        checked={exposeIn.includes(channel)}
                        onChange={() => toggleExpose(channel)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{channel}</Typography>}
                  />
                ))}
              </Box>
            </Box>

            {/* Tags Card */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Tags
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Platform-specific tags (e.g. spicy, vegan) and operational flags.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={openCreateTagModal}
                >
                  Create Tags
                </Button>
              </Box>

              {tagsError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {tagsError}
                </Alert>
              )}
              {tagsLoading ? (
                <MenuItemTagsSkeleton />
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {availableTags.map((tag) => (
                    <Box key={tag.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedTagIds.includes(tag.id)}
                            onChange={() => toggleTag(tag.id)}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">{tag.name}</Typography>}
                      />
                      {pageConfig?.scope === 'company' && (
                        <IconButton
                          size="small"
                          onClick={() => openEditTagModal(tag)}
                          aria-label={`Edit ${tag.name}`}
                          sx={{ p: 0.5 }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Paper>

        {/* Card 2: Upload Images */}
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Item Image
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            PNG, JPG up to 10MB each. Upload up to 3 images.
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={onFileInputChange}
          />

          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              &quot;{uploadError.fileName}&quot; ({uploadError.fileSizeMb} MB) exceeds 10MB limit.
              <Button
                size="small"
                onClick={triggerFileSelect}
                sx={{ ml: 1, textTransform: 'none' }}
              >
                Try again
              </Button>
            </Alert>
          )}

          {imagesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {imagesError}
            </Alert>
          )}

          {images.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {images.map((image, idx) => {
                const isInactive = image.status === 'Inactive';
                const canTogglePersisted =
                  Boolean(editingItem) &&
                  isPersistedMenuItemId(editingItem!.id) &&
                  isPersistedMenuItemImageId(image.id);

                return (
                  <Box
                    key={image.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1.5,
                      width: 170,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      opacity: isInactive ? 0.65 : 1,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImagePreviewUrl(image)}
                      alt={`Upload ${idx + 1}`}
                      style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6 }}
                    />
                    {image.isPrimary && (
                      <Chip
                        label="Primary"
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                      }}
                    >
                      <Chip
                        label={isInactive ? 'Inactive' : 'Active'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: isInactive ? 'action.focus' : 'rgba(46, 125, 50, 0.08)',
                          color: isInactive ? 'text.secondary' : 'success.main',
                        }}
                      />
                      <StatusToggleButton
                        isActive={!isInactive}
                        disabled={imageActionId === image.id}
                        resourceLabel={`image ${idx + 1}`}
                        onClick={() =>
                          void (isInactive
                            ? handleActivateImage(image.id)
                            : handleDeactivateImage(image.id))
                        }
                      />
                    </Box>
                    {!image.isPrimary && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => void makePrimaryImage(image.id)}
                        disabled={imageActionId === image.id}
                        sx={{ fontSize: '0.75rem', textTransform: 'none', py: 0 }}
                      >
                        Set primary
                      </Button>
                    )}
                    {!canTogglePersisted && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeLocalImage(image.id)}
                        aria-label={`Remove image ${idx + 1}`}
                        sx={{ p: 0.5 }}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                );
              })}

              {images.length < 3 && (
                <Box
                  onClick={triggerFileSelect}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    width: 170,
                    height: 190,
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                  }}
                >
                  <AddIcon fontSize="medium" sx={{ color: 'text.secondary', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Add Image ({images.length}/3)
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {images.length === 0 && (
            <Box
              onClick={triggerFileSelect}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                bgcolor: isDragging ? 'action.hover' : 'transparent',
                borderRadius: 1,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                <Box component="span" sx={{ color: 'primary.main' }}>
                  Click to upload
                </Box>{' '}
                or drag and drop
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PNG, JPG up to 10MB each. Upload up to 3 images.
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Two Column Grid for Variants & Modifiers */}
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}
        >
          {/* Card 3: Variants */}
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Variants
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => openVariantModal()}
              >
                Add Variants
              </Button>
            </Box>

            {variantsError && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {variantsError}
              </Alert>
            )}

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}
                      >
                        No variants yet. Add a size option to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    variants.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.size}</TableCell>
                        <TableCell>₹{v.price}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: 0.5,
                            }}
                          >
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
                            <IconButton
                              size="small"
                              onClick={() => openVariantModal(v)}
                              aria-label={`Edit variant ${v.size}`}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            {!(editingItem && isPersistedMenuItemVariantId(v.id)) && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => void removeVariantRow(v.id)}
                                disabled={variantActionId === v.id}
                                aria-label={`Remove variant ${v.size}`}
                              >
                                <DeleteOutlinedIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Card 4: Modifiers / Modifier Groups */}
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {pageConfig?.scope === 'company' ? 'Modifier Groups' : 'Modifiers'}
              </Typography>
              {pageConfig?.scope !== 'company' && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setIsModifierModalOpen(true)}
                >
                  Modifiers
                </Button>
              )}
            </Box>

            {pageConfig?.scope === 'company' ? (
              (() => {
                if (modifierGroupsLoading) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      Loading modifier groups...
                    </Typography>
                  );
                }
                if (safeModifierGroups.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      No active modifier groups yet. Create groups under Company → Modifier Groups.
                    </Typography>
                  );
                }
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {safeModifierGroups.map((group) => {
                      const isSelected = selectedModifierGroups.some(
                        (selected) => selected.groupId === group.id,
                      );
                      const order = selectedModifierGroups.find(
                        (selected) => selected.groupId === group.id,
                      )?.displayOrder;

                      return (
                        <FormControlLabel
                          key={group.id}
                          control={
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleModifierGroup(group.id)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {formatModifierGroupLabel(group)} {isSelected ? `· #${order}` : ''}
                            </Typography>
                          }
                        />
                      );
                    })}
                  </Box>
                );
              })()
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {modifiers.map((m) => (
                  <Chip
                    key={m.id}
                    label={`${m.name} ₹${m.price}`}
                    onDelete={() => removeModifier(m.id)}
                    deleteIcon={<CloseIcon fontSize="small" />}
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {errors.form && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.form}
          </Alert>
        )}

        {/* Footer actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button variant="outlined" onClick={backToList} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {(() => {
              if (isSubmitting) return 'Saving...';
              if (editingItem) return 'Save Changes';
              return 'Save Item';
            })()}
          </Button>
        </Box>
      </Box>

      {/* Modals */}
      <CreateTagsModal
        isOpen={isTagModalOpen}
        onClose={closeTagModal}
        editingTag={editingTag}
        onCreateTag={handleCreateTag}
        onUpdateTag={handleUpdateTag}
      />

      <AddVariantModal
        isOpen={isVariantModalOpen}
        onClose={closeVariantModal}
        editingVariant={editingVariant}
        onAddVariant={handleAddVariant}
        onUpdateVariant={handleUpdateVariant}
      />

      <AddModifierModal
        isOpen={isModifierModalOpen && pageConfig?.scope !== 'company'}
        onClose={() => setIsModifierModalOpen(false)}
        onAddModifier={handleAddModifier}
      />
    </Box>
  );
}
