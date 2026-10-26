import type {
  MenuCreationScope,
  MenuCreationViewMode,
} from '@/lib/schemas/menu/menuCreationSchema';

/** Query keys for Menu Creation URL state. */
export const MENU_CREATION_PARAMS = {
  view: 'view',
  itemId: 'itemId',
  /** Selected category filter (survives refresh). */
  category: 'category',
  /** Category being edited (`view=edit-category`). */
  categoryId: 'categoryId',
  /** Dev-only upload error simulation on create-item. */
  simulateError: 'simulateError',
  uploadError: 'uploadError',
} as const;

export type MenuCreationViewParam =
  'list' | 'create-item' | 'edit-item' | 'view-item' | 'create-category' | 'edit-category';

export type MenuCreationSearchParamsInput = Record<string, string | string[] | undefined> | null;

export type ParsedMenuCreationParams = {
  viewMode: MenuCreationViewMode;
  itemId?: string;
  /** Active category filter from `?category=`. */
  categoryFilterId?: string;
  /** Edit-target category from `?categoryId=` (falls back to `category`). */
  categoryId?: string;
};

function firstString(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

function viewParamToMode(view: string | undefined): MenuCreationViewMode {
  switch (view) {
    case 'create-item':
    case 'edit-item':
    case 'view-item':
    case 'create-category':
    case 'edit-category':
      return view;
    default:
      return 'list';
  }
}

/**
 * Parse Next.js / catch-all `searchParams` for Menu Creation.
 * Also accepts a path that ends with create-item routes.
 */
export function parseMenuCreationSearchParams(
  searchParams?: MenuCreationSearchParamsInput,
  path?: string,
): ParsedMenuCreationParams {
  const view = firstString(searchParams?.[MENU_CREATION_PARAMS.view]);
  const itemId = firstString(searchParams?.[MENU_CREATION_PARAMS.itemId]);
  const categoryFilterId = firstString(searchParams?.[MENU_CREATION_PARAMS.category]);
  const categoryId =
    firstString(searchParams?.[MENU_CREATION_PARAMS.categoryId]) ?? categoryFilterId;

  let viewMode = viewParamToMode(view);
  if (
    path &&
    (path.endsWith('create-menu-item') || path.endsWith('menu-creation/create')) &&
    viewMode === 'list'
  ) {
    viewMode = 'create-item';
  }

  return {
    viewMode,
    itemId,
    categoryFilterId,
    categoryId,
  };
}

/** Read current browser URL search params for Menu Creation. */
export function readMenuCreationParamsFromLocation(
  search?: string,
): ParsedMenuCreationParams & { raw: URLSearchParams } {
  const raw = new URLSearchParams(
    search ?? (typeof window !== 'undefined' ? window.location.search : ''),
  );
  return {
    viewMode: viewParamToMode(raw.get(MENU_CREATION_PARAMS.view) ?? undefined),
    itemId: raw.get(MENU_CREATION_PARAMS.itemId) ?? undefined,
    categoryFilterId: raw.get(MENU_CREATION_PARAMS.category) ?? undefined,
    categoryId:
      raw.get(MENU_CREATION_PARAMS.categoryId) ??
      raw.get(MENU_CREATION_PARAMS.category) ??
      undefined,
    raw,
  };
}

export function shouldSimulateMenuItemUploadError(search?: string): boolean {
  const raw = new URLSearchParams(
    search ?? (typeof window !== 'undefined' ? window.location.search : ''),
  );
  return (
    raw.get(MENU_CREATION_PARAMS.simulateError) === 'upload' ||
    raw.get(MENU_CREATION_PARAMS.uploadError) === 'true'
  );
}

function currentUrl(): URL | null {
  if (typeof window === 'undefined') return null;
  return new URL(window.location.href);
}

function applyCategoryFilter(url: URL, categoryId: string | null | undefined) {
  if (categoryId) {
    url.searchParams.set(MENU_CREATION_PARAMS.category, categoryId);
  } else if (categoryId === null) {
    url.searchParams.delete(MENU_CREATION_PARAMS.category);
  }
}

function clearViewParams(url: URL) {
  url.searchParams.delete(MENU_CREATION_PARAMS.view);
  url.searchParams.delete(MENU_CREATION_PARAMS.itemId);
  url.searchParams.delete(MENU_CREATION_PARAMS.categoryId);
}

/** Replace only the category filter param (no history entry). */
export function replaceMenuCreationCategoryParam(categoryId: string | null) {
  const url = currentUrl();
  if (!url) return;
  applyCategoryFilter(url, categoryId);
  window.history.replaceState(window.history.state, '', url.toString());
}

export type PushMenuCreationViewOptions = {
  itemId?: string;
  categoryId?: string;
  categoryFilterId?: string | null;
};

/** Push a Menu Creation view onto history. */
export function pushMenuCreationView(
  view: Exclude<MenuCreationViewParam, 'list'>,
  options: PushMenuCreationViewOptions = {},
) {
  const url = currentUrl();
  if (!url) return;

  url.searchParams.set(MENU_CREATION_PARAMS.view, view);

  if (options.itemId) {
    url.searchParams.set(MENU_CREATION_PARAMS.itemId, options.itemId);
  } else {
    url.searchParams.delete(MENU_CREATION_PARAMS.itemId);
  }

  if (view === 'edit-category' && options.categoryId) {
    url.searchParams.set(MENU_CREATION_PARAMS.categoryId, options.categoryId);
  } else {
    url.searchParams.delete(MENU_CREATION_PARAMS.categoryId);
  }

  if (options.categoryFilterId !== undefined) {
    applyCategoryFilter(url, options.categoryFilterId);
  } else if (options.categoryId) {
    applyCategoryFilter(url, options.categoryId);
  }

  window.history.pushState(
    {
      view,
      itemId: options.itemId,
      categoryId: options.categoryId,
    },
    '',
    url.toString(),
  );
}

const MENU_CREATION_LIST_PATH: Record<MenuCreationScope, string> = {
  company: '/company/menu/menu-creation',
  branch: '/branch-manager/menu/menu-creation',
  organization: '/organization/menu/menu-creation',
};

export function menuCreationListPath(scope: MenuCreationScope): string {
  return MENU_CREATION_LIST_PATH[scope];
}

export type PushMenuCreationListOptions = {
  categoryFilterId?: string | null;
  /** Normalize create-item path segments back to menu-creation. */
  cleanPath?: boolean;
  /** When set, pathname becomes the scope list URL (e.g. branch-manager menu-creation). */
  scope?: MenuCreationScope;
};

/** Return to list view; keeps or sets category filter. */
export function pushMenuCreationList(options: PushMenuCreationListOptions = {}) {
  if (typeof window === 'undefined') return;

  const url =
    options.scope != null
      ? new URL(menuCreationListPath(options.scope), window.location.origin)
      : currentUrl();
  if (!url) return;

  clearViewParams(url);

  if (options.categoryFilterId !== undefined) {
    applyCategoryFilter(url, options.categoryFilterId);
  }

  if (options.cleanPath) {
    url.pathname = url.pathname
      .replace(/\/create-menu-item$/, '/menu-creation')
      .replace(/\/create$/, '');
  }

  if (options.scope != null) {
    url.pathname = menuCreationListPath(options.scope);
  }

  window.history.pushState({}, '', `${url.pathname}${url.search}`);
}
