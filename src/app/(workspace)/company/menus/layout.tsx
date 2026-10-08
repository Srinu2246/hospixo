import type { ReactNode } from 'react';
import { MenusProvider } from '@/features/menus';

export default function CompanyMenusLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <MenusProvider>{children}</MenusProvider>;
}
