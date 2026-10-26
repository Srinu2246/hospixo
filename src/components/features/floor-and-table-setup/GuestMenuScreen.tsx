'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';

import { GuestMenuCategorySection } from '@/components/features/floor-and-table-setup/GuestMenuCategorySection';
import { Loading } from '@/components/shared/ui/Loading';
import { parsePositiveIntId } from '@/lib/helpers/floor-and-table-setup/guestMenuUrl';
import { usePublicRestaurantMenu } from '@/lib/hooks/floor-and-table-setup/usePublicRestaurantMenu';
import { guestMenuCopy } from '@/lib/strings/floor-and-table-setup/guestMenuCopy';

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

/** Public guest menu view (section QR deep link). */
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
    return <Loading message={guestMenuCopy.loading} fullPage />;
  }

  if (isError) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : guestMenuCopy.errorTitle}
        </Alert>
      </Container>
    );
  }

  if (!data?.categories.length) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="info">{guestMenuCopy.emptyCategories}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {data.menu.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {guestMenuCopy.locationLabel(
              data.location.branch_name,
              data.location.floor_name,
              data.location.section_name,
            )}
          </Typography>
          {data.menu.description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {data.menu.description}
            </Typography>
          ) : null}
        </Box>

        {data.categories.map((category) => (
          <GuestMenuCategorySection
            key={category.name}
            category={category}
            currency={data.currency}
          />
        ))}
      </Stack>
    </Container>
  );
}
