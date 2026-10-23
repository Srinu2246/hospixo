import {
  menuItemTagDefinitionSchema,
  type MenuItemTagDefinition,
} from '@/lib/schemas/menu/menuItemTagsSchema';

const CREATED_AT = '2026-10-12T10:00:00.000Z';

export const MOCK_MENU_ITEM_TAGS: MenuItemTagDefinition[] = [
  menuItemTagDefinitionSchema.parse({
    id: 1,
    organization_id: 126,
    company_id: 94,
    branch_id: null,
    catalogue_scope: 'company',
    name: 'spicy',
    code: 'SPICY',
    status: 'active',
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
  }),
  menuItemTagDefinitionSchema.parse({
    id: 2,
    organization_id: 126,
    company_id: 94,
    branch_id: null,
    catalogue_scope: 'company',
    name: 'chef-special',
    code: 'CHEF_SPECIAL',
    status: 'active',
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
  }),
  menuItemTagDefinitionSchema.parse({
    id: 3,
    organization_id: 126,
    company_id: 94,
    branch_id: null,
    catalogue_scope: 'company',
    name: 'vegan',
    code: 'VEGAN',
    status: 'active',
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
  }),
  menuItemTagDefinitionSchema.parse({
    id: 4,
    organization_id: 126,
    company_id: 94,
    branch_id: 49,
    catalogue_scope: 'branch',
    name: 'gluten-free',
    code: 'GLUTEN_FREE',
    status: 'active',
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
  }),
];
