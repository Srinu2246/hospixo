'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { ChevronLeft } from 'lucide-react';

import { Dropdown } from '@/components/shared/form-fields/Dropdown';

export interface CaptainWorkspaceSubheaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  floorOptions?: readonly { id: string; label: string }[];
  floorValue?: string;
  onFloorChange?: (value: string) => void;
  sectionOptions?: readonly { id: string; label: string }[];
  sectionValue?: string;
  onSectionChange?: (value: string) => void;
  sectionDisabled?: boolean;
}

const CAPTAIN_FILTER_DROPDOWN_SX = {
  flex: '0 1 auto',
  width: 104,
  maxWidth: 104,
  minWidth: 88,
  height: 36,
  borderRadius: '10px',
  '& .MuiOutlinedInput-root': {
    height: 36,
  },
  '& .MuiSelect-select': {
    fontSize: '0.75rem',
    fontWeight: 600,
    py: '8px !important',
    pl: '10px !important',
    pr: '26px !important',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    boxSizing: 'border-box',
    display: 'block',
  },
  '& .MuiSelect-icon': {
    right: 6,
    width: 16,
    height: 16,
  },
} as const;

/** Screen title row under AppShell “Hospixo Tables” header (captain mobile/tablet). */
export function CaptainWorkspaceSubheader({
  title,
  subtitle,
  onBack,
  floorOptions,
  floorValue,
  onFloorChange,
  sectionOptions,
  sectionValue,
  onSectionChange,
  sectionDisabled = false,
}: Readonly<CaptainWorkspaceSubheaderProps>) {
  const showFloorFilter =
    Boolean(floorOptions?.length) && onFloorChange != null && floorValue != null;
  const showSectionFilter =
    Boolean(sectionOptions?.length) && onSectionChange != null && sectionValue != null;

  return (
    <Stack spacing={1.25} sx={{ flexShrink: 0, width: '100%' }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'flex-start', minWidth: 0, flex: 1 }}
        >
          {onBack ? (
            <IconButton
              size="small"
              aria-label="Back"
              onClick={onBack}
              sx={{ mt: -0.25, ml: -0.5, flexShrink: 0 }}
            >
              <ChevronLeft size={22} />
            </IconButton>
          ) : null}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1.15rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
              }}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25, lineHeight: 1.45 }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Stack>
        {showFloorFilter || showSectionFilter ? (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ flexShrink: 0, alignItems: 'center', pt: 0.25, ml: 0.5 }}
          >
            {showFloorFilter ? (
              <Dropdown
                size="small"
                value={floorValue!}
                onChange={onFloorChange!}
                options={floorOptions!}
                minWidth={0}
                sx={CAPTAIN_FILTER_DROPDOWN_SX}
              />
            ) : null}
            {showSectionFilter ? (
              <Dropdown
                size="small"
                value={sectionValue!}
                onChange={onSectionChange!}
                options={sectionOptions!}
                disabled={sectionDisabled}
                minWidth={0}
                sx={CAPTAIN_FILTER_DROPDOWN_SX}
              />
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );
}
