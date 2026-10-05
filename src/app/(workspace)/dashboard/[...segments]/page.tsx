import { WorkspacePlaceholderPage } from '@/features/shell/components/WorkspacePlaceholderPage';
import { resolveWorkspacePageTitle } from '@/lib/constants/workspaceNavigation';

type DashboardSectionPageProps = Readonly<{
  params: Promise<{ segments: string[] }>;
}>;

export default async function DashboardSectionPage({ params }: DashboardSectionPageProps) {
  const { segments } = await params;
  const pathname = `/dashboard/${segments.join('/')}`;
  const title = resolveWorkspacePageTitle(pathname);

  return <WorkspacePlaceholderPage title={title} />;
}
