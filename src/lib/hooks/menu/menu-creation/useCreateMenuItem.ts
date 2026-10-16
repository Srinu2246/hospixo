'use client';

import { useState, useCallback } from 'react';
import type {
  CreateMenuItemFormValues,
  VariantItem,
  ModifierItem,
  MenuCatalogItem,
} from '@/lib/schemas/menu/menuCreationSchema';
import type { DietaryType } from '@/features/menu/menu-creation/DietaryIcon';

const DEFAULT_AVAILABLE_TAGS = [
  'spicy',
  'chef-special',
  'mrp-item',
  'no spicy',
  'vegan',
  'extra-spicy',
  'low spicy',
  'Set As Favorite',
  'extra-masala',
  'Set As Combo',
  'gluten-free',
  'jain',
];

const DEFAULT_VARIANTS: VariantItem[] = [
  { id: 'v1', name: 'Mini', price: 149 },
  { id: 'v2', name: 'Single', price: 249 },
  { id: 'v3', name: 'Double', price: 399 },
  { id: 'v4', name: 'Family Pack', price: 599 },
];

const DEFAULT_MODIFIERS: ModifierItem[] = [
  { id: 'm1', name: 'Extra Raita', price: 40 },
  { id: 'm2', name: 'Extra Gravy', price: 69 },
  { id: 'm3', name: 'Egg', price: 29 },
];

export interface UseCreateMenuItemProps {
  initialItem?: MenuCatalogItem | null;
  onSave?: (data: CreateMenuItemFormValues) => void;
  onBack?: () => void;
}

export function useCreateMenuItem({ initialItem, onSave, onBack }: UseCreateMenuItemProps = {}) {
  // Form fields
  const [category, setCategory] = useState(initialItem?.categoryId ?? 'cat_starters');
  const [name, setName] = useState(initialItem?.name ?? '');
  const [onlineDisplayName, setOnlineDisplayName] = useState(
    initialItem
      ? initialItem.name === 'Paneer Tikka'
        ? 'Paneer Tikka Masala'
        : initialItem.name
      : '',
  );
  const [code, setCode] = useState(initialItem?.code ?? '');
  const [itemPrice, setItemPrice] = useState(initialItem ? String(initialItem.basePrice) : '');
  const [profitMargin, setProfitMargin] = useState(initialItem ? '20' : '5%');
  const [gst, setGst] = useState('5%');
  const [description, setDescription] = useState(
    initialItem?.description ||
      (initialItem?.name === 'Paneer Tikka'
        ? 'Soft cottage cheese cubes marinated in aromatic spices and grilled in a tandoor. Served with mint chutney and onion rings.'
        : ''),
  );

  // Dietary type: Veg, Non-Veg, Egg
  const [dietaryType, setDietaryType] = useState<DietaryType>(
    (initialItem?.dietary as DietaryType) || 'Veg',
  );

  // Order types: Delivery, Take Away, Dine In
  const [orderTypes, setOrderTypes] = useState<string[]>(
    initialItem?.orderTypes ?? ['Delivery', 'Take Away', 'Dine In'],
  );

  // Expose this item in: Captain App, Online order, Kiosk, Other
  const [exposedIn, setExposedIn] = useState<string[]>(['Captain App']);

  // Available tags & selected tags
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    const combined = [...DEFAULT_AVAILABLE_TAGS];
    if (initialItem?.tags) {
      for (const t of initialItem.tags) {
        if (!combined.includes(t)) {
          combined.push(t);
        }
      }
    }
    return combined;
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialItem?.name === 'Paneer Tikka'
      ? ['spicy', 'Set As Favorite', 'extra-masala']
      : (initialItem?.tags ?? ['spicy', 'Set As Favorite', 'extra-masala']),
  );

  // Images & Upload Error State
  const [images, setImages] = useState<string[]>(
    initialItem?.imageUrl
      ? [initialItem.imageUrl]
      : initialItem?.name === 'Paneer Tikka'
        ? [
            'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?w=600&auto=format&fit=crop&q=80',
          ]
        : [],
  );
  const [uploadError, setUploadError] = useState<{
    fileName: string;
    fileSizeMb?: number;
    message: string;
  } | null>(null);

  // Variants & Modifiers
  const [variants, setVariants] = useState<VariantItem[]>(DEFAULT_VARIANTS);
  const [modifiers, setModifiers] = useState<ModifierItem[]>(DEFAULT_MODIFIERS);

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
  const addCustomTag = useCallback((newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setAvailableTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
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
  const addModifier = useCallback((item: { name: string; price: number }) => {
    const newMod: ModifierItem = {
      id: `m_${Date.now()}`,
      name: item.name,
      price: item.price,
    };
    setModifiers((prev) => [...prev, newMod]);
  }, []);

  const updateModifier = useCallback((id: string, item: { name: string; price: number }) => {
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
          setImages((prev) => (prev.length < 5 ? [...prev, e.target!.result as string] : prev));
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
    setImages((prev) => prev.filter((_, i) => i !== index));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [category, name, code, itemPrice, orderTypes]);

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data: CreateMenuItemFormValues = {
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
      };

      if (onSave) {
        onSave(data);
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
