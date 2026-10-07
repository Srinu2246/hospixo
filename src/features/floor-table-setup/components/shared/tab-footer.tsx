import { AsyncButton } from '@/features/floor-table-setup/components/shared/async-button';
import { detailCopy } from '@/features/floor-table-setup/config';

import wizardStyles from '../wizard/wizard.module.css';

type TabFooterProps = Readonly<{
  onBack: () => void;
  primaryLabel: string;
  onPrimary?: () => void;
  loading?: boolean;
  loadingLabel?: string;
  primaryDisabled?: boolean;
  backDisabled?: boolean;
}>;

export function TabFooter({
  onBack,
  primaryLabel,
  onPrimary,
  loading = false,
  loadingLabel,
  primaryDisabled = false,
  backDisabled = false,
}: TabFooterProps) {
  return (
    <div className={wizardStyles.footer}>
      <AsyncButton
        className={wizardStyles.secondary}
        onClick={onBack}
        disabled={backDisabled || loading}
      >
        {detailCopy.back}
      </AsyncButton>
      <AsyncButton
        className={wizardStyles.primary}
        onClick={onPrimary ?? onBack}
        loading={loading}
        loadingLabel={loadingLabel}
        disabled={primaryDisabled}
      >
        {primaryLabel}
      </AsyncButton>
    </div>
  );
}
