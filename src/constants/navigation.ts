import {
  BarChart3,
  Brain,
  Building2,
  ClipboardList,
  CreditCard,
  Flag,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Settings2,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { ADMIN_ROUTES } from '@/constants/routes';

export type AdminNavItem = Readonly<{
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
}>;

/** Control-plane sidebar — aligned with hospixo admin IA. */
export const adminNavItems: readonly AdminNavItem[] = [
  {
    id: 'dashboard',
    href: ADMIN_ROUTES.dashboard,
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'leads',
    href: ADMIN_ROUTES.onboarding,
    label: 'Leads',
    icon: Sparkles,
  },
  {
    id: 'organization-setup',
    href: ADMIN_ROUTES.organizations,
    label: 'Organization Set-up',
    icon: Building2,
  },
  {
    id: 'subscription',
    href: ADMIN_ROUTES.subscriptions,
    label: 'Subscription',
    icon: CreditCard,
  },
  {
    id: 'onboarding',
    href: ADMIN_ROUTES.onboarding,
    label: 'Onboarding',
    icon: Users,
  },
  { id: 'modules', href: ADMIN_ROUTES.plans, label: 'Modules', icon: Package },
  {
    id: 'operations',
    href: ADMIN_ROUTES.operations,
    label: 'Operations',
    icon: Flag,
  },
  { id: 'finance', href: ADMIN_ROUTES.finance, label: 'Finance', icon: Wallet },
  {
    id: 'payments',
    href: ADMIN_ROUTES.payments,
    label: 'Payments',
    icon: ClipboardList,
  },
  {
    id: 'audit-logs',
    href: ADMIN_ROUTES.audit,
    label: 'Audit Logs',
    icon: BarChart3,
  },
  {
    id: 'hr',
    href: ADMIN_ROUTES.settings,
    label: 'HR Management',
    icon: Users,
  },
  {
    id: 'ai-insights',
    href: ADMIN_ROUTES.featureFlags,
    label: 'AI Insights',
    icon: Brain,
  },
  {
    id: 'reports',
    href: ADMIN_ROUTES.audit,
    label: 'Reports',
    icon: BarChart3,
  },
  {
    id: 'settings',
    href: ADMIN_ROUTES.settings,
    label: 'Settings',
    icon: Settings2,
  },
  {
    id: 'support',
    href: ADMIN_ROUTES.support,
    label: 'Support',
    icon: LifeBuoy,
  },
];

export const adminTopbarCopy = {
  searchPlaceholder: 'Search Organizations...',
  profileName: 'Admin',
  menuLabel: 'Account menu',
  logout: 'Logout',
  logoutTitle: 'Logout',
  logoutMessage:
    'Are you sure you want to logout? You will need to sign in again to access your account.',
  cancel: 'Cancel',
  confirmLogout: 'Logout',
  loggingOut: 'Logging out…',
} as const;
