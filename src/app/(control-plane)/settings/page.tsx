import { Box } from '@mui/material';
import type { Metadata } from 'next';

import PageHeader from '@/components/page/PageHeader';
import OrganizationSettingsForm from '@/components/organization-settings-form';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return (
    <Box>
      <PageHeader title="Settings" description="Organization and platform configuration." />
      <OrganizationSettingsForm />
    </Box>
  );
}
