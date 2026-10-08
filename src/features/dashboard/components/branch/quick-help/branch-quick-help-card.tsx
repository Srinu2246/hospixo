'use client';

import { SupportQuickHelpCard } from '@/features/dashboard/components/shared/support-quick-help-card';
import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';

type BranchQuickHelpCardProps = Readonly<{
  name: string;
  role: string;
  phone: string;
  online: boolean;
  outletId: string;
  supportHours: string;
  supportMessage: string;
}>;

export function BranchQuickHelpCard({
  name,
  role,
  phone,
  online,
  outletId,
  supportHours,
  supportMessage,
}: BranchQuickHelpCardProps) {
  const { title, outletIdLabel, onlineStatus, offlineStatus, whatsappCta } =
    branchDashboardCopy.quickHelp;

  return (
    <SupportQuickHelpCard
      title={title}
      identifierLabel={outletIdLabel}
      identifier={outletId}
      name={name}
      role={role}
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
