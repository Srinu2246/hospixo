'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye, Plus, Receipt } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { TablePagination } from '@/components/shared/ui/TablePagination';
import { formatGstEffectiveDate, formatGstPercent } from '@/lib/helpers/menu/gstRateDisplayHelpers';
import { menuCompactListContainerSx } from '@/lib/helpers/menu/menuLayout';
import { screen } from '@/lib/theme/mui/breakpoints';
import type { GstRate } from '@/lib/schemas/menu/gstRatesSchema';

export interface GstRatesCompactListProps {
  rates: readonly GstRate[];
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onView: (rate: GstRate) => void;
}

/**
 * Mobile/tablet GST rate rows — desktop uses DataGrid in GstRatesTable.
 */
export function GstRatesCompactList({
  rates,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onCreate,
  onView,
}: Readonly<GstRatesCompactListProps>) {
  if (rates.length === 0) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          p: { [screen.mobile]: 2, [screen.tablet]: 2, [screen.desktop]: 3 },
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5, color: 'primary.main' }}>
          <Receipt size={32} strokeWidth={1.5} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          No GST rates yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Create your first GST slab to start mapping tax rates to menu items and billing.
        </Typography>
        <ActionButton startIcon={<Plus size={16} />} onClick={onCreate} fullWidth>
          Create GST Rate
        </ActionButton>
      </Box>
    );
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const rangeStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRows);

  return (
    <Box sx={menuCompactListContainerSx}>
      <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
        {rates.map((rate) => (
          <Box
            key={rate.id}
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              gap: 0.5,
              width: '100%',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ButtonBase
              onClick={() => onView(rate)}
              aria-label={`View GST rate ${rate.code}`}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0.75,
                p: 1.5,
                pr: 0.5,
                borderRadius: 0,
                textAlign: 'left',
              }}
            >
              <Box sx={{ width: '100%', minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                  {rate.code}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                  noWrap
                >
                  {rate.name}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                CGST {formatGstPercent(rate.cgst_rate)} · SGST {formatGstPercent(rate.sgst_rate)} ·
                IGST {formatGstPercent(rate.igst_rate)}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Total {formatGstPercent(rate.total_rate)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  From {formatGstEffectiveDate(rate.effective_from)}
                </Typography>
              </Stack>
            </ButtonBase>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                py: 1.5,
                pr: 1,
              }}
            >
              <IconButton
                size="small"
                aria-label={`View ${rate.code}`}
                onClick={() => onView(rate)}
                sx={{ color: 'primary.main' }}
              >
                <Eye size={18} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Stack>

      {totalRows > pageSize ? (
        <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <TablePagination
            page={page}
            pageCount={pageCount}
            onPageChange={onPageChange}
            summary={`Showing ${rangeStart}-${rangeEnd} of ${totalRows} GST rates`}
          />
        </Box>
      ) : null}
    </Box>
  );
}
