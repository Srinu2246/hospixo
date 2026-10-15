'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { wizardSteps } from '@/features/floor-table-setup/config';
import type { WizardStepId } from '@/features/floor-table-setup/types/floor-table-setup';

type WizardTabsCompactProps = Readonly<{
  value: WizardStepId;
  onChange: (step: WizardStepId) => void;
}>;

export function WizardTabsCompact({ value, onChange }: WizardTabsCompactProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next as WizardStepId)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Floor setup steps"
      sx={{
        minHeight: 44,
        '& .MuiTab-root': {
          minHeight: 44,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      }}
    >
      {wizardSteps.map((step) => (
        <Tab key={step.id} value={step.id} label={step.label} />
      ))}
    </Tabs>
  );
}
