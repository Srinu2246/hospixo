import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { UnderConstructionPage } from '@/components/common/under-construction/under-construction-page';
import { isTenantWorkspacePath, resolveWorkspaceNavPage } from '@/config/shell/workspace-nav-pages';

type WorkspaceCatchAllProps = Readonly<{
  params: Promise<{ path: string[] }>;
}>;

export async function generateMetadata({ params }: WorkspaceCatchAllProps): Promise<Metadata> {
  const { path } = await params;
  const pathname = `/${path.join('/')}`;
  const def = resolveWorkspaceNavPage(pathname);
  return { title: def?.title ?? 'Workspace' };
}

export default async function WorkspaceCatchAllPage({ params }: WorkspaceCatchAllProps) {
  const { path } = await params;
  const pathname = `/${path.join('/')}`;

  if (pathname.startsWith('/employees') || pathname.startsWith('/roles')) {
    notFound();
  }

  if (!isTenantWorkspacePath(pathname)) {
    notFound();
  }

  const def = resolveWorkspaceNavPage(pathname);

  if (!def) {
    notFound();
  }

  return <UnderConstructionPage title={def.title} subtitle={def.subtitle} />;
}
