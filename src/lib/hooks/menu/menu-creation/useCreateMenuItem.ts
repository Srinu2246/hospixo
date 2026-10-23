'use client';

import { useState, useCallback, useMemo } from 'react';
import { toCatalogDietary, toMenuCatalogItem } from '@/lib/helpers/menuItemHelpers';
import type {
  CreateMenuItemSubmitValues,
  VariantItem,
  ModifierItem,
  MenuCatalogItem,
} from '@/lib/schemas/menu/menuCreationSchema';
import type { MenuItemTagDefinition } from '@/lib/schemas/menu/menuItemTagsSchema';
import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';
import type { DietaryType } from '@/features/menu/menu-creation/DietaryIcon';

/** UI-only flags; not menu item tag definitions from GET item-tags. */
const OPERATIONAL_TAG_LABELS = ['Set As Favorite', 'Set As Combo'];

const DEFAULT_VARIANTS: VariantItem[] = [
  { id: 'v1', name: 'Mini', price: 149 },
  { id: 'v2', name: 'Single', price: 249 },
  { id: 'v3', name: 'Double', price: 399 },
  { id: 'v4', name: 'Family Pack', price: 599 },
];

const DEFAULT_MODIFIERS: ModifierItem[] = [];

export interface UseCreateMenuItemProps {
  initialItem?: MenuCatalogItem | null;
  /** Full GET /items/{id} record — seeds variants, modifiers, GST, margin. */
  initialDetail?: MenuItemResponse | null;
  /** From `?category=` / sidebar selection when creating a new item. */
  defaultCategoryId?: string;
  /** GET /v1/restaurant/menu/item-tags */
  apiTagDefinitions?: readonly MenuItemTagDefinition[];
  onSave?: (data: CreateMenuItemSubmitValues) => void | Promise<void>;
  onBack?: () => void;
}

export function useCreateMenuItem({
  initialItem,
  initialDetail = null,
  defaultCategoryId,
  apiTagDefinitions,
  onSave,
  onBack,
}: UseCreateMenuItemProps = {}) {
  const detailCatalog = initialDetail
    ? toMenuCatalogItem(initialDetail, undefined, initialItem?.categoryName)
    : null;
  const seedItem = detailCatalog ?? initialItem ?? null;

  const detailVariants: VariantItem[] =
    initialDetail?.variants.map((variant) => ({
      id: String(variant.id),
      name: variant.name,
      price: variant.final_price,
    })) ?? [];

  const detailModifiers: ModifierItem[] =
    initialDetail?.modifier_groups.map((group) => ({
      id: String(group.modifier_group_id),
      modifierGroupId: group.modifier_group_id,
      name: group.modifier_group?.name ?? `Group ${group.modifier_group_id}`,
      price: 0,
    })) ?? [];

  // Form fields
  const [category, setCategory] = useState(seedItem?.categoryId ?? defaultCategoryId?.trim() ?? '');
  const [name, setName] = useState(seedItem?.name ?? '');
  const [onlineDisplayName, setOnlineDisplayName] = useState(seedItem?.name ?? '');
  const [code, setCode] = useState(seedItem?.code ?? '');
  const [itemPrice, setItemPrice] = useState(seedItem ? String(seedItem.basePrice) : '');
  const [profitMargin, setProfitMargin] = useState(
    initialDetail?.profit_margin_percent != null ? String(initialDetail.profit_margin_percent) : '',
  );
  const [gst, setGst] = useState(
    initialDetail?.taxes[0]?.gst_rate_id != null ? String(initialDetail.taxes[0].gst_rate_id) : '',
  );
  const [description, setDescription] = useState(seedItem?.description ?? '');

  const [dietaryType, setDietaryType] = useState<DietaryType>(() => {
    if (initialDetail) {
      const mapped = toCatalogDietary(initialDetail.dietary_type);
      return mapped === 'Vegan' ? 'Veg' : (mapped as DietaryType);
    }
    return (seedItem?.dietary as DietaryType) || 'Veg';
  });

  const [orderTypes, setOrderTypes] = useState<string[]>(
    seedItem?.orderTypes ?? ['Delivery', 'Take Away', 'Dine In'],
  );

  const [exposedIn, setExposedIn] = useState<string[]>(
    initialDetail ? (initialDetail.expose_captain_app ? ['Captain App'] : []) : ['Captain App'],
  );

  const [selectedTags, setSelectedTags] = useState<string[]>(seedItem?.tags ?? []);
  const [localCreatedTags, setLocalCreatedTags] = useState<Array<{ id: number; name: string }>>([]);

  const { availableTags, tagIdsByName } = useMemo(() => {
    const fromApi = (apiTagDefinitions ?? []).filter((tag) => tag.status !== 'inactive');
    const definitions = [...fromApi, ...localCreatedTags];
    const ids: Record<string, number> = {};
    const names: string[] = [];

    for (const tag of definitions) {
      const label = tag.name.trim();
      const key = label.toLowerCase();
      if (!label) continue;
      ids[key] = tag.id;
      if (!names.includes(label)) names.push(label);
    }

    const merged = [...names, ...OPERATIONAL_TAG_LABELS];
    if (seedItem?.tags) {
      for (const label of seedItem.tags) {
        if (!merged.includes(label)) merged.push(label);
      }
    }

    return { availableTags: merged, tagIdsByName: ids };
  }, [apiTagDefinitions, localCreatedTags, seedItem]);

  /** User uploads only (data URLs). Existing server URLs are shown separately in the screen. */
  const [images, setImages] = useState<string[]>([]);
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<{
    fileName: string;
    fileSizeMb?: number;
    message: string;
  } | null>(null);

  const [variants, setVariants] = useState<VariantItem[]>(
    initialDetail ? detailVariants : DEFAULT_VARIANTS,
  );
  const [modifiers, setModifiers] = useState<ModifierItem[]>(
    initialDetail ? detailModifiers : DEFAULT_MODIFIERS,
  );

  // Modals state
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [isAddModifierOpen, setIsAddModifierOpen] = useState(false);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantItem | null>(null);
  const [editingModifier, setEditingModifier] = useState<ModifierItem | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dietary toggle
  const handleDietaryChange = useCallback((type: DietaryType) => {
    setDietaryType(type);
  }, []);

  // Order types toggle
  const toggleOrderType = useCallback((type: string) => {
    setOrderTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next.orderTypes;
      return next;
    });
  }, []);

  // Expose in toggle
  const toggleExposedIn = useCallback((channel: string) => {
    setExposedIn((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    );
  }, []);

  // Tags toggle
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  // Add custom tag
  const addCustomTag = useCallback((tag: { id: number; name: string }) => {
    const trimmed = tag.name.trim();
    if (!trimmed || !Number.isFinite(tag.id) || tag.id <= 0) return;
    setLocalCreatedTags((prev) => {
      if (prev.some((row) => row.id === tag.id)) return prev;
      return [...prev, { id: tag.id, name: trimmed }];
    });
    setSelectedTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  }, []);

  // Add variant
  const addVariant = useCallback((item: { name: string; price: number }) => {
    const newVariant: VariantItem = {
      id: `v_${Date.now()}`,
      name: item.name,
      price: item.price,
    };
    setVariants((prev) => [...prev, newVariant]);
  }, []);

  const updateVariant = useCallback((id: string, item: { name: string; price: number }) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, name: item.name, price: item.price } : v)),
    );
  }, []);

  // Remove variant
  const removeVariant = useCallback((id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // Add modifier
  const addModifier = useCallback(
    (item: { name: string; price: number; modifierGroupId?: number }) => {
      const newMod: ModifierItem = {
        id: item.modifierGroupId != null ? String(item.modifierGroupId) : `m_${Date.now()}`,
        modifierGroupId: item.modifierGroupId,
        name: item.name,
        price: item.price,
      };
      setModifiers((prev) => [...prev, newMod]);
    },
    [],
  );

  const updateModifier = useCallback(
    (id: string, item: { name: string; price: number; modifierGroupId?: number }) => {
      setModifiers((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                name: item.name,
                price: item.price,
                modifierGroupId: item.modifierGroupId ?? m.modifierGroupId,
                id: item.modifierGroupId != null ? String(item.modifierGroupId) : m.id,
              }
            : m,
        ),
      );
    },
    [],
  );

  // Remove modifier
  const removeModifier = useCallback((id: string) => {
    setModifiers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Image upload
  const handleImageUpload = useCallback((files: FileList | File[]) => {
    const fileList = Array.from(files);
    let hasError = false;

    fileList.forEach((file) => {
      // 10MB limit (matches reference screenshot "exceeds the maximum 10MB limit")
      if (file.size > 10 * 1024 * 1024) {
        hasError = true;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setUploadError({
          fileName: file.name,
          fileSizeMb: parseFloat(sizeMb),
          message: `"${file.name}" (${sizeMb} MB) exceeds the maximum 10MB limit.`,
        });
        return;
      }

      // Format check (JPG, PNG, WEBP)
      if (file.type && !file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
        hasError = true;
        setUploadError({
          fileName: file.name,
          message: `"${file.name}" is not a supported format. Allowed JPG, PNG.`,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setImages((prev) => {
            if (prev.length >= 5) return prev;
            if (prev.length === 0) setPrimaryImageFile(file);
            return [...prev, e.target!.result as string];
          });
          setUploadError(null);
        }
      };
      reader.readAsDataURL(file);
    });

    if (!hasError && fileList.length > 0) {
      setUploadError(null);
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (index === 0) setPrimaryImageFile(null);
      return next;
    });
  }, []);

  // Validation
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!category.trim()) {
      newErrors.category = 'Please select a category';
    }
    if (!name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!code.trim()) {
      newErrors.code = 'Item code is required';
    }
    const priceNum = parseFloat(itemPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      newErrors.itemPrice = 'Valid item price is required';
    }
    if (orderTypes.length === 0) {
      newErrors.orderTypes = 'Select at least one order type';
    }
    const gstId = Number(gst.trim());
    if (!gst.trim() || !Number.isFinite(gstId) || gstId <= 0) {
      newErrors.gst = 'Select a GST rate';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [category, name, code, itemPrice, orderTypes, gst]);

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data: CreateMenuItemSubmitValues = {
        category,
        name: name.trim(),
        onlineDisplayName: onlineDisplayName.trim() || undefined,
        code: code.trim(),
        itemPrice: parseFloat(itemPrice) || 0,
        profitMargin: profitMargin.trim() || undefined,
        gst: gst.trim() || undefined,
        description: description.trim() || undefined,
        dietaryType,
        orderTypes,
        exposedIn,
        tags: selectedTags,
        images,
        variants,
        modifiers,
        imageFile: primaryImageFile,
        tagIdsByName,
      };

      if (onSave) {
        await onSave(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validate,
    category,
    name,
    onlineDisplayName,
    code,
    itemPrice,
    profitMargin,
    gst,
    description,
    dietaryType,
    orderTypes,
    exposedIn,
    selectedTags,
    images,
    variants,
    modifiers,
    primaryImageFile,
    tagIdsByName,
    onSave,
  ]);

  return {
    // Form state
    category,
    setCategory,
    name,
    setName,
    onlineDisplayName,
    setOnlineDisplayName,
    code,
    setCode,
    itemPrice,
    setItemPrice,
    profitMargin,
    setProfitMargin,
    gst,
    setGst,
    description,
    setDescription,
    dietaryType,
    setDietaryType: handleDietaryChange,
    orderTypes,
    toggleOrderType,
    exposedIn,
    toggleExposedIn,
    availableTags,
    selectedTags,
    toggleTag,
    addCustomTag,
    images,
    handleImageUpload,
    removeImage,
    uploadError,
    setUploadError,
    variants,
    addVariant,
    updateVariant,
    removeVariant,
    modifiers,
    addModifier,
    updateModifier,
    removeModifier,
    // Dialogs
    isAddVariantOpen,
    setIsAddVariantOpen,
    editingVariant,
    setEditingVariant,
    isAddModifierOpen,
    setIsAddModifierOpen,
    editingModifier,
    setEditingModifier,
    isCreateTagOpen,
    setIsCreateTagOpen,
    // Validation & actions
    errors,
    isSubmitting,
    handleSubmit,
    onBack,
  };
}
