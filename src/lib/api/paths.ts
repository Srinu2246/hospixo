/**
 * Central registry of backend API paths (server-side BFF → Hospixo API).
 * Import from `@/lib/api/paths` in apps; do not hardcode paths in features.
 */
export const apiPaths = {
  auth: {
    login: '/api/v1/auth/login',
    platformLogin: '/api/v1/auth/platform-login',
    pinLogin: '/api/v1/auth/pin-login',
    register: '/api/v1/auth/register',
    me: '/api/v1/auth/me',
    logout: '/api/v1/auth/logout',
    changePassword: '/api/v1/auth/change-password',
  },
  platform: {
    organizations: '/api/v1/platform/organizations',
    organizationsV2: '/api/v2/platform/organizations',
    assetUploadIntents: '/api/v2/platform/assets/upload-intents',
    subscriptionCatalogPlans: '/api/v1/platform/subscription-catalog/plans',
    billingPaymentMethods: '/api/v2/platform/billing/payment-methods',
  },
  admin: {
    dashboardOverview: '/api/v1/admin/dashboard/overview',
  },
  restaurant: {
    menuCategories: '/api/v1/restaurant/menu/categories',
    menuItems: '/api/v1/restaurant/menu/items',
    menuItemTags: '/api/v1/restaurant/menu/item-tags',
    menus: '/api/v1/restaurant/menus',
    gstRates: '/api/v1/restaurant/gst-rates',
    preparationStations: '/api/v1/restaurant/preparation-stations',
    modifierGroups: '/api/v1/restaurant/modifier-groups',
  },
} as const;

/**
 * @param organizationId - The ID of the organization
 * @returns The path to the organization
 */
export function platformOrganizationPath(organizationId: string): string {
  return `${apiPaths.platform.organizations}/${encodeURIComponent(organizationId)}`;
}

/**
 * `POST /api/v2/platform/assets/{asset_id}/complete` — confirm an upload finished.
 */
export function platformAssetCompletePath(assetPublicId: string): string {
  return `/api/v2/platform/assets/${encodeURIComponent(assetPublicId)}/complete`;
}

/**
 * `POST /api/v2/platform/assets/{asset_id}/cancel` — abandon an upload intent.
 */
export function platformAssetCancelPath(assetPublicId: string): string {
  return `/api/v2/platform/assets/${encodeURIComponent(assetPublicId)}/cancel`;
}

/**
 * `GET /api/v2/platform/assets/{asset_id}`
 */
export function platformAssetPath(assetPublicId: string): string {
  return `/api/v2/platform/assets/${encodeURIComponent(assetPublicId)}`;
}

/**
 * `GET|POST /api/v1/platform/organizations/{org_id}/companies`
 */
export function platformCompaniesPath(organizationId: string): string {
  return `${platformOrganizationPath(organizationId)}/companies`;
}

/**
 * `POST /api/v2/platform/organizations/{org_id}/companies` — nested create body.
 */
export function platformCompaniesV2Path(organizationId: string): string {
  return `${apiPaths.platform.organizationsV2}/${encodeURIComponent(organizationId)}/companies`;
}

/** @deprecated Use `platformCompaniesPath` */
export function platformCompanyPath(organizationId: string): string {
  return platformCompaniesPath(organizationId);
}

/**
 * `GET|PATCH /api/v1/platform/organizations/{org_id}/companies/{company_id}`
 */
export function platformCompanyDetailPath(
  organizationId: string,
  companyId: string | number,
): string {
  return `${platformCompaniesPath(organizationId)}/${encodeURIComponent(String(companyId))}`;
}

/**
 * `GET /api/v1/platform/organizations/{org_id}/branches`
 */
export function platformOrganizationBranchesPath(organizationId: string): string {
  return `${platformOrganizationPath(organizationId)}/branches`;
}

/**
 * `GET|POST /api/v1/platform/organizations/{org_id}/companies/{company_id}/branches`
 */
export function platformCompanyBranchesPath(
  organizationId: string,
  companyId: string | number,
): string {
  return `${platformCompanyDetailPath(organizationId, companyId)}/branches`;
}

/**
 * `POST /api/v1/platform/organizations/{org_id}/companies/{company_id}/branches/{branch_id}/activate`
 */
export function platformBranchActivatePath(
  organizationId: string,
  companyId: string | number,
  branchId: string | number,
): string {
  return `${platformCompanyBranchesPath(organizationId, companyId)}/${encodeURIComponent(String(branchId))}/activate`;
}

/**
 * `POST /api/v1/platform/organizations/{org_id}/companies/{company_id}/branches/{branch_id}/deactivate`
 */
export function platformBranchDeactivatePath(
  organizationId: string,
  companyId: string | number,
  branchId: string | number,
): string {
  return `${platformCompanyBranchesPath(organizationId, companyId)}/${encodeURIComponent(String(branchId))}/deactivate`;
}

/** @deprecated Use `platformCompanyDetailPath` */
export function platformCompanyDetailsPath(
  organizationId: string,
  companyId: string | number,
): string {
  return platformCompanyDetailPath(organizationId, companyId);
}

/**
 * `POST /api/v1/platform/organizations/{org_id}/companies/{company_id}/provision`
 */
export function platformCompanyProvisionPath(
  organizationId: string,
  companyId: string | number,
): string {
  return `${platformCompanyDetailPath(organizationId, companyId)}/provision`;
}

/** @deprecated Use `platformCompanyProvisionPath` */
export function platformProvisionPath(organizationId: string, companyId: string | number): string {
  return platformCompanyProvisionPath(organizationId, companyId);
}

/**
 * `GET /api/v1/platform/organizations/{org_id}/companies/{company_id}/provisioning-status`
 */
export function platformCompanyProvisioningStatusPath(
  organizationId: string,
  companyId: string | number,
): string {
  return `${platformCompanyDetailPath(organizationId, companyId)}/provisioning-status`;
}

/** @deprecated Use `platformCompanyProvisioningStatusPath` */
export function platformCompanyProvisionStatusPath(
  organizationId: string,
  companyId: string | number,
): string {
  return platformCompanyProvisioningStatusPath(organizationId, companyId);
}

// Restaurant menu paths -------------------------------------------------------

export function restaurantMenuCategoryPath(categoryId: string | number): string {
  return `${apiPaths.restaurant.menuCategories}/${encodeURIComponent(String(categoryId))}`;
}

export function restaurantMenuCategoryActivatePath(categoryId: string | number): string {
  return `${restaurantMenuCategoryPath(categoryId)}/activate`;
}

export function restaurantMenuCategoryDeactivatePath(categoryId: string | number): string {
  return `${restaurantMenuCategoryPath(categoryId)}/deactivate`;
}

export function restaurantMenuItemPath(itemId: string | number): string {
  return `${apiPaths.restaurant.menuItems}/${encodeURIComponent(String(itemId))}`;
}

export type RestaurantMenuItemsListQuery = Readonly<{
  status?: 'active' | 'inactive';
  category_id?: number;
  dietary_type?: 'veg' | 'non_veg' | 'egg' | 'vegan';
}>;

/** `GET /api/v1/restaurant/menu/items` with optional `status`, `category_id`, `dietary_type` */
export function restaurantMenuItemsListPath(query?: RestaurantMenuItemsListQuery): string {
  if (!query) return apiPaths.restaurant.menuItems;

  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.category_id != null) params.set('category_id', String(query.category_id));
  if (query.dietary_type) params.set('dietary_type', query.dietary_type);

  const qs = params.toString();
  return qs ? `${apiPaths.restaurant.menuItems}?${qs}` : apiPaths.restaurant.menuItems;
}

/** `POST /api/v1/restaurant/menu/items/{item_id}/activate` */
export function restaurantMenuItemActivatePath(itemId: string | number): string {
  return `${restaurantMenuItemPath(itemId)}/activate`;
}

/** `POST /api/v1/restaurant/menu/items/{item_id}/deactivate` */
export function restaurantMenuItemDeactivatePath(itemId: string | number): string {
  return `${restaurantMenuItemPath(itemId)}/deactivate`;
}

/** `GET|POST /api/v1/restaurant/menu/items/{item_id}/variants` */
export function restaurantMenuItemVariantsPath(itemId: string | number): string {
  return `${restaurantMenuItemPath(itemId)}/variants`;
}

export type RestaurantMenuItemVariantsListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

export function restaurantMenuItemVariantsListPath(
  itemId: string | number,
  query?: RestaurantMenuItemVariantsListQuery,
): string {
  const base = restaurantMenuItemVariantsPath(itemId);
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `GET|PATCH /api/v1/restaurant/menu/items/{item_id}/variants/{variant_id}` */
export function restaurantMenuItemVariantPath(
  itemId: string | number,
  variantId: string | number,
): string {
  return `${restaurantMenuItemVariantsPath(itemId)}/${encodeURIComponent(String(variantId))}`;
}

/** `POST /api/v1/restaurant/menu/items/{item_id}/variants/{variant_id}/activate` */
export function restaurantMenuItemVariantActivatePath(
  itemId: string | number,
  variantId: string | number,
): string {
  return `${restaurantMenuItemVariantPath(itemId, variantId)}/activate`;
}

/** `POST /api/v1/restaurant/menu/items/{item_id}/variants/{variant_id}/deactivate` */
export function restaurantMenuItemVariantDeactivatePath(
  itemId: string | number,
  variantId: string | number,
): string {
  return `${restaurantMenuItemVariantPath(itemId, variantId)}/deactivate`;
}

/** `GET|POST /api/v1/restaurant/menu/items/{item_id}/images` */
export function restaurantMenuItemImagesPath(itemId: string | number): string {
  return `${restaurantMenuItemPath(itemId)}/images`;
}

/** `POST /api/v1/restaurant/menu/items/{item_id}/images/upload-url` */
export function restaurantMenuItemImageUploadUrlPath(itemId: string | number): string {
  return `${restaurantMenuItemImagesPath(itemId)}/upload-url`;
}

export type RestaurantMenuItemImagesListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

export function restaurantMenuItemImagesListPath(
  itemId: string | number,
  query?: RestaurantMenuItemImagesListQuery,
): string {
  const base = restaurantMenuItemImagesPath(itemId);
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `GET|PATCH /api/v1/restaurant/menu/items/{item_id}/images/{image_id}` */
export function restaurantMenuItemImagePath(
  itemId: string | number,
  imageId: string | number,
): string {
  return `${restaurantMenuItemImagesPath(itemId)}/${encodeURIComponent(String(imageId))}`;
}

/** `POST /api/v1/restaurant/menu/items/{item_id}/images/{image_id}/activate` */
export function restaurantMenuItemImageActivatePath(
  itemId: string | number,
  imageId: string | number,
): string {
  return `${restaurantMenuItemImagePath(itemId, imageId)}/activate`;
}

/** `POST /api/v1/restaurant/menu/items/{item_id}/images/{image_id}/deactivate` */
export function restaurantMenuItemImageDeactivatePath(
  itemId: string | number,
  imageId: string | number,
): string {
  return `${restaurantMenuItemImagePath(itemId, imageId)}/deactivate`;
}

export type RestaurantMenuItemTagsListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

/** `GET|POST /api/v1/restaurant/menu/item-tags` */
export function restaurantMenuItemTagsPath(): string {
  return apiPaths.restaurant.menuItemTags;
}

export function restaurantMenuItemTagsListPath(query?: RestaurantMenuItemTagsListQuery): string {
  const base = restaurantMenuItemTagsPath();
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `GET|PATCH /api/v1/restaurant/menu/item-tags/{tag_definition_id}` */
export function restaurantMenuItemTagPath(tagDefinitionId: string | number): string {
  return `${restaurantMenuItemTagsPath()}/${encodeURIComponent(String(tagDefinitionId))}`;
}

// Restaurant menus (menu entities) --------------------------------------------

export type RestaurantMenusListQuery = Readonly<{
  status?: 'active' | 'inactive';
  menu_type?: string;
}>;

/** `GET|POST /api/v1/restaurant/menus` */
export function restaurantMenusPath(): string {
  return apiPaths.restaurant.menus;
}

export function restaurantMenusListPath(query?: RestaurantMenusListQuery): string {
  const base = restaurantMenusPath();
  if (!query) return base;

  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.menu_type) params.set('menu_type', query.menu_type);

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** `GET|PATCH /api/v1/restaurant/menus/{menu_id}` */
export function restaurantMenuPath(menuId: string | number): string {
  return `${restaurantMenusPath()}/${encodeURIComponent(String(menuId))}`;
}

/** `POST /api/v1/restaurant/menus/{menu_id}/activate` */
export function restaurantMenuActivatePath(menuId: string | number): string {
  return `${restaurantMenuPath(menuId)}/activate`;
}

/** `POST /api/v1/restaurant/menus/{menu_id}/deactivate` */
export function restaurantMenuDeactivatePath(menuId: string | number): string {
  return `${restaurantMenuPath(menuId)}/deactivate`;
}

/** `GET|POST /api/v1/restaurant/menus/{menu_id}/category-assignments` */
export function restaurantMenuCategoryAssignmentsPath(menuId: string | number): string {
  return `${restaurantMenuPath(menuId)}/category-assignments`;
}

/** `PATCH|DELETE /api/v1/restaurant/menus/{menu_id}/category-assignments/{assignment_id}` */
export function restaurantMenuCategoryAssignmentPath(
  menuId: string | number,
  assignmentId: string | number,
): string {
  return `${restaurantMenuCategoryAssignmentsPath(menuId)}/${encodeURIComponent(String(assignmentId))}`;
}

/** `GET /api/v1/restaurant/menus/{menu_id}/tree` */
export function restaurantMenuTreePath(menuId: string | number): string {
  return `${restaurantMenuPath(menuId)}/tree`;
}

// Restaurant GST rates --------------------------------------------------------

export type RestaurantGstRatesListQuery = Readonly<{
  code?: string;
  active_only?: boolean;
}>;

/** `GET|POST /api/v1/restaurant/gst-rates` */
export function restaurantGstRatesPath(): string {
  return apiPaths.restaurant.gstRates;
}

export function restaurantGstRatesListPath(query?: RestaurantGstRatesListQuery): string {
  const base = restaurantGstRatesPath();
  if (!query) return base;

  const params = new URLSearchParams();
  if (query.code) params.set('code', query.code);
  if (query.active_only != null) params.set('active_only', String(query.active_only));

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** `GET /api/v1/restaurant/gst-rates/{gst_rate_id}` */
export function restaurantGstRatePath(gstRateId: string | number): string {
  return `${restaurantGstRatesPath()}/${encodeURIComponent(String(gstRateId))}`;
}

// Restaurant preparation stations ---------------------------------------------

export type RestaurantPreparationStationsListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

/** `GET|POST /api/v1/restaurant/preparation-stations` */
export function restaurantPreparationStationsPath(): string {
  return apiPaths.restaurant.preparationStations;
}

export function restaurantPreparationStationsListPath(
  query?: RestaurantPreparationStationsListQuery,
): string {
  const base = restaurantPreparationStationsPath();
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `GET|PATCH /api/v1/restaurant/preparation-stations/{preparation_station_id}` */
export function restaurantPreparationStationPath(stationId: string | number): string {
  return `${restaurantPreparationStationsPath()}/${encodeURIComponent(String(stationId))}`;
}

// Restaurant modifier groups ----------------------------------------------------

export type RestaurantModifierGroupsListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

export type RestaurantModifierOptionsListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

/** `GET|POST /api/v1/restaurant/modifier-groups` */
export function restaurantModifierGroupsPath(): string {
  return apiPaths.restaurant.modifierGroups;
}

export function restaurantModifierGroupsListPath(
  query?: RestaurantModifierGroupsListQuery,
): string {
  const base = restaurantModifierGroupsPath();
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `GET|PATCH /api/v1/restaurant/modifier-groups/{modifier_group_id}` */
export function restaurantModifierGroupPath(groupId: string | number): string {
  return `${restaurantModifierGroupsPath()}/${encodeURIComponent(String(groupId))}`;
}

/** `GET|POST /api/v1/restaurant/modifier-groups/{modifier_group_id}/options` */
export function restaurantModifierGroupOptionsPath(groupId: string | number): string {
  return `${restaurantModifierGroupPath(groupId)}/options`;
}

export function restaurantModifierGroupOptionsListPath(
  groupId: string | number,
  query?: RestaurantModifierOptionsListQuery,
): string {
  const base = restaurantModifierGroupOptionsPath(groupId);
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `PATCH /api/v1/restaurant/modifier-groups/{modifier_group_id}/options/{option_id}` */
export function restaurantModifierGroupOptionPath(
  groupId: string | number,
  optionId: string | number,
): string {
  return `${restaurantModifierGroupOptionsPath(groupId)}/${encodeURIComponent(String(optionId))}`;
}

// Restaurant branch menus -------------------------------------------------------

export type RestaurantBranchMenusListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

export type RestaurantBranchMenuTreeQuery = Readonly<{
  category_id?: number;
}>;

/** `GET|POST /api/v1/restaurant/branches/{branch_id}/menus` */
export function restaurantBranchMenusPath(branchId: string | number): string {
  return `/api/v1/restaurant/branches/${encodeURIComponent(String(branchId))}/menus`;
}

export function restaurantBranchMenusListPath(
  branchId: string | number,
  query?: RestaurantBranchMenusListQuery,
): string {
  const base = restaurantBranchMenusPath(branchId);
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `GET|PATCH|DELETE /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}` */
export function restaurantBranchMenuAssignmentPath(
  branchId: string | number,
  assignmentId: string | number,
): string {
  return `${restaurantBranchMenusPath(branchId)}/${encodeURIComponent(String(assignmentId))}`;
}

/** `GET /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}/tree` */
export function restaurantBranchMenuTreePath(
  branchId: string | number,
  assignmentId: string | number,
  query?: RestaurantBranchMenuTreeQuery,
): string {
  const base = `${restaurantBranchMenuAssignmentPath(branchId, assignmentId)}/tree`;
  if (query?.category_id == null) return base;
  return `${base}?category_id=${encodeURIComponent(String(query.category_id))}`;
}

/** `POST /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}/sync` */
export function restaurantBranchMenuSyncPath(
  branchId: string | number,
  assignmentId: string | number,
): string {
  return `${restaurantBranchMenuAssignmentPath(branchId, assignmentId)}/sync`;
}

/** `POST /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}/sync-variants` */
export function restaurantBranchMenuSyncVariantsPath(
  branchId: string | number,
  assignmentId: string | number,
): string {
  return `${restaurantBranchMenuAssignmentPath(branchId, assignmentId)}/sync-variants`;
}

/** `POST /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}/activate` */
export function restaurantBranchMenuActivatePath(
  branchId: string | number,
  assignmentId: string | number,
): string {
  return `${restaurantBranchMenuAssignmentPath(branchId, assignmentId)}/activate`;
}

/** `POST /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}/deactivate` */
export function restaurantBranchMenuDeactivatePath(
  branchId: string | number,
  assignmentId: string | number,
): string {
  return `${restaurantBranchMenuAssignmentPath(branchId, assignmentId)}/deactivate`;
}

export type RestaurantBranchMenuItemsListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

/** `GET /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}/items` */
export function restaurantBranchMenuItemsPath(
  branchId: string | number,
  assignmentId: string | number,
): string {
  return `${restaurantBranchMenuAssignmentPath(branchId, assignmentId)}/items`;
}

export function restaurantBranchMenuItemsListPath(
  branchId: string | number,
  assignmentId: string | number,
  query?: RestaurantBranchMenuItemsListQuery,
): string {
  const base = restaurantBranchMenuItemsPath(branchId, assignmentId);
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `GET|PATCH /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}/items/{item_override_id}` */
export function restaurantBranchMenuItemOverridePath(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): string {
  return `${restaurantBranchMenuItemsPath(branchId, assignmentId)}/${encodeURIComponent(String(itemOverrideId))}`;
}

/** `POST /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}/items/{item_override_id}/activate` */
export function restaurantBranchMenuItemActivatePath(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): string {
  return `${restaurantBranchMenuItemOverridePath(branchId, assignmentId, itemOverrideId)}/activate`;
}

/** `POST /api/v1/restaurant/branches/{branch_id}/menus/{assignment_id}/items/{item_override_id}/deactivate` */
export function restaurantBranchMenuItemDeactivatePath(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): string {
  return `${restaurantBranchMenuItemOverridePath(branchId, assignmentId, itemOverrideId)}/deactivate`;
}

// Branch floors, sections, and dining tables ----------------------------------

/** `GET|POST /api/v1/branches/{branch_id}/floors` */
export function branchFloorsPath(branchId: string | number, floorId?: string | number): string {
  const base = `/api/v1/branches/${encodeURIComponent(String(branchId))}/floors`;
  return floorId == null ? base : `${base}/${encodeURIComponent(String(floorId))}`;
}

/** `GET|POST /api/v1/branches/{branch_id}/floors/{floor_id}/sections` */
export function branchFloorSectionsPath(
  branchId: string | number,
  floorId: string | number,
  sectionId?: string | number,
): string {
  const base = `${branchFloorsPath(branchId, floorId)}/sections`;
  return sectionId == null ? base : `${base}/${encodeURIComponent(String(sectionId))}`;
}

/** `GET|POST /api/v1/branches/{branch_id}/floors/{floor_id}/sections/{section_id}/tables` */
export function branchFloorSectionTablesPath(
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  tableId?: string | number,
): string {
  const base = `${branchFloorSectionsPath(branchId, floorId, sectionId)}/tables`;
  return tableId == null ? base : `${base}/${encodeURIComponent(String(tableId))}`;
}

// Restaurant branch floors & tables ---------------------------------------------

export type RestaurantBranchFloorsListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

export type RestaurantBranchTablesListQuery = Readonly<{
  status?: 'active' | 'inactive';
}>;

/** `GET|POST /api/v1/restaurant/branches/{branch_id}/floors` */
export function restaurantBranchFloorsPath(branchId: string | number): string {
  return `/api/v1/restaurant/branches/${encodeURIComponent(String(branchId))}/floors`;
}

export function restaurantBranchFloorsListPath(
  branchId: string | number,
  query?: RestaurantBranchFloorsListQuery,
): string {
  const base = restaurantBranchFloorsPath(branchId);
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `GET|PATCH|DELETE /api/v1/restaurant/branches/{branch_id}/floors/{floor_id}` */
export function restaurantBranchFloorPath(
  branchId: string | number,
  floorId: string | number,
): string {
  return `${restaurantBranchFloorsPath(branchId)}/${encodeURIComponent(String(floorId))}`;
}

/** `GET|POST /api/v1/restaurant/branches/{branch_id}/floors/{floor_id}/tables` */
export function restaurantBranchFloorTablesPath(
  branchId: string | number,
  floorId: string | number,
): string {
  return `${restaurantBranchFloorPath(branchId, floorId)}/tables`;
}

export function restaurantBranchFloorTablesListPath(
  branchId: string | number,
  floorId: string | number,
  query?: RestaurantBranchTablesListQuery,
): string {
  const base = restaurantBranchFloorTablesPath(branchId, floorId);
  if (!query?.status) return base;
  return `${base}?status=${encodeURIComponent(query.status)}`;
}

/** `GET|PATCH|DELETE /api/v1/restaurant/branches/{branch_id}/floors/{floor_id}/tables/{table_id}` */
export function restaurantBranchFloorTablePath(
  branchId: string | number,
  floorId: string | number,
  tableId: string | number,
): string {
  return `${restaurantBranchFloorTablesPath(branchId, floorId)}/${encodeURIComponent(String(tableId))}`;
}
