'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Search } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import type { ActiveStatusFilter } from '@/features/management/floor-and-table-setup/types/floorSetup';

const statusOptions: ReadonlyArray<{ id: ActiveStatusFilter; label: string }> = [
  { id: 'all', label: 'Status' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

const controlSx = {
  width: 'auto',
  minWidth: 112,
  height: 44,
  flexShrink: 0,
  bgcolor: 'background.paper',
} as const;

export function TablesToolbar({
  query,
  onQueryChange,
  sections,
  sectionId,
  onSectionChange,
  status,
  onStatusChange,
  onBulkEdit,
  onBulkGenerate,
  bulkEditDisabled = false,
  bulkGenerateDisabled = false,
  searchId,
}: Readonly<{
  query: string;
  onQueryChange: (value: string) => void;
  sections: readonly { id: string; name: string }[];
  sectionId: string;
  onSectionChange: (sectionId: string) => void;
  status: ActiveStatusFilter;
  onStatusChange: (status: ActiveStatusFilter) => void;
  onBulkEdit: () => void;
  onBulkGenerate: () => void;
  bulkEditDisabled?: boolean;
  bulkGenerateDisabled?: boolean;
  searchId: string;
}>) {
  const sectionOptions = [
    { id: 'all', label: 'All sections' },
    ...sections.map((section) => ({ id: section.id, label: section.name })),
  ];

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      <Box sx={{ flex: '1 1 220px', maxWidth: { xs: '100%', md: 320 }, minWidth: 180 }}>
        <Input
          id={searchId}
          fullWidth
          placeholder="Search tables..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          startIcon={<Search size={16} />}
        />
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          ml: { md: 'auto' },
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Dropdown
            options={sectionOptions}
            value={sectionId}
            onChange={onSectionChange}
            size="large"
            minWidth={132}
            sx={controlSx}
          />
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          <Dropdown
            options={statusOptions}
            value={status}
            onChange={onStatusChange}
            size="large"
            minWidth={112}
            sx={controlSx}
          />
        </Box>
        <ActionButton
          variant="outlined"
          size="large"
          disabled={bulkEditDisabled}
          onClick={onBulkEdit}
          sx={{ flexShrink: 0, bgcolor: 'background.paper' }}
        >
          Bulk Edit
        </ActionButton>
        <ActionButton
          variant="outlined"
          size="large"
          disabled={bulkGenerateDisabled}
          onClick={onBulkGenerate}
          sx={{ flexShrink: 0, bgcolor: 'background.paper' }}
        >
          Bulk Generate
        </ActionButton>
      </Stack>
    </Stack>
  );
}
