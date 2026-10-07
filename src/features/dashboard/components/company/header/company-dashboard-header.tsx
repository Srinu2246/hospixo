'use client';

import { Box, Button, Typography } from '@mui/material';
import { Download } from 'lucide-react';

import { OrganisationDateRangePicker } from '@/features/dashboard/components/organisation/shared/organisation-date-range-picker';
import { exportCompanyDashboardCsv } from '@/features/dashboard/utils/export-company-dashboard-csv';
import { companyLandingContent } from '@/features/dashboard/config/company';
import type { CompanyDashboardDisplayData } from '@/features/dashboard/lib/build-company-dashboard-data';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

type CompanyDashboardHeaderProps = Readonly<{
  data: CompanyDashboardDisplayData;
  activeRange: OrganisationDateRangeId;
  customFrom: string;
  customTo: string;
  dateMenuOpen: boolean;
  dateMenuRef: React.RefObject<HTMLDivElement | null>;
  onDateMenuToggle: () => void;
  onPresetRangeChange: (range: PresetRangeId) => void;
  onCustomRangeApply: (from: string, to: string) => void;
}>;

export function CompanyDashboardHeader({
  data,
  activeRange,
  customFrom,
  customTo,
  dateMenuOpen,
  dateMenuRef,
  onDateMenuToggle,
  onPresetRangeChange,
  onCustomRangeApply,
}: CompanyDashboardHeaderProps) {
  const { title, exportButton } = companyLandingContent.header;

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
        {title}
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
          onClick={() => exportCompanyDashboardCsv(data)}
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
          {exportButton}
        </Button>
      </Box>
    </Box>
  );
}
