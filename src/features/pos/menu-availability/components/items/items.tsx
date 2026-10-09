'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';
import type { MenuItem } from '@/features/pos/types/menu-availability';

type MenuItemsTableProps = Readonly<{
  items: readonly MenuItem[];
  onToggleItem: (itemId: string, available: boolean) => void;
}>;

export function MenuItemsTable({ items, onToggleItem }: MenuItemsTableProps) {
  const { columns, status, visibilityPrefix, emptyCategory } = menuAvailabilityCopy;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
          gap: 2,
          py: 1.25,
          px: 2,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        <span>{columns.name}</span>
        <Box
          component="span"
          sx={{
            width: { xs: 'auto', sm: '9.5rem' },
            textAlign: { xs: 'left', sm: 'right' },
          }}
        >
          {columns.markAs}
        </Box>
      </Box>

      {items.length === 0 ? (
        <Typography
          sx={{
            m: 0,
            p: 4,
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'text.secondary',
          }}
        >
          {emptyCategory}
        </Typography>
      ) : (
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {items.map((item, index) => {
            const available = item.status === 'available';
            const isLast = index === items.length - 1;
            const itemKey =
              item.id && String(item.id).trim() && String(item.id) !== 'undefined'
                ? String(item.id)
                : `item-${item.categoryId || 'cat'}-${item.name || 'item'}-${index}`;

            return (
              <Box
                component="li"
                key={itemKey}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                  gap: 2,
                  alignItems: 'center',
                  p: 2,
                  borderBottom: isLast ? 'none' : '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.25,
                    minWidth: 0,
                  }}
                >
                  <Box
                    component="span"
                    aria-hidden="true"
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: 0.5,
                      border: '1px solid',
                      borderColor: item.diet === 'veg' ? '#16a34a' : '#dc2626',
                      color: item.diet === 'veg' ? '#16a34a' : '#dc2626',
                      mt: 0.4,
                      flexShrink: 0,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 3,
                        borderRadius: 999,
                        bgcolor: 'currentColor',
                      },
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 0.75,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: 'text.primary',
                        }}
                      >
                        {item.name}
                      </Typography>
                      {item.tags.map((tag, tagIndex) => (
                        <Box
                          key={`${tag || 'tag'}-${tagIndex}`}
                          component="span"
                          sx={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            px: 1,
                            py: 0.25,
                            borderRadius: 999,
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        m: 0,
                        mt: 0.5,
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      }}
                    >
                      {visibilityPrefix} {item.visibility}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                    gap: 1.25,
                    width: { xs: 'auto', sm: '9.5rem' },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: available ? '#16a34a' : '#dc2626',
                    }}
                  >
                    {available ? status.available : status.eightySixed}
                  </Typography>
                  <Box
                    component="button"
                    type="button"
                    role="switch"
                    aria-checked={available}
                    aria-label={`Mark ${item.name} as ${available ? "86'd" : 'available'}`}
                    onClick={() => onToggleItem(item.id, !available)}
                    sx={{
                      position: 'relative',
                      width: 38,
                      height: 22,
                      borderRadius: 999,
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      p: 0,
                      bgcolor: available ? '#16a34a' : '#cbd5e1',
                      transition: (theme) => theme.transitions.create('background-color'),
                      '&:focus-visible': {
                        outline: '2px solid #2563eb',
                        outlineOffset: '2px',
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        position: 'absolute',
                        top: 3,
                        left: 3,
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        bgcolor: '#fff',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.2)',
                        transform: available ? 'translateX(16px)' : 'none',
                        transition: (theme) => theme.transitions.create('transform'),
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
