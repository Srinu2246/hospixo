'use client';

import { useState } from 'react';
import { Box, Button, Paper, Stack, Typography, TextField } from '@mui/material';
import { Calendar, ChevronDown } from 'lucide-react';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

type OrganisationDateRangePickerProps = Readonly<{
  label: string;
  activeRange: OrganisationDateRangeId;
  customFrom: string;
  customTo: string;
  isOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onSelectPreset: (range: PresetRangeId) => void;
  onApplyCustom: (from: string, to: string) => void;
}>;

export function OrganisationDateRangePicker({
  label,
  activeRange,
  customFrom,
  customTo,
  isOpen,
  menuRef,
  onToggle,
  onSelectPreset,
  onApplyCustom,
}: OrganisationDateRangePickerProps) {
  const [customPanelOpen, setCustomPanelOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(customFrom);
  const [draftTo, setDraftTo] = useState(customTo);

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (!isOpen) {
      setCustomPanelOpen(false);
    } else {
      setDraftFrom(customFrom);
      setDraftTo(customTo);
      setCustomPanelOpen(activeRange === 'custom');
    }
  }

  function handlePresetSelect(range: OrganisationDateRangeId) {
    if (range === 'custom') {
      setCustomPanelOpen(true);
      return;
    }

    onSelectPreset(range);
  }

  function handleApplyCustom() {
    if (!draftFrom || !draftTo) return;

    const from = draftFrom <= draftTo ? draftFrom : draftTo;
    const to = draftFrom <= draftTo ? draftTo : draftFrom;
    onApplyCustom(from, to);
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      <Button
        type="button"
        variant="outlined"
        startIcon={<Calendar size={16} />}
        endIcon={<ChevronDown size={16} />}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
        sx={{
          textTransform: 'none',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'text.primary',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          borderRadius: '0.5rem',
          px: 1.5,
          py: 0.75,
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'divider',
          },
        }}
      >
        {label}
      </Button>

      {isOpen ? (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            zIndex: 1300,
            minWidth: 220,
            p: 1,
            borderRadius: '0.5rem',
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
          role="listbox"
          aria-label="Date range"
        >
          <Stack spacing={0.5}>
            {organisationDashboardCopy.dateRangeOptions.map((option) => {
              const isSelected = activeRange === option.id;
              return (
                <Box
                  component="button"
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handlePresetSelect(option.id)}
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    px: 1.5,
                    py: 1,
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'primary.main' : 'text.primary',
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {option.label}
                </Box>
              );
            })}
          </Stack>

          {customPanelOpen ? (
            <Box
              sx={{
                mt: 1.5,
                pt: 1.5,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Stack spacing={1.5}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                  >
                    From
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    value={draftFrom}
                    slotProps={{ htmlInput: { max: draftTo || undefined } }}
                    onChange={(event) => setDraftFrom(event.target.value)}
                    sx={{
                      '& .MuiInputBase-input': { fontSize: '0.8125rem', py: 0.75, px: 1 },
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                  >
                    To
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    value={draftTo}
                    slotProps={{ htmlInput: { min: draftFrom || undefined } }}
                    onChange={(event) => setDraftTo(event.target.value)}
                    sx={{
                      '& .MuiInputBase-input': { fontSize: '0.8125rem', py: 0.75, px: 1 },
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  disabled={!draftFrom || !draftTo}
                  onClick={handleApplyCustom}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.8125rem',
                    borderRadius: '0.5rem',
                    mt: 0.5,
                  }}
                >
                  Apply range
                </Button>
              </Stack>
            </Box>
          ) : null}
        </Paper>
      ) : null}
    </Box>
  );
}
