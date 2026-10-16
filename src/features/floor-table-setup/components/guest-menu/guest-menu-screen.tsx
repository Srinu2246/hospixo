'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';

import { guestMenuCopy } from '@/features/floor-table-setup/config/guest-menu';
import { usePublicRestaurantMenu } from '@/features/floor-table-setup/hooks/use-public-restaurant-menu';
import { parsePositiveIntId } from '@/features/floor-table-setup/lib/parse-public-menu-ids';

function readMenuQuery(searchParams: URLSearchParams): Partial<{
  branch_id: number;
  floor_id: number;
  section_id: number;
  menu_id: number;
}> {
  return {
    branch_id: parsePositiveIntId(searchParams.get('branch_id')) ?? undefined,
    floor_id: parsePositiveIntId(searchParams.get('floor_id')) ?? undefined,
    section_id: parsePositiveIntId(searchParams.get('section_id')) ?? undefined,
    menu_id: parsePositiveIntId(searchParams.get('menu_id')) ?? undefined,
  };
}

export function GuestMenuScreen() {
  const searchParams = useSearchParams();
  const query = readMenuQuery(searchParams);
  const { data, isPending, isError, error } = usePublicRestaurantMenu(query);

  if (
    query.branch_id == null ||
    query.floor_id == null ||
    query.section_id == null ||
    query.menu_id == null
  ) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">{guestMenuCopy.missingParams}</Alert>
      </Container>
    );
  }

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress aria-label={guestMenuCopy.loading} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : guestMenuCopy.errorTitle}
        </Alert>
      </Container>
    );
  }

  const { location, menu, currency, categories } = data;

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {menu.name}
          </Typography>
          {menu.description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {menu.description}
            </Typography>
          ) : null}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {guestMenuCopy.locationLabel(
              location.branch_name,
              location.floor_name,
              location.section_name,
            )}
          </Typography>
        </Box>

        {categories.length === 0 ? (
          <Alert severity="info">{guestMenuCopy.emptyCategories}</Alert>
        ) : (
          categories.map((category) => (
            <Box key={`${category.display_order}-${category.name}`}>
              <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                {category.name}
              </Typography>
              {category.description ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {category.description}
                </Typography>
              ) : null}
              <Stack spacing={1.5}>
                {category.items.map((item) => (
                  <Box
                    key={item.name}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                      {item.description ? (
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      ) : null}
                    </Box>
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                      {currency} {item.effective_price}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))
        )}
      </Stack>
    </Container>
  );
}
