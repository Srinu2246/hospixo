'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { MOCK_MENU_CATEGORIES, MOCK_MENU_ITEMS } from '@/lib/mocks/menu/useMenuCreation.mocks';
import {
  createCategoryInputSchema,
  menuCategorySchema,
  type CreateCategoryInput,
  type MenuCatalogItem,
  type MenuCategory,
  type MenuCreationViewMode,
  type MenuPageConfig,
} from '@/lib/schemas/menu/menuCreationSchema';

interface MenuCreationContextValue {
  pageConfig: MenuPageConfig;
  viewMode: MenuCreationViewMode;
  categories: MenuCategory[];
  items: MenuCatalogItem[];
  filteredItems: MenuCatalogItem[];
  categoryCounts: Record<string, number>;
  totalItemCount: number;
  activeCategoryId: string | null;
  searchQuery: string;
  sessionFilter: string;
  selectedItem: MenuCatalogItem | null;
  setActiveCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSessionFilter: (sessionId: string) => void;
  openCreateCategory: () => void;
  openCreateItem: () => void;
  openEditItem: (item: MenuCatalogItem) => void;
  openViewItem: (item: MenuCatalogItem) => void;
  backToList: () => void;
  addCategory: (input: CreateCategoryInput) => void;
  toggleCategoryStatus: (categoryId: string) => void;
}

const MenuCreationContext = createContext<MenuCreationContextValue | null>(null);

export function MenuCreationProvider({
  pageConfig,
  children,
}: Readonly<{
  pageConfig: MenuPageConfig;
  children: ReactNode;
}>) {
  const [viewMode, setViewMode] = useState<MenuCreationViewMode>('list');
  const [categories, setCategories] = useState<MenuCategory[]>(MOCK_MENU_CATEGORIES);
  const [items] = useState<MenuCatalogItem[]>(MOCK_MENU_ITEMS);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('session-wise');
  const [selectedItem, setSelectedItem] = useState<MenuCatalogItem | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (activeCategoryId && item.categoryId !== activeCategoryId) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.code?.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query)
      );
    });
  }, [activeCategoryId, items, searchQuery]);

  const value = useMemo<MenuCreationContextValue>(
    () => ({
      pageConfig,
      viewMode,
      categories,
      items,
      filteredItems,
      categoryCounts,
      totalItemCount: items.length,
      activeCategoryId,
      searchQuery,
      sessionFilter,
      selectedItem,
      setActiveCategoryId,
      setSearchQuery,
      setSessionFilter,
      openCreateCategory: () => setViewMode('create-category'),
      openCreateItem: () => {
        setSelectedItem(null);
        setViewMode('create-item');
      },
      openEditItem: (item) => {
        setSelectedItem(item);
        setViewMode('edit-item');
      },
      openViewItem: (item) => {
        setSelectedItem(item);
        setViewMode('view-item');
      },
      backToList: () => {
        setSelectedItem(null);
        setViewMode('list');
      },
      addCategory: (input) => {
        const parsed = createCategoryInputSchema.parse(input);
        const next = menuCategorySchema.parse({
          id: `cat_${Date.now()}`,
          name: parsed.name,
          description: parsed.description || undefined,
          status: 'Active',
          displayOrder: categories.length + 1,
        });
        setCategories((prev) => [...prev, next]);
        setActiveCategoryId(next.id);
        setViewMode('list');
      },
      toggleCategoryStatus: (categoryId) => {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  status: category.status === 'Active' ? 'Inactive' : 'Active',
                }
              : category,
          ),
        );
      },
    }),
    [
      activeCategoryId,
      categories,
      categoryCounts,
      filteredItems,
      items,
      pageConfig,
      searchQuery,
      sessionFilter,
      selectedItem,
      viewMode,
    ],
  );

  return <MenuCreationContext.Provider value={value}>{children}</MenuCreationContext.Provider>;
}

export function useMenuCreation(): MenuCreationContextValue {
  const context = useContext(MenuCreationContext);
  if (!context) {
    throw new Error('useMenuCreation must be used within MenuCreationProvider');
  }
  return context;
}
