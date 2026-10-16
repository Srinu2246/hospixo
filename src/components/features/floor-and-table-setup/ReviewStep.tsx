'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { LayoutGrid } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { SetupCard } from '@/components/features/floor-and-table-setup/SetupFields';
import { screen } from '@/lib/theme/mui/breakpoints';
import { floorTypeLabel, sectionStats } from '@/lib/helpers/floorAndTableSetup';
import type {
  FloorDetails,
  SectionDraft,
  TableDraft,
  WizardStep,
} from '@/features/management/floor-and-table-setup/types/floorSetup';

export function ReviewStep({
  details,
  sections,
  tables,
  onEdit,
}: Readonly<{
  details: FloorDetails;
  sections: readonly SectionDraft[];
  tables: readonly TableDraft[];
  onEdit: (step: WizardStep) => void;
}>) {
  return (
    <SetupCard>
      <Typography
        component="h2"
        sx={{
          fontWeight: 800,
          fontSize: { [screen.mobile]: '1.05rem', [screen.desktop]: '1.2rem' },
        }}
      >
        Review Floor Details
      </Typography>
      <Typography sx={{ color: 'text.secondary', mt: 0.5, mb: 2.5 }}>
        Please review all settings before creating the floor.
      </Typography>
      <Stack spacing={2}>
        <ReviewPanel title="Floor Details" onEdit={() => onEdit('floor')}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                [screen.mobile]: '1fr 1fr',
                [screen.desktop]: '140px 1fr 140px 1fr',
              },
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <Label>Floor Name</Label>
            <Value>{details.name}</Value>
            <Label>Floor Code</Label>
            <Value>{details.code}</Value>
            <Label>Floor Type</Label>
            <Value>{floorTypeLabel(details.type)}</Value>
            <Label>Floor Status</Label>
            <Switch checked={details.active} disabled color="primary" />
          </Box>
        </ReviewPanel>

        <ReviewPanel title="Sections Review" onEdit={() => onEdit('section')}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 0.6fr 0.6fr 0.7fr',
                gap: 1,
                px: 1.5,
                py: 1,
                bgcolor: 'action.hover',
                borderRadius: '8px',
                minWidth: 520,
              }}
            >
              {['Section Name', 'Section Code', 'Tables', 'Seats', 'Status'].map((label) => (
                <Typography
                  key={label}
                  sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em' }}
                >
                  {label.toUpperCase()}
                </Typography>
              ))}
            </Box>
            {sections.map((section) => {
              const stats = sectionStats(section.id, tables);
              return (
                <Box
                  key={section.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr 0.6fr 0.6fr 0.7fr',
                    gap: 1,
                    px: 1.5,
                    py: 1.5,
                    minWidth: 520,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>{section.name}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{section.code}</Typography>
                  <Typography>{stats.tables}</Typography>
                  <Typography>{stats.seats}</Typography>
                  <Switch checked={section.active} disabled color="primary" />
                </Box>
              );
            })}
          </Box>
        </ReviewPanel>

        <ReviewPanel title="" onEdit={() => onEdit('table')}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LayoutGrid size={16} />
            <Typography sx={{ fontWeight: 800 }}>{tables.length} Tables Configured</Typography>
          </Stack>
        </ReviewPanel>
      </Stack>
    </SetupCard>
  );
}

function ReviewPanel({
  title,
  onEdit,
  children,
}: Readonly<{ title: string; onEdit: () => void; children: ReactNode }>) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', p: 2 }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: title ? 1.5 : 0 }}
      >
        <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
        <ActionButton variant="text" size="small" onClick={onEdit}>
          Edit
        </ActionButton>
      </Stack>
      {children}
    </Box>
  );
}

function Label({ children }: Readonly<{ children: ReactNode }>) {
  return <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{children}</Typography>;
}

function Value({ children }: Readonly<{ children: ReactNode }>) {
  return <Typography sx={{ fontWeight: 800 }}>{children}</Typography>;
}
