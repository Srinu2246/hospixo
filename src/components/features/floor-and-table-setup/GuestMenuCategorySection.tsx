'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { PublicRestaurantMenuData } from '@/lib/schemas/floor-and-table-setup/publicRestaurantMenuSchema';

type Category = PublicRestaurantMenuData['categories'][number];

export interface GuestMenuCategorySectionProps {
  category: Category;
  currency: string;
}

export function GuestMenuCategorySection({
  category,
  currency,
}: Readonly<GuestMenuCategorySectionProps>) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        {category.name}
      </Typography>
      <Stack spacing={1.5}>
        {category.items.map((item) => (
          <Box
            key={`${category.name}-${item.name}`}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              py: 0.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.name}
              </Typography>
              {item.description ? (
                <Typography variant="caption" color="text.secondary">
                  {item.description}
                </Typography>
              ) : null}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, flexShrink: 0 }}>
              {currency} {item.effective_price}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
