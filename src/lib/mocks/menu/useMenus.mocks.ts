import { parseMenuAssignments, type MenuAssignment } from '@/lib/schemas/menu/menus/menuListSchema';

export type { MenuAssignment };

export const MENU_STATUS_FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
] as const;

export type MenuStatusFilter = (typeof MENU_STATUS_FILTER_OPTIONS)[number]['id'];

/** Raw API rows from GET menus — parsed from live paged envelope. */
export const MOCK_MENUS: MenuAssignment[] = parseMenuAssignments({
  success: true,
  data: {
    items: [
      {
        id: 19,
        organization_id: 126,
        company_id: 94,
        branch_id: 49,
        menu_id: 13,
        display_order: 0,
        is_default: true,
        status: 'active',
        menu: {
          id: 13,
          organization_id: 126,
          company_id: 94,
          catalogue_scope: 'company',
          branch_id: null,
          name: 'All Day',
          code: 'DEFAULT',
          description: 'Default company menu with all active categories',
          menu_type: 'all',
          display_order: 0,
          status: 'active',
          branch_assignment_id: null,
          created_at: '2026-10-07T20:57:45.441832Z',
          updated_at: '2026-10-07T20:57:45.441832Z',
        },
        created_at: '2026-10-09T09:28:38.785713Z',
        updated_at: '2026-10-09T09:28:38.785713Z',
      },
      {
        id: 20,
        organization_id: 126,
        company_id: 94,
        branch_id: 49,
        menu_id: 15,
        display_order: 0,
        is_default: false,
        status: 'active',
        menu: {
          id: 15,
          organization_id: 126,
          company_id: 94,
          catalogue_scope: 'branch',
          branch_id: 49,
          name: 'Breakfast',
          code: 'BKFAST',
          description: null,
          menu_type: 'all',
          display_order: 0,
          status: 'active',
          branch_assignment_id: null,
          created_at: '2026-10-09T09:47:38.011583Z',
          updated_at: '2026-10-09T09:47:38.011583Z',
        },
        created_at: '2026-10-09T09:47:38.011583Z',
        updated_at: '2026-10-09T09:47:38.011583Z',
      },
    ],
    total: 2,
    page: 1,
    page_size: 15,
  },
  message: 'Branch menus retrieved',
  request_id: '6286218c-c40e-4665-837a-0ad716639d23',
});
