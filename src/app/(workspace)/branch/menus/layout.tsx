import type { ReactNode } from 'react';
import { MenusProvider } from '@/features/menus';
import { MenusRoutesProvider } from '@/features/menus/context/menus-routes-context';

export default function BranchMenusLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MenusRoutesProvider scope="branch">
      <MenusProvider>{children}</MenusProvider>
    </MenusRoutesProvider>
  );
}
