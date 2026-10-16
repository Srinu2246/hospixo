import {
  publicRestaurantMenuDataSchema,
  type PublicRestaurantMenuData,
} from '@/lib/schemas/floor-and-table-setup/publicRestaurantMenuSchema';

export const MOCK_PUBLIC_RESTAURANT_MENU: PublicRestaurantMenuData =
  publicRestaurantMenuDataSchema.parse({
    location: {
      branch_name: 'Hotel Mayukha',
      floor_name: 'Ground Floor',
      section_name: 'Main Dining',
    },
    menu: {
      name: 'Dine-In Menu',
      description: 'Scan to browse and order from your table.',
    },
    currency: 'INR',
    categories: [
      {
        name: 'Starters',
        description: 'Light bites to begin your meal',
        display_order: 0,
        items: [
          {
            name: 'Crispy Corn',
            description: 'Tossed with spices and herbs',
            dietary_type: 'veg',
            effective_price: 220,
            variants: [],
            modifier_groups: [],
            images: [],
          },
          {
            name: 'Chicken Wings',
            description: 'Smoky grill glaze',
            dietary_type: 'non_veg',
            effective_price: 320,
            variants: [],
            modifier_groups: [],
            images: [],
          },
        ],
      },
      {
        name: 'Mains',
        description: '',
        display_order: 1,
        items: [
          {
            name: 'Paneer Butter Masala',
            description: 'Rich tomato gravy',
            dietary_type: 'veg',
            effective_price: 340,
            variants: [
              {
                name: 'Regular',
                is_default: true,
                effective_final_price: 340,
                display_order: 0,
              },
            ],
            modifier_groups: [],
            images: [],
          },
        ],
      },
    ],
  });
