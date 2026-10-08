'use client';

import { SupportQuickHelpCard } from '@/features/dashboard/components/shared/support-quick-help-card';
import { companyLandingContent } from '@/features/dashboard/config/company';

type QuickHelpCardProps = Readonly<{
  name: string;
  phone: string;
  online: boolean;
  supportId: string;
  supportHours: string;
  supportMessage: string;
}>;

export function QuickHelpCard({
  name,
  phone,
  online,
  supportId,
  supportHours,
  supportMessage,
}: QuickHelpCardProps) {
  const { title, onlineStatus, offlineStatus, whatsappCta } = companyLandingContent.quickHelp;

  return (
    <SupportQuickHelpCard
      title={title}
      identifierLabel="ID"
      identifier={supportId}
      name={name}
      phone={phone}
      online={online}
      onlineStatus={onlineStatus}
      offlineStatus={offlineStatus}
      supportHours={supportHours}
      supportMessage={supportMessage}
      whatsappCta={whatsappCta}
    />
  );
}
