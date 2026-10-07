'use client';

import { Box, Button, Typography } from '@mui/material';
import { Download } from 'lucide-react';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { exportOrganisationDashboardCsv } from '@/features/dashboard/utils/export-organisation-dashboard-csv';
import { OrganisationDateRangePicker } from '@/features/dashboard/components/organisation/shared/organisation-date-range-picker';
import type {
  OrganisationDashboardOverview,
  OrganisationDateRangeId,
} from '@/features/dashboard/types/organisation-dashboard';

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

type OrganisationDashboardHeaderProps = Readonly<{
  data: OrganisationDashboardOverview;
  activeRange: OrganisationDateRangeId;
  customFrom: string;
  customTo: string;
  dateMenuOpen: boolean;
  dateMenuRef: React.RefObject<HTMLDivElement | null>;
  onDateMenuToggle: () => void;
  onPresetRangeChange: (range: PresetRangeId) => void;
  onCustomRangeApply: (from: string, to: string) => void;
}>;

export function OrganisationDashboardHeader({
  data,
  activeRange,
  customFrom,
  customTo,
  dateMenuOpen,
  dateMenuRef,
  onDateMenuToggle,
  onPresetRangeChange,
  onCustomRangeApply,
}: OrganisationDashboardHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'text.primary',
          letterSpacing: '-0.01em',
        }}
      >
        {organisationDashboardCopy.title}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
        <OrganisationDateRangePicker
          label={data.dateRangeLabel}
          activeRange={activeRange}
          customFrom={customFrom}
          customTo={customTo}
          isOpen={dateMenuOpen}
          menuRef={dateMenuRef}
          onToggle={onDateMenuToggle}
          onSelectPreset={onPresetRangeChange}
          onApplyCustom={onCustomRangeApply}
        />
        <Button
          type="button"
          variant="outlined"
          startIcon={<Download size={16} />}
          onClick={() => exportOrganisationDashboardCsv(data)}
          sx={{
            textTransform: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: '0.5rem',
            px: 2,
            py: 0.75,
            color: 'info.main',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '&:hover': {
              borderColor: 'info.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          {organisationDashboardCopy.exportButton}
        </Button>
      </Box>
    </Box>
  );
}
