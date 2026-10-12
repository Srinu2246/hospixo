'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Typography, IconButton, Tooltip, Collapse, Avatar, Divider } from '@mui/material';
import logoLight from '@/assets/app/logo-light.svg';

// Material Icons
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import FastfoodOutlinedIcon from '@mui/icons-material/FastfoodOutlined';
import TakeoutDiningOutlinedIcon from '@mui/icons-material/TakeoutDiningOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import KitchenOutlinedIcon from '@mui/icons-material/KitchenOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import TvOutlinedIcon from '@mui/icons-material/TvOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { colors } from '@/lib/theme/mui/colors';
import {
  getSidebarNavigation,
  isSidebarSection,
  type SidebarItem,
  type SidebarSection,
  type SidebarEntry,
  type SidebarContext,
  type SidebarUserProfile,
} from '@/app/sidebar';

export type SidebarProps = {
  role?: string;
  userPermissions?: string[] | null;
  context?: SidebarContext;
  user?: SidebarUserProfile;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  activePath?: string;
};

// ----------------------------------------------------------------------
// Icon Resolver
// ----------------------------------------------------------------------

function renderSidebarIcon(iconKey?: string, name?: string): React.ReactElement {
  const normalized = (iconKey || name || '').toLowerCase().replace(/[\s&_-]+/g, '');

  if (normalized.includes('dashboard')) return <DashboardOutlinedIcon fontSize="small" />;
  if (normalized.includes('tablerestaurant') || normalized.includes('table')) {
    return <TableRestaurantOutlinedIcon fontSize="small" />;
  }
  if (
    normalized.includes('restaurant') ||
    normalized.includes('dinein') ||
    normalized.includes('foodorder') ||
    normalized.includes('ordermenu')
  ) {
    return <RestaurantMenuOutlinedIcon fontSize="small" />;
  }
  if (
    normalized.includes('takeaway') ||
    normalized.includes('takeout') ||
    normalized.includes('parcel')
  ) {
    return <TakeoutDiningOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('pointofsale') || normalized.includes('pos')) {
    return <PointOfSaleOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('captain')) return <FastfoodOutlinedIcon fontSize="small" />;
  if (normalized.includes('ready') || normalized.includes('factcheck')) {
    return <FactCheckOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('reservation') || normalized.includes('bookmark')) {
    return <BookmarkBorderOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('online') || normalized.includes('language')) {
    return <LanguageOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('order') || normalized.includes('receipt')) {
    return <ReceiptLongOutlinedIcon fontSize="small" />;
  }
  if (
    normalized.includes('cash') ||
    normalized.includes('currency') ||
    normalized.includes('rupee')
  ) {
    return <CurrencyRupeeIcon fontSize="small" />;
  }
  if (
    normalized.includes('payment') ||
    normalized.includes('credit') ||
    normalized.includes('due')
  ) {
    return <CreditCardOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('branch') || normalized.includes('storefront')) {
    return <StorefrontOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('trending') || normalized.includes('revenue')) {
    return <TrendingUpOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('speed') || normalized.includes('performance')) {
    return <SpeedOutlinedIcon fontSize="small" />;
  }
  if (
    normalized.includes('user') ||
    normalized.includes('role') ||
    normalized.includes('employee')
  ) {
    return <GroupOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('attendance') || normalized.includes('badge')) {
    return <BadgeOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('schedule') || normalized.includes('calendarmonth')) {
    return <CalendarMonthOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('availability') || normalized.includes('calendartoday')) {
    return <CalendarTodayOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('menu') || normalized.includes('book')) {
    return <MenuBookOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('gst') || normalized.includes('percent')) {
    return <PercentOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('prep') || normalized.includes('kitchenstation')) {
    return <KitchenOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('modifier') || normalized.includes('tune')) {
    return <TuneOutlinedIcon fontSize="small" />;
  }
  if (
    normalized.includes('tv') ||
    normalized.includes('kitchendisplay') ||
    normalized.includes('kds')
  ) {
    return <TvOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('inventory')) return <Inventory2OutlinedIcon fontSize="small" />;
  if (normalized.includes('customer') || normalized.includes('people')) {
    return <PeopleOutlinedIcon fontSize="small" />;
  }
  if (
    normalized.includes('report') ||
    normalized.includes('sale') ||
    normalized.includes('analytic')
  ) {
    return <BarChartOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('setting')) return <SettingsOutlinedIcon fontSize="small" />;
  if (
    normalized.includes('floor') ||
    normalized.includes('setup') ||
    normalized.includes('quilt')
  ) {
    return <ViewQuiltOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('live') || normalized.includes('bolt')) {
    return <ElectricBoltOutlinedIcon fontSize="small" />;
  }
  if (normalized.includes('company') || normalized.includes('business')) {
    return <BusinessOutlinedIcon fontSize="small" />;
  }

  return <DashboardOutlinedIcon fontSize="small" />;
}

// ----------------------------------------------------------------------
// Main Sidebar Component
// ----------------------------------------------------------------------

export function Sidebar({
  role = 'Branch manager',
  userPermissions,
  context,
  user = {
    name: 'Ravi Kumar',
    role: 'Captain',
  },
  isOpen: controlledIsOpen,
  defaultOpen = true,
  onToggle,
  activePath,
}: SidebarProps) {
  const router = useRouter();
  const currentPathname = usePathname();
  const effectivePathname = activePath || currentPathname || '';

  // Open/collapsed state
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    const nextState = !isOpen;
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(nextState);
    }
    onToggle?.(nextState);
  };

  // Section collapsed state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionName: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Sub-flow state overrides and dismissed paths
  const [activeSubFlowOverride, setActiveSubFlowOverride] = useState<{
    title: string;
    items: SidebarItem[];
  } | null>(null);
  const [dismissedPath, setDismissedPath] = useState<string | null>(null);

  // Resolved Navigation Entries
  const navigationEntries = useMemo(() => {
    return getSidebarNavigation({ role, userPermissions, context });
  }, [role, userPermissions, context]);

  // Check if an item or route is currently active
  const isItemActive = (href?: string): boolean => {
    if (!href || !effectivePathname) return false;
    if (effectivePathname === href) return true;

    // Handle path suffixes (e.g. branch-agnostic /pos/point-of-sale/tables matches /indiranagar/pos/point-of-sale/tables)
    const cleanHref = href.replace(/^\/[^/]+/, '');
    const cleanCurrent = effectivePathname.replace(/^\/[^/]+/, '');

    // Exact match on normalized branch-agnostic path
    if (cleanHref && cleanCurrent === cleanHref) return true;

    // POS Dashboard equivalence (/pos/point-of-sale and /pos/point-of-sale/dashboard)
    if (
      (cleanHref === '/pos/point-of-sale' || cleanHref === '/pos/point-of-sale/dashboard') &&
      (cleanCurrent === '/pos/point-of-sale' || cleanCurrent === '/pos/point-of-sale/dashboard')
    ) {
      return true;
    }

    // Nested sub-route match with strict '/' boundary (e.g. /reservation/RES-01 matches /reservation)
    // Avoid matching parent sections (like /pos/point-of-sale) when viewing specific sibling features
    if (
      cleanHref &&
      cleanHref !== '/' &&
      cleanHref !== '/pos/point-of-sale' &&
      (effectivePathname.startsWith(href + '/') || cleanCurrent.startsWith(cleanHref + '/'))
    ) {
      return true;
    }

    return false;
  };

  // Find sub-flow matching current URL path
  const matchedSubFlow = useMemo(() => {
    if (!effectivePathname) return null;

    for (const entry of navigationEntries) {
      const items = isSidebarSection(entry) ? entry.items : [entry];
      for (const item of items) {
        if (item.items && item.items.length > 0) {
          const matchesParent = isItemActive(item.href);
          const matchesChild = item.items.some((child) => isItemActive(child.href));

          if (matchesParent || matchesChild) {
            return {
              title: item.name,
              items: item.items,
            };
          }
        }
      }
    }
    return null;
  }, [navigationEntries, effectivePathname]);

  // Active sub-flow: manual override > matched sub-flow (unless manually dismissed on this route)
  const activeSubFlow = useMemo(() => {
    if (activeSubFlowOverride) return activeSubFlowOverride;
    if (dismissedPath && dismissedPath === effectivePathname) return null;
    return matchedSubFlow;
  }, [activeSubFlowOverride, dismissedPath, effectivePathname, matchedSubFlow]);

  const getMainDashboardHref = (): string => {
    // 1. Look for a top-level Dashboard item in navigationEntries
    for (const entry of navigationEntries) {
      if (
        !isSidebarSection(entry) &&
        entry.name.toLowerCase().includes('dashboard') &&
        entry.href
      ) {
        return entry.href;
      }
    }
    // 2. Look for any child Dashboard item in sections
    for (const entry of navigationEntries) {
      if (isSidebarSection(entry)) {
        const dash = entry.items.find(
          (item) => item.name.toLowerCase().includes('dashboard') && item.href,
        );
        if (dash?.href) return dash.href;
      }
    }
    // 3. Fallback to branch dashboard or root dashboard
    if (context?.branchSlug) {
      return `/${context.branchSlug}/dashboard`;
    }
    return '/branch-manager/dashboard';
  };

  const handleBackToMenu = () => {
    const mainDashboardHref = getMainDashboardHref();
    setDismissedPath(mainDashboardHref);
    setActiveSubFlowOverride(null);
    if (mainDashboardHref && mainDashboardHref !== effectivePathname) {
      router.push(mainDashboardHref);
    }
  };

  // Entity scope label (e.g. Branch / Company / Organization name)
  const entityScopeLabel = useMemo(() => {
    if (context?.branchName) return context.branchName;
    if (context?.companyName) return context.companyName;
    if (context?.organizationName) return context.organizationName;
    return null;
  }, [context]);

  // Width: exactly 260px open, 80px closed
  const sidebarWidth = isOpen ? 260 : 80;

  // Render individual navigation item link/button
  const renderNavItem = (item: SidebarItem) => {
    const hasChildren = item.items && item.items.length > 0;
    const active = isItemActive(item.href);

    const handleClick = (e: React.MouseEvent) => {
      if (hasChildren) {
        e.preventDefault();
        // Replace sidebar with sub-flow items
        setActiveSubFlowOverride({
          title: item.name,
          items: item.items || [],
        });
        setDismissedPath(null);

        // Determine default route for the sub-flow
        let defaultRoute: string | undefined;
        const normalizedName = item.name.toLowerCase();
        if (normalizedName.includes('captain')) {
          // For Captain Flow, default route is Tables
          const tablesItem = item.items?.find((c) => c.name.toLowerCase().includes('table'));
          defaultRoute = tablesItem?.href || item.items?.[0]?.href;
        } else if (normalizedName.includes('pos') || normalizedName.includes('point of sale')) {
          // For POS, default route is Dashboard
          const dashboardItem = item.items?.find((c) => c.name.toLowerCase().includes('dashboard'));
          defaultRoute = dashboardItem?.href || item.items?.[0]?.href;
        } else {
          defaultRoute = item.items?.[0]?.href || item.href;
        }

        if (defaultRoute && defaultRoute !== effectivePathname) {
          router.push(defaultRoute);
        }

        if (!isOpen) {
          // Open sidebar when user drills into sub-flow
          if (controlledIsOpen === undefined) setInternalIsOpen(true);
          onToggle?.(true);
        }
      }
    };

    const content = (
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          height: 40,
          px: isOpen ? 1.75 : 0,
          mx: isOpen ? 1.5 : 'auto',
          width: isOpen ? 'auto' : 40,
          justifyContent: isOpen ? 'flex-start' : 'center',
          borderRadius: '8px',
          cursor: 'pointer',
          textDecoration: 'none',
          userSelect: 'none',
          transition: 'all 0.18s ease-in-out',
          backgroundColor: active ? colors.sidebar.active : 'transparent',
          color: active ? colors.white.default : colors.sidebar.textMuted,
          boxShadow: active ? `0 4px 14px ${colors.sidebar.activeGlow}` : 'none',
          '&:hover': {
            backgroundColor: active ? colors.sidebar.active : colors.sidebar.hover,
            color: colors.white.default,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: active ? colors.white.default : 'inherit',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {renderSidebarIcon(item.icon, item.name)}
        </Box>

        {isOpen && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: active ? 600 : 500,
              fontSize: '0.875rem',
              color: 'inherit',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {item.name}
          </Typography>
        )}
      </Box>
    );

    // If collapsed, wrap with Tooltip
    const wrappedContent = !isOpen ? (
      <Tooltip title={item.name} placement="right" arrow key={item.name + (item.href || '')}>
        {content}
      </Tooltip>
    ) : (
      <React.Fragment key={item.name + (item.href || '')}>{content}</React.Fragment>
    );

    if (item.href && !hasChildren) {
      return (
        <Link
          key={item.name + item.href}
          href={item.href}
          style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}
        >
          {wrappedContent}
        </Link>
      );
    }

    return (
      <Box key={item.name} sx={{ mb: 0.5 }}>
        {wrappedContent}
      </Box>
    );
  };

  return (
    <Box
      component="aside"
      sx={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: colors.sidebar.background,
        color: colors.sidebar.text,
        borderRight: `1px solid ${colors.sidebar.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        zIndex: 1200,
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* Top Header: Hospixo Logo + Collapse/Expand Toggle              */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          px: isOpen ? 2 : 1,
          borderBottom: `1px solid ${colors.sidebar.border}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {isOpen ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Image
                src={logoLight}
                alt="Hospixo"
                width={108}
                height={24}
                priority
                style={{
                  display: 'block',
                  height: 'auto',
                  width: 'auto',
                  maxWidth: 108,
                }}
              />
              {entityScopeLabel && (
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.sidebar.badgeText,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    mt: 0.25,
                  }}
                >
                  {entityScopeLabel}
                </Typography>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                width: 28,
                height: 24,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexShrink: 0,
              }}
            >
              <Image
                src={logoLight}
                alt="Hospixo"
                width={108}
                height={24}
                priority
                style={{
                  minWidth: 108,
                  height: 24,
                  display: 'block',
                }}
              />
            </Box>
          )}
        </Box>

        <IconButton
          onClick={handleToggle}
          size="small"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          sx={{
            width: 28,
            height: 28,
            backgroundColor: colors.sidebar.toggleBg,
            color: colors.sidebar.textMuted,
            borderRadius: '50%',
            transition: 'all 0.18s ease',
            '&:hover': {
              backgroundColor: colors.sidebar.toggleHover,
              color: colors.white.default,
            },
          }}
        >
          {isOpen ? (
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* Navigation Scroll Area                                         */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 2,
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: colors.sidebar.toggleBg,
            borderRadius: 4,
          },
        }}
      >
        {/* SUB-FLOW NAVIGATION MODE (e.g. POS or Captain Flow replacement) */}
        {activeSubFlow ? (
          <Box sx={{ px: isOpen ? 0 : 0 }}>
            {/* Back Button to Parent Menu */}
            <Box
              onClick={handleBackToMenu}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                height: 40,
                px: isOpen ? 2 : 0,
                mx: isOpen ? 1.5 : 'auto',
                width: isOpen ? 'auto' : 40,
                mb: 2,
                borderRadius: '8px',
                cursor: 'pointer',
                justifyContent: isOpen ? 'flex-start' : 'center',
                backgroundColor: colors.sidebar.toggleBg,
                color: colors.sidebar.badgeText,
                transition: 'all 0.18s ease',
                '&:hover': {
                  backgroundColor: colors.sidebar.hover,
                  color: colors.white.default,
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
              {isOpen && (
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Back to Menu
                </Typography>
              )}
            </Box>

            {/* Sub-flow Title */}
            {isOpen && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  px: 2.5,
                  mb: 1.5,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.sidebar.textSection,
                }}
              >
                {activeSubFlow.title}
              </Typography>
            )}

            {/* Sub-flow items */}
            {activeSubFlow.items.map((item) => renderNavItem(item))}
          </Box>
        ) : (
          /* PRIMARY NAVIGATION MODE */
          <Box>
            {navigationEntries.map((entry, index) => {
              if (isSidebarSection(entry)) {
                const section = entry as SidebarSection;
                const isCollapsed = Boolean(collapsedSections[section.name]);

                return (
                  <Box key={section.name} sx={{ mb: 2 }}>
                    {/* Section Header */}
                    {isOpen ? (
                      <Box
                        onClick={() => toggleSection(section.name)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 2.5,
                          py: 0.75,
                          cursor: 'pointer',
                          userSelect: 'none',
                          color: colors.sidebar.textSection,
                          transition: 'color 0.15s ease',
                          '&:hover': {
                            color: colors.sidebar.textMuted,
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {section.name}
                        </Typography>
                        {isCollapsed ? (
                          <ExpandMoreIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <ExpandLessIcon sx={{ fontSize: 16 }} />
                        )}
                      </Box>
                    ) : (
                      index > 0 && (
                        <Divider
                          sx={{
                            my: 1.5,
                            mx: 2,
                            borderColor: colors.sidebar.border,
                          }}
                        />
                      )
                    )}

                    {/* Section Items */}
                    <Collapse in={!isOpen || !isCollapsed} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 0.5 }}>{section.items.map((item) => renderNavItem(item))}</Box>
                    </Collapse>
                  </Box>
                );
              }

              // Standalone direct item (e.g. Dashboard)
              return (
                <Box key={entry.name} sx={{ mb: 1.5 }}>
                  {renderNavItem(entry as SidebarItem)}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* Bottom Profile Card                                           */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          p: isOpen ? 1.5 : 1,
          borderTop: `1px solid ${colors.sidebar.border}`,
          flexShrink: 0,
        }}
      >
        {isOpen ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.25,
              borderRadius: '8px',
              backgroundColor: colors.sidebar.cardBg,
              border: `1px solid ${colors.sidebar.border}`,
            }}
          >
            <Avatar
              src={user?.avatar}
              alt={user?.name || 'User'}
              sx={{
                width: 36,
                height: 36,
                backgroundColor: colors.white.default,
                color: colors.sidebar.background,
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ overflow: 'hidden', flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: colors.white.default,
                  fontWeight: 600,
                  fontSize: '0.84375rem',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'Ravi Kumar'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.sidebar.textMuted,
                  fontSize: '0.71875rem',
                  lineHeight: 1.2,
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.role || 'Captain'}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Tooltip title={`${user?.name || 'User'} (${user?.role || 'Staff'})`} placement="right">
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={user?.avatar}
                alt={user?.name || 'User'}
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: colors.white.default,
                  color: colors.sidebar.background,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
export default Sidebar;
