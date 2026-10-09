import type { ReactNode } from 'react';
import { MenusProvider } from '@/features/menus';
import { MenusRoutesProvider } from '@/features/menus/context/menus-routes-context';

export default function CompanyMenusLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MenusRoutesProvider scope="company">
      <MenusProvider>{children}</MenusProvider>
    </MenusRoutesProvider>
  );
}
