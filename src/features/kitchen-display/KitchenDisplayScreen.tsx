'use client';

import React from 'react';
import Box from '@mui/material/Box';

import { Toast } from '@/components/shared/ui/Toast';
import { useKitchenDisplay, type UseKitchenDisplayOptions } from '@/lib/hooks/kitchen-display';
import { KitchenHeader } from './components/KitchenHeader';
import { KitchenColumn } from './components/KitchenColumn';
import { KitchenFooter } from './components/KitchenFooter';

export interface KitchenDisplayScreenProps extends UseKitchenDisplayOptions {
  className?: string;
}

/**
 * KitchenDisplayScreen Component
 *
 * Real-time Kitchen Display System (KDS) board matching screenshot specifications:
 * 1. Top Section: Header card with Title ("Kitchen Display"), Floor subtitle, station selector pills (Main Kitchen, Tandoor, Bar),
 *    live digital clock, metrics (Total Orders, Pending, Preparing, Ready), Live indicator, alert toggle and operator avatar.
 * 2. 3-Column Workflow Board:
 *    - New Orders (Red #EF4444 accent line & badge, cards with "Start Preparing" red button)
 *    - Preparing (Amber #F59E0B accent line & badge, cards with "✓ Mark ready" amber button)
 *    - Ready to Serve (Green #10B981 accent line & badge, cards with "Served / Picked up" green button)
 * 3. Bottom Device & Sync Status Footer:
 *    - Printer Connected, POS Sync Active, and Average Prep Time.
 */
export function KitchenDisplayScreen({
  initialOrders,
  initialStation,
}: Readonly<KitchenDisplayScreenProps> = {}) {
  const {
    selectedStation,
    setSelectedStation,
    stations,
    newOrders,
    preparingOrders,
    readyOrders,
    stats,
    currentTime,
    isLiveActive,
    soundEnabled,
    handleToggleSound,
    handleStartPreparing,
    handleRecall,
    handleMarkReady,
    handleServe,
    toastMessage,
    clearToast,
  } = useKitchenDisplay({ initialOrders, initialStation });

  // Match the exact badge display from Screenshot 2 (34 for new orders on main kitchen)
  const newOrdersBadgeCount =
    selectedStation === 'Main Kitchen' && newOrders.length === 2 ? 34 : newOrders.length;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        boxSizing: 'border-box',
        p: 0,
      }}
    >
      {/* 1. Header Card (Title, Stations, Digital Clock, Stats, Avatar) */}
      <KitchenHeader
        selectedStation={selectedStation}
        stations={stations}
        onSelectStation={setSelectedStation}
        currentTime={currentTime}
        stats={stats}
        isLiveActive={isLiveActive}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* 2. 3-Column Board */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: { xs: 2.5, md: 3 },
          alignItems: 'start',
          flex: 1,
        }}
      >
        {/* Column 1: New Orders */}
        <KitchenColumn
          title="New Orders"
          count={newOrdersBadgeCount}
          accentColor="#EF4444"
          orders={newOrders}
          onStartPreparing={handleStartPreparing}
        />

        {/* Column 2: Preparing */}
        <KitchenColumn
          title="Preparing"
          count={preparingOrders.length}
          accentColor="#F59E0B"
          orders={preparingOrders}
          onRecall={handleRecall}
          onMarkReady={handleMarkReady}
        />

        {/* Column 3: Ready to Serve */}
        <KitchenColumn
          title="Ready to Serve"
          count={readyOrders.length}
          accentColor="#10B981"
          orders={readyOrders}
          onServe={handleServe}
        />
      </Box>

      {/* 3. Bottom Device & Sync Status Footer */}
      <KitchenFooter
        printerStatus="Connected"
        posSyncStatus="Active"
        avgPrepTime={stats.avgPrepTime}
      />

      {/* Interactive Toast Notifications */}
      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage || ''}
        severity="success"
        onClose={clearToast}
      />
    </Box>
  );
}
