'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Input } from '@/components/shared/form-fields/Input';
import {
  LabeledDropdown,
  SetupCard,
  StatusRow,
} from '@/components/features/floor-and-table-setup/SetupFields';
import { screen } from '@/lib/theme/mui/breakpoints';
import type {
  FloorDetails,
  FloorType,
} from '@/features/management/floor-and-table-setup/types/floorSetup';

const floorTypes: { id: FloorType; label: string }[] = [
  { id: 'indoor', label: 'Indoor Dining' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'vip', label: 'VIP' },
  { id: 'banquet', label: 'Banquet' },
];

export function FloorCreationStep({
  details,
  nameError,
  onChange,
}: Readonly<{
  details: FloorDetails;
  nameError: string | null;
  onChange: (details: FloorDetails) => void;
}>) {
  return (
    <SetupCard>
      <Typography
        component="h2"
        sx={{
          fontWeight: 700,
          fontSize: { [screen.mobile]: '1.05rem', [screen.desktop]: '1.125rem' },
          mb: 2.5,
        }}
      >
        <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
          Floor Details
        </Box>
        <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
          Floor Creation
        </Box>
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <Input
          id="floor-name"
          label="Floor Name"
          placeholder="Ground Floor"
          value={details.name}
          error={Boolean(nameError)}
          helperText={nameError ?? undefined}
          onChange={(event) => onChange({ ...details, name: event.target.value })}
        />
        <Input
          id="floor-code"
          label="Floor Code"
          placeholder="GF-001"
          helperText="Assigned code for orders routing"
          value={details.code}
          onChange={(event) => onChange({ ...details, code: event.target.value })}
        />
        <LabeledDropdown
          label="Floor Type"
          options={floorTypes}
          value={details.type || 'indoor'}
          onChange={(type) => onChange({ ...details, type })}
        />
      </Box>
      <Box sx={{ mt: 2.5 }}>
        <Input
          id="floor-description"
          label="Description"
          placeholder="Enter floor description"
          value={details.description}
          multiline
          rows={4}
          onChange={(event) => onChange({ ...details, description: event.target.value })}
        />
      </Box>
      <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <StatusRow
          title="Floor Status"
          hint="Toggle active visibility on checkout POS channels"
          checked={details.active}
          onChange={(active) => onChange({ ...details, active })}
        />
      </Box>
    </SetupCard>
  );
}
