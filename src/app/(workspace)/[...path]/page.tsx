import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { UnderConstructionPage } from '@/components/common/under-construction/under-construction-page';
import {
  getWorkspaceNavItem,
  isTenantWorkspacePath,
  resolveWorkspaceNavPage,
} from '@/config/shell/workspace-nav-pages';

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
    // Dedicated `page.tsx` routes return undefined here; if Next misroutes to this catch-all,
    // fall back to the nav stub instead of a bare 404 when the path is in the sidebar.
    const navItem = getWorkspaceNavItem(pathname);
    if (navItem) {
      return (
        <UnderConstructionPage
          title={navItem.title}
          subtitle={navItem.subtitle ?? 'This screen is not available yet.'}
        />
      );
    }
    notFound();
  }

  return <UnderConstructionPage title={def.title} subtitle={def.subtitle} />;
}
