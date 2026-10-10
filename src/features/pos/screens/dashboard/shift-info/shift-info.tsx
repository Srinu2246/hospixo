'use client';

import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import type { ShiftInfo } from '@/features/pos/config/dashboard';
import { DashboardPanel } from '@/features/pos/screens/dashboard/dashboard-panel';

interface ShiftInfoPanelProps {
  shift: ShiftInfo;
}

export function ShiftInfoPanel({ shift }: Readonly<ShiftInfoPanelProps>) {
  const isOpen = shift.status.toLowerCase().includes('open');

  return (
    <DashboardPanel title="Shift Information" titleId="shift-info-title">
      <Table size="small" aria-label="Shift information">
        <TableHead>
          <TableRow>
            <TableCell>Started</TableCell>
            <TableCell>Orders Handled</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{shift.started}</TableCell>
            <TableCell>{shift.ordersHandled}</TableCell>
            <TableCell>
              <Chip
                size="small"
                label={shift.status}
                color={isOpen ? 'success' : 'default'}
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DashboardPanel>
  );
}
