import { WorkspacePlaceholderPage } from '@/features/shell/components/WorkspacePlaceholderPage';
import { APP_ROUTES } from '@/lib/constants/routes';

export default function SettingsPage() {
  return (
    <WorkspacePlaceholderPage
      title="Settings"
      description={`Choose a section from the sidebar (Organization Settings, Subscription, Integrations) or open ${APP_ROUTES.settingsOrganisation}.`}
    />
  );
}
