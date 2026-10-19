import type { SxProps, Theme } from '@mui/material/styles';
import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';

/**
 * Base props shared across responsive navigation headers (Mobile & Tablet).
 */
export interface BaseResponsiveNavbarProps {
  /** Anchor element for the branch selector menu */
  branchMenuAnchor: HTMLElement | null;
  /** Callback fired to open branch selector menu */
  onOpenBranchMenu: (el: HTMLElement) => void;
  /** Callback fired to close branch selector menu */
  onCloseBranchMenu: () => void;
  /** Organizational scope label */
  mobileScopeLabel: string;
  /** Active outlet or branch label */
  mobileOutletLabel: string;
  /** Branch options list */
  mobileBranchOptions: DropdownOption<string>[];
  /** Selected outlet id */
  mobileSelectedOutletSlug: string;
  /** Callback fired when an outlet option is chosen */
  onMobileOutletChange: (id: string, option?: DropdownOption<string>) => void;
  /** Callback fired on notification button click */
  onNotificationClick?: () => void;
  /** Callback fired on mobile/tablet menu button click */
  onOpenMenu?: () => void;
  /** Optional layout style overrides from the caller */
  sx?: SxProps<Theme>;
}

/**
 * Props for MobileNavbar.
 */
export type MobileNavbarProps = BaseResponsiveNavbarProps;

/**
 * Props for TabletNavbar.
 */
export interface TabletNavbarProps extends BaseResponsiveNavbarProps {
  /** Whether management action buttons should be visible */
  showManagementActions: boolean;
  /** Callback fired on AI Agent button click */
  onAiAgentClick?: () => void;
  /** Callback fired on settings button click */
  onSettingsClick?: () => void;
}
