import { wizardSteps } from '@/features/floor-table-setup/config';
import type { WizardStepId } from '@/features/floor-table-setup/types/floor-table-setup';
import { cn } from '@/lib/utils';

import styles from './wizard.module.css';

type WizardTabsProps = Readonly<{
  value: WizardStepId;
  onChange: (step: WizardStepId) => void;
}>;

export function WizardTabs({ value, onChange }: WizardTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Floor setup steps">
      {wizardSteps.map((step) => (
        <button
          key={step.id}
          type="button"
          role="tab"
          aria-selected={value === step.id}
          className={cn(styles.tab, value === step.id && styles.tabActive)}
          onClick={() => onChange(step.id)}
        >
          {step.label}
        </button>
      ))}
    </div>
  );
}
