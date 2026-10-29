import {
  kitchenBoardResponseSchema,
  kitchenBoardResponseToViewModel,
  kitchenDisplayListSchema,
  type KitchenBoardResponse,
} from '@/lib/schemas/kitchen-display/kitchenDisplaySchema';
import type { KitchenOrderItem } from '@/types/kitchen-display';
import type { HttpMethod, QueryParams } from '@/services/api/types';

// ============================================================================
// 1. Raw OpenAPI Backend Mock Data (KitchenBoardResponse)
// ============================================================================

export const MOCK_KITCHEN_BOARD_RESPONSE: KitchenBoardResponse = kitchenBoardResponseSchema.parse({
  branch_id: 49,
  business_date: '2026-10-14',
  preparation_station: {
    id: 1,
    name: 'Main Kitchen',
    code: 'MAIN',
  },
  counts: {
    new_orders: 4,
    preparing: 2,
    ready: 2,
  },
  new_orders: [
    {
      order_id: 1023,
      order_number: '1023',
      order_type: 'dine_in',
      table_id: 12,
      table_name: 'T-12',
      display_label: 'Table 12',
      guest_count: 2,
      kot_number: 'KOT-1023',
      status: 'submitted',
      submitted_at: new Date(Date.now() - 280 * 1000).toISOString(),
      items: [
        {
          order_item_id: 10231,
          item_name: 'Paneer Tikka',
          quantity: 1,
          category_name: 'Starters',
          item_status: 'submitted',
          tags: ['HIGH'],
          modifiers: [],
        },
        {
          order_item_id: 10232,
          item_name: 'Paneer Tikka',
          quantity: 1,
          category_name: 'Starters',
          item_status: 'submitted',
          tags: ['HIGH'],
          modifiers: [],
        },
        {
          order_item_id: 10233,
          item_name: 'Paneer Tikka',
          quantity: 1,
          category_name: 'Starters',
          item_status: 'submitted',
          tags: ['HIGH'],
          modifiers: [],
        },
        {
          order_item_id: 10234,
          item_name: 'Paneer Tikka',
          quantity: 1,
          category_name: 'Starters',
          item_status: 'submitted',
          tags: ['HIGH'],
          modifiers: [],
        },
        {
          order_item_id: 10235,
          item_name: 'Paneer Tikka',
          quantity: 1,
          category_name: 'Starters',
          item_status: 'submitted',
          tags: ['HIGH'],
          modifiers: [],
        },
        {
          order_item_id: 10236,
          item_name: 'Paneer Tikka',
          quantity: 1,
          category_name: 'Starters',
          item_status: 'submitted',
          tags: ['HIGH'],
          modifiers: [],
        },
        {
          order_item_id: 10237,
          item_name: 'Fresh Lime Soda',
          quantity: 2,
          category_name: 'Drinks',
          item_status: 'submitted',
          tags: [],
          modifiers: [],
        },
      ],
    },
    {
      order_id: 1024,
      order_number: '1024',
      order_type: 'dine_in',
      table_id: 4,
      table_name: 'T-04',
      display_label: 'Table 04',
      guest_count: 3,
      kot_number: 'KOT-1024',
      status: 'submitted',
      submitted_at: new Date(Date.now() - 35 * 1000).toISOString(),
      items: [
        {
          order_item_id: 10241,
          item_name: 'Mutton Rogan Josh',
          quantity: 1,
          category_name: 'Mains',
          item_status: 'submitted',
          tags: ['NORMAL'],
          modifiers: [],
        },
        {
          order_item_id: 10242,
          item_name: 'Garlic Naan',
          quantity: 3,
          category_name: 'Mains',
          item_status: 'submitted',
          tags: ['NORMAL'],
          modifiers: [],
        },
      ],
    },
  ],
  preparing: [
    {
      order_id: 1021,
      order_number: '1021',
      order_type: 'dine_in',
      table_id: 2,
      table_name: 'T-02',
      display_label: 'Table 02',
      guest_count: 2,
      kot_number: 'KOT-1021',
      status: 'preparing',
      preparing_at: new Date(Date.now() - 718 * 1000).toISOString(),
      items: [
        {
          order_item_id: 10211,
          item_name: 'Chicken Biryani',
          quantity: 2,
          category_name: 'Mains',
          item_status: 'preparing',
          tags: ['HIGH'],
          modifiers: [],
        },
        {
          order_item_id: 10212,
          item_name: 'Coke',
          quantity: 2,
          category_name: 'Drinks',
          item_status: 'preparing',
          tags: ['HIGH'],
          modifiers: [],
        },
      ],
    },
    {
      order_id: 1022,
      order_number: '1022',
      order_type: 'dine_in',
      table_id: 11,
      table_name: 'T-11',
      display_label: 'Table 11',
      guest_count: 4,
      kot_number: 'KOT-1022',
      status: 'preparing',
      preparing_at: new Date(Date.now() - 570 * 1000).toISOString(),
      items: [
        {
          order_item_id: 10221,
          item_name: 'Dal Makhani',
          quantity: 1,
          category_name: 'Mains',
          item_status: 'preparing',
          tags: ['NORMAL'],
          modifiers: [],
        },
        {
          order_item_id: 10222,
          item_name: 'Butter Naan',
          quantity: 4,
          category_name: 'Mains',
          item_status: 'preparing',
          tags: ['NORMAL'],
          modifiers: [],
        },
      ],
    },
  ],
  ready: [
    {
      order_id: 1019,
      order_number: '1019',
      order_type: 'takeaway',
      table_id: null,
      table_name: null,
      display_label: 'Takeaway',
      guest_count: 1,
      kot_number: 'KOT-1019',
      status: 'ready',
      ready_at: new Date(Date.now() - 120 * 1000).toISOString(),
      items: [
        {
          order_item_id: 10191,
          item_name: 'Veg Fried Rice',
          quantity: 1,
          category_name: 'Mains',
          item_status: 'ready',
          tags: ['NORMAL'],
          modifiers: [],
        },
        {
          order_item_id: 10192,
          item_name: 'Crispy Corn',
          quantity: 1,
          category_name: 'Starters',
          item_status: 'ready',
          tags: ['NORMAL'],
          modifiers: [],
        },
      ],
    },
    {
      order_id: 1020,
      order_number: '1020',
      order_type: 'takeaway',
      table_id: null,
      table_name: null,
      display_label: 'Takeaway',
      guest_count: 1,
      kot_number: 'KOT-1020',
      status: 'ready',
      ready_at: new Date(Date.now() - 120 * 1000).toISOString(),
      items: [
        {
          order_item_id: 10201,
          item_name: 'Chicken 65',
          quantity: 2,
          category_name: 'Starters',
          item_status: 'ready',
          tags: ['HIGH'],
          modifiers: [],
        },
      ],
    },
  ],
});

// ============================================================================
// 2. Client Mock Rows Derived directly from the OpenAPI response
// ============================================================================

const parsedViewModel = kitchenBoardResponseToViewModel(MOCK_KITCHEN_BOARD_RESPONSE);

export const MOCK_KITCHEN_ORDERS: KitchenOrderItem[] = kitchenDisplayListSchema.parse(
  parsedViewModel.orders,
);

// ============================================================================
// 3. Handler Mock Resolver for serverClient / handler.ts
// ============================================================================

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

const KITCHEN_BOARD_REGEX = /^\/v1\/branches\/(\d+)\/kitchen-board$/;
const KITCHEN_STATUS_REGEX = /^\/v1\/branches\/(\d+)\/orders\/(\d+)\/kitchen-status$/;

export function resolveKitchenDisplayMock(request: MockRequest): unknown | undefined {
  if (KITCHEN_BOARD_REGEX.test(request.path) && request.method === 'GET') {
    return {
      success: true,
      message: 'OK',
      request_id: 'mock-kds',
      data: MOCK_KITCHEN_BOARD_RESPONSE,
    };
  }

  if (KITCHEN_STATUS_REGEX.test(request.path) && request.method === 'PATCH') {
    const orderMatch = KITCHEN_STATUS_REGEX.exec(request.path);
    const orderId = orderMatch ? Number(orderMatch[2]) : 0;
    const body =
      request.body && typeof request.body === 'object'
        ? (request.body as {
            expected_version?: number;
            action?: string;
            item_id?: number;
          })
        : {};
    const expected = body.expected_version ?? 1;
    const status =
      body.action === 'complete' || body.action === 'served'
        ? 'served'
        : body.action === 'mark_ready'
          ? 'ready'
          : 'preparing';
    const itemId = typeof body.item_id === 'number' && body.item_id > 0 ? body.item_id : undefined;
    return {
      success: true,
      message: 'Kitchen status updated successfully',
      request_id: 'mock-status-update',
      data: {
        order_id: orderId,
        item_id: itemId,
        expected_version: expected,
        status,
        updated_item_ids: itemId != null ? [itemId] : [],
        order: {
          id: orderId,
          version: expected + 1,
          order_number: String(orderId),
          status,
          kitchen_badge: status,
          items: [],
        },
      },
    };
  }

  return undefined;
}
