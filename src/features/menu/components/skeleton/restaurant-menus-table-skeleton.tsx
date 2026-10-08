'use client';

import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

export function RestaurantMenusTableSkeleton() {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton width="60%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 4 }).map((_, row) => (
            <TableRow key={row}>
              {Array.from({ length: 6 }).map((_, col) => (
                <TableCell key={col}>
                  <Skeleton />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
