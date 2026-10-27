'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ChevronLeft, Grid3x3, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { Modal } from '@/components/shared/ui/Modal';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { LabeledSwitch } from '@/components/shared/form-fields/LabeledSwitch';
import { screen } from '@/lib/theme/mui/breakpoints';
import { filterByName, sectionStats, tableSeatSummary } from '@/lib/helpers/floorAndTableSetup';
import type {
  SectionDraft,
  SectionInput,
  TableDraft,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import {
  canSubmitSetupForm,
  sectionFormSchema,
  type SectionFormValues,
  type SetupFormMode,
} from '@/lib/schemas/floor-and-table-setup/floorSetupFormSchema';

const emptySection: SectionInput = {
  name: '',
  code: '',
  description: '',
  active: true,
};

export function SectionStep({
  floorName,
  sections,
  tables,
  onBackToFloor,
  onCreate,
  onUpdate,
  onDelete,
}: Readonly<{
  floorName: string;
  sections: readonly SectionDraft[];
  tables: readonly TableDraft[];
  onBackToFloor: () => void;
  onCreate: (input: SectionInput) => void;
  onUpdate: (id: string, input: SectionInput) => void;
  onDelete: (id: string) => void;
}>) {
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<SectionDraft | null | 'new'>(null);
  const visible = filterByName(sections, query);

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <ActionButton variant="icon" ariaLabel="Back" onClick={onBackToFloor}>
          <ChevronLeft size={18} />
        </ActionButton>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { [screen.mobile]: '1.05rem', [screen.desktop]: '1.25rem' },
          }}
        >
          {floorName}
        </Typography>
      </Stack>

      {sections.length === 0 ? (
        <EmptySections onCreate={() => setEditor('new')} />
      ) : (
        <Stack spacing={2}>
          <Stack
            direction={{ [screen.mobile]: 'column', [screen.desktop]: 'row' }}
            spacing={2}
            sx={{ alignItems: { [screen.desktop]: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>Sections List</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                Manage and organize dining zones within this floor
              </Typography>
            </Box>
            <ActionButton
              startIcon={<Plus size={16} />}
              onClick={() => setEditor('new')}
              sx={{ width: { [screen.mobile]: '100%', [screen.desktop]: 'auto' } }}
            >
              Add Section
            </ActionButton>
          </Stack>
          <Box sx={{ width: '100%', maxWidth: { [screen.desktop]: 360 } }}>
            <Input
              id="section-search"
              placeholder="Search sections..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              startIcon={<Search size={16} />}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { [screen.mobile]: '1fr', [screen.tablet]: '1fr 1fr' },
              gap: 2,
            }}
          >
            {visible.map((section) => {
              const stats = sectionStats(section.id, tables);
              return (
                <Box
                  key={section.id}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ fontWeight: 800 }}>{section.name}</Typography>
                    <StatusChip
                      label={section.active ? 'Active' : 'Inactive'}
                      variantType={section.active ? 'success' : 'danger'}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      mt: 1.5,
                    }}
                  >
                    {tableSeatSummary(stats.tables, stats.seats)}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      justifyContent: 'flex-end',
                      mt: 1.5,
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ActionButton
                      variant="icon"
                      size="small"
                      ariaLabel="Edit section"
                      onClick={() => setEditor(section)}
                    >
                      <Pencil size={16} />
                    </ActionButton>
                    <ActionButton
                      variant="icon"
                      size="small"
                      ariaLabel="Delete section"
                      onClick={() => onDelete(section.id)}
                    >
                      <Trash2 size={16} />
                    </ActionButton>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Stack>
      )}

      <SectionDialog
        open={editor !== null}
        mode={editor && editor !== 'new' ? 'edit' : 'add'}
        initial={editor && editor !== 'new' ? editor : emptySection}
        title={editor && editor !== 'new' ? 'Edit section' : 'Create New Section'}
        submitLabel="Save Section"
        onClose={() => setEditor(null)}
        onSubmit={(input) => {
          if (editor && editor !== 'new') onUpdate(editor.id, input);
          else onCreate(input);
          setEditor(null);
        }}
      />
    </Stack>
  );
}

function EmptySections({ onCreate }: Readonly<{ onCreate: () => void }>) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 8, px: 2 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(51, 84, 244, 0.12)',
          color: 'primary.main',
        }}
      >
        <Grid3x3 size={28} />
      </Box>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { [screen.mobile]: '1.1rem', [screen.desktop]: '1.25rem' },
        }}
      >
        No Sections Created Yet
      </Typography>
      <Typography sx={{ color: 'text.secondary', maxWidth: 460, lineHeight: 1.6 }}>
        Organize your floor by creating sections to group tables, assign servers, and manage dining
        areas efficiently.
      </Typography>
      <ActionButton startIcon={<Plus size={16} />} onClick={onCreate}>
        Create Section
      </ActionButton>
    </Stack>
  );
}

function SectionDialog({
  open,
  mode,
  initial,
  title,
  submitLabel,
  onClose,
  onSubmit,
}: Readonly<{
  open: boolean;
  mode: SetupFormMode;
  initial: SectionInput;
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (input: SectionInput) => void;
}>) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={720} height="auto">
      {open ? (
        <SectionForm
          mode={mode}
          initial={initial}
          submitLabel={submitLabel}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

function SectionForm({
  mode,
  initial,
  submitLabel,
  onClose,
  onSubmit,
}: Readonly<{
  mode: SetupFormMode;
  initial: SectionInput;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (input: SectionInput) => void;
}>) {
  const { control, handleSubmit, trigger, formState } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      name: initial.name,
      code: initial.code,
      description: initial.description,
      active: initial.active,
    },
    mode: 'onChange',
  });
  const canSave = canSubmitSetupForm(mode, formState);

  useEffect(() => {
    void trigger();
  }, [trigger]);

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit((values) => {
        if (!canSave) return;
        onSubmit(values);
      })}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { [screen.mobile]: '1fr', [screen.tablet]: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              id="section-name"
              label="Section Name"
              required
              placeholder="e.g. Main Dining"
              value={field.value}
              error={fieldState.isTouched && Boolean(fieldState.error)}
              helperText={
                fieldState.isTouched ? (fieldState.error?.message ?? undefined) : undefined
              }
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Input
              id="section-code"
              label="Section Code"
              placeholder="e.g. MD-001"
              helperText="Auto-generated code for POS routing"
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          )}
        />
      </Box>
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Input
            id="section-description"
            label="Description"
            placeholder="Describe this dining section zone..."
            value={field.value}
            multiline
            rows={3}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="active"
        control={control}
        render={({ field }) => (
          <LabeledSwitch
            title="Section Status"
            hint="Toggle active visibility on checkout POS channels"
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Stack
        direction={{ [screen.mobile]: 'column-reverse', [screen.tablet]: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
      >
        <ActionButton
          variant="outlined"
          type="button"
          onClick={onClose}
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        >
          Cancel
        </ActionButton>
        <ActionButton
          type="submit"
          disabled={!canSave}
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        >
          {submitLabel}
        </ActionButton>
      </Stack>
    </Stack>
  );
}
