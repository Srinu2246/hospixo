'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toCatalogDietary, toMenuCatalogItem } from '@/lib/helpers/menuItemHelpers';
import { zodFieldMessage } from '@/lib/schemas/menu/menuCreationSchema';
import {
  menuItemConfigurationSchema,
  type CreateMenuItemSubmitValues,
  type MenuItemConfigurationField,
  type VariantItem,
  type ItemOptionFormPayload,
  type ModifierItem,
  type MenuCatalogItem,
} from '@/lib/schemas/menu/menuCreationSchema';
import type { MenuItemTagDefinition } from '@/lib/schemas/menu/menuItemTagsSchema';
import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';
import type { DietaryType } from '@/features/menu/menu-creation/DietaryIcon';

/** UI-only flags; not menu item tag definitions from GET item-tags. */
const OPERATIONAL_TAG_LABELS = ['Set As Favorite', 'Set As Combo'];

const DEFAULT_MODIFIERS: ModifierItem[] = [];

const CONFIGURATION_FIELDS: MenuItemConfigurationField[] = [
  'category',
  'name',
  'onlineDisplayName',
  'code',
  'itemPrice',
  'gst',
  'orderTypes',
];

type EditFormSnapshot = Readonly<{
  category: string;
  name: string;
  onlineDisplayName: string;
  code: string;
  itemPrice: string;
  profitMargin: string;
  gst: string;
  description: string;
  dietaryType: DietaryType;
  orderTypesKey: string;
  exposedInKey: string;
  tagsKey: string;
  variantsKey: string;
  modifiersKey: string;
}>;

function sortedKey(values: readonly string[]): string {
  return [...values]
    .map((v) => v.trim())
    .sort()
    .join('\u0001');
}

function variantsKey(rows: readonly VariantItem[]): string {
  return rows.map((row) => `${row.id}:${row.name.trim()}:${row.price}`).join('\u0001');
}

function modifiersKey(rows: readonly ModifierItem[]): string {
  return rows.map((row) => `${row.id}:${row.name.trim()}:${row.price}`).join('\u0001');
}

function resolveSeedDietary(
  initialDetail: MenuItemResponse | null,
  seedItem: MenuCatalogItem | null,
): DietaryType {
  if (initialDetail) {
    const mapped = toCatalogDietary(initialDetail.dietary_type);
    return mapped === 'Vegan' ? 'Veg' : (mapped as DietaryType);
  }
  return (seedItem?.dietary as DietaryType) || 'Veg';
}

export interface UseCreateMenuItemProps {
  mode?: 'create' | 'edit';
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
  mode = 'create',
  initialItem,
  initialDetail = null,
  defaultCategoryId,
  apiTagDefinitions,
  onSave,
  onBack,
}: UseCreateMenuItemProps = {}) {
  const isEdit = mode === 'edit';
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
    initialDetail?.modifier_groups.flatMap((group) => {
      const options = group.modifier_group?.options ?? [];
      if (options.length > 0) {
        return options.map((option) => ({
          id: String(option.id),
          name: option.name,
          price: Number(option.price_delta) || 0,
        }));
      }
      return [
        {
          id: String(group.modifier_group_id),
          name: group.modifier_group?.name ?? `Group ${group.modifier_group_id}`,
          price: 0,
        },
      ];
    }) ?? [];

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
  const [uploadedImageFiles, setUploadedImageFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<{
    fileName: string;
    fileSizeMb?: number;
    message: string;
  } | null>(null);

  const [variants, setVariants] = useState<VariantItem[]>(initialDetail ? detailVariants : []);
  const [modifiers, setModifiers] = useState<ModifierItem[]>(
    initialDetail ? detailModifiers : DEFAULT_MODIFIERS,
  );

  const initialEditSnapshot = useMemo((): EditFormSnapshot | null => {
    if (!isEdit) return null;
    const seedDietary = resolveSeedDietary(initialDetail, seedItem);
    const seedOrderTypes = seedItem?.orderTypes ?? ['Delivery', 'Take Away', 'Dine In'];
    const seedExposedIn = initialDetail
      ? initialDetail.expose_captain_app
        ? ['Captain App']
        : []
      : ['Captain App'];
    const seedTags = seedItem?.tags ?? [];
    const seedVariants = initialDetail ? detailVariants : [];
    const seedModifiers = initialDetail ? detailModifiers : DEFAULT_MODIFIERS;

    return {
      category: (seedItem?.categoryId ?? defaultCategoryId?.trim() ?? '').trim(),
      name: (seedItem?.name ?? '').trim(),
      onlineDisplayName: (seedItem?.name ?? '').trim(),
      code: (seedItem?.code ?? '').trim(),
      itemPrice: seedItem ? String(seedItem.basePrice).trim() : '',
      profitMargin:
        initialDetail?.profit_margin_percent != null
          ? String(initialDetail.profit_margin_percent)
          : '',
      gst:
        initialDetail?.taxes[0]?.gst_rate_id != null
          ? String(initialDetail.taxes[0].gst_rate_id)
          : '',
      description: (seedItem?.description ?? '').trim(),
      dietaryType: seedDietary,
      orderTypesKey: sortedKey(seedOrderTypes),
      exposedInKey: sortedKey(seedExposedIn),
      tagsKey: sortedKey(seedTags),
      variantsKey: variantsKey(seedVariants),
      modifiersKey: modifiersKey(seedModifiers),
    };
  }, [defaultCategoryId, detailModifiers, detailVariants, initialDetail, isEdit, seedItem]);
  // Modals state
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [isAddModifierOpen, setIsAddModifierOpen] = useState(false);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantItem | null>(null);
  const [editingModifier, setEditingModifier] = useState<ModifierItem | null>(null);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<MenuItemConfigurationField, string>>
  >({});
  const [touched, setTouched] = useState<Partial<Record<MenuItemConfigurationField, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const configurationValues = useCallback(
    () => ({
      category,
      name,
      onlineDisplayName,
      code,
      itemPrice,
      gst,
      orderTypes,
    }),
    [category, code, gst, itemPrice, name, onlineDisplayName, orderTypes],
  );

  const allConfigurationErrors = useCallback((): Partial<
    Record<MenuItemConfigurationField, string>
  > => {
    const result = menuItemConfigurationSchema.safeParse(configurationValues());
    if (result.success) return {};
    const next: Partial<Record<MenuItemConfigurationField, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !(key in next)) {
        next[key as MenuItemConfigurationField] = issue.message;
      }
    }
    return next;
  }, [configurationValues]);

  const validateField = useCallback(
    (field: MenuItemConfigurationField) => {
      const message = zodFieldMessage(menuItemConfigurationSchema, configurationValues(), field);
      setFieldErrors((prev) => {
        if (!message) {
          if (!prev[field]) return prev;
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: message };
      });
    },
    [configurationValues],
  );

  const touchField = useCallback((field: MenuItemConfigurationField) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const handleFieldBlur = useCallback(
    (field: MenuItemConfigurationField) => {
      touchField(field);
      validateField(field);
    },
    [touchField, validateField],
  );

  const fieldError = useCallback(
    (field: MenuItemConfigurationField): string | undefined => {
      return touched[field] ? fieldErrors[field] : undefined;
    },
    [fieldErrors, touched],
  );

  // Dietary toggle
  const handleDietaryChange = useCallback((type: DietaryType) => {
    setDietaryType(type);
  }, []);

  // Order types toggle
  const toggleOrderType = useCallback(
    (type: string) => {
      setOrderTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
      );
      touchField('orderTypes');
    },
    [touchField],
  );

  useEffect(() => {
    if (touched.orderTypes) {
      validateField('orderTypes');
    }
  }, [orderTypes, touched.orderTypes, validateField]);

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
  const addModifier = useCallback((item: ItemOptionFormPayload) => {
    const newMod: ModifierItem = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: item.name,
      price: item.price,
    };
    setModifiers((prev) => [...prev, newMod]);
  }, []);

  const updateModifier = useCallback((id: string, item: ItemOptionFormPayload) => {
    setModifiers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: item.name, price: item.price } : m)),
    );
  }, []);

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
            setUploadedImageFiles((files) => [...files, file]);
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
      setUploadedImageFiles((files) => files.filter((_, i) => i !== index));
      return next;
    });
  }, []);

  const hasEditChanges = useMemo(() => {
    if (!isEdit || !initialEditSnapshot) return true;
    if (uploadedImageFiles.length > 0 || images.length > 0) return true;

    const current: EditFormSnapshot = {
      category: category.trim(),
      name: name.trim(),
      onlineDisplayName: onlineDisplayName.trim(),
      code: code.trim(),
      itemPrice: itemPrice.trim(),
      profitMargin: profitMargin.trim(),
      gst: gst.trim(),
      description: description.trim(),
      dietaryType,
      orderTypesKey: sortedKey(orderTypes),
      exposedInKey: sortedKey(exposedIn),
      tagsKey: sortedKey(selectedTags),
      variantsKey: variantsKey(variants),
      modifiersKey: modifiersKey(modifiers),
    };

    return (Object.keys(initialEditSnapshot) as (keyof EditFormSnapshot)[]).some(
      (key) => current[key] !== initialEditSnapshot[key],
    );
  }, [
    category,
    code,
    description,
    dietaryType,
    exposedIn,
    gst,
    images.length,
    initialEditSnapshot,
    isEdit,
    itemPrice,
    modifiers,
    name,
    onlineDisplayName,
    orderTypes,
    profitMargin,
    selectedTags,
    uploadedImageFiles.length,
    variants,
  ]);

  const canSubmit = useMemo(() => {
    const isValid = Object.keys(allConfigurationErrors()).length === 0;
    if (!isValid) return false;
    if (isEdit) return hasEditChanges;
    return true;
  }, [allConfigurationErrors, hasEditChanges, isEdit]);

  const validate = useCallback(() => {
    const nextErrors = allConfigurationErrors();
    const nextTouched: Partial<Record<MenuItemConfigurationField, boolean>> = {};
    for (const key of Object.keys(nextErrors) as MenuItemConfigurationField[]) {
      nextTouched[key] = true;
    }
    for (const key of CONFIGURATION_FIELDS) {
      nextTouched[key] = true;
    }
    setTouched((prev) => ({ ...prev, ...nextTouched }));
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [allConfigurationErrors]);

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    if (isEdit && !hasEditChanges) return;

    setIsSubmitting(true);
    try {
      const data: CreateMenuItemSubmitValues = {
        category,
        name: name.trim(),
        onlineDisplayName: onlineDisplayName.trim(),
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
        imageFiles: uploadedImageFiles,
        tagIdsByName,
        initialDetail: initialDetail ?? undefined,
      };

      if (onSave) {
        await onSave(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validate,
    isEdit,
    hasEditChanges,
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
    uploadedImageFiles,
    tagIdsByName,
    initialDetail,
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
    fieldError,
    isFieldTouched: (field: MenuItemConfigurationField) => Boolean(touched[field]),
    handleFieldBlur,
    validateField,
    touchField,
    canSubmit,
    isSubmitting,
    handleSubmit,
    onBack,
  };
}
