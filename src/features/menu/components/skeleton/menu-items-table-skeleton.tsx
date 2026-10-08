'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const TABLE_ROW_KEYS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'] as const;

export function MenuItemsTableSkeleton() {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      aria-busy="true"
      aria-label="Loading menu items"
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 64 }}>
              <Skeleton variant="text" width={40} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={80} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={90} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={70} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={60} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={80} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={70} />
            </TableCell>
            <TableCell align="right" sx={{ width: 100 }}>
              <Skeleton variant="text" width={50} sx={{ ml: 'auto' }} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {TABLE_ROW_KEYS.map((rowKey) => (
            <TableRow key={rowKey}>
              <TableCell>
                <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 1 }} />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width={140} />
              </TableCell>
              <TableCell>
                <Skeleton variant="rounded" width={75} height={24} sx={{ borderRadius: 1 }} />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width={90} />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width={50} />
              </TableCell>
              <TableCell>
                <Skeleton variant="rounded" width={50} height={22} sx={{ borderRadius: 1 }} />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width={60} />
              </TableCell>
              <TableCell>
                <Skeleton variant="rounded" width={65} height={24} sx={{ borderRadius: 1 }} />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Skeleton variant="circular" width={28} height={28} />
                  <Skeleton variant="circular" width={28} height={28} />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
