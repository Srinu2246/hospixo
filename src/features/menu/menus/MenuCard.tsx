'use client';

import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { Card } from '@/components/shared/ui/Card';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { TagsGrid } from '@/components/shared/ui/TagsGrid';
import { formatUpdatedAgo } from '@/lib/helpers';
import type { MenuSessionItem } from '@/lib/mocks/menu/useMenus.mocks';
import { colors } from '@/lib/theme/mui/colors';

export interface MenuCardProps {
  menu: MenuSessionItem;
  onView?: (menu: MenuSessionItem) => void;
  onEdit?: (menu: MenuSessionItem) => void;
  onDeactivate?: (menu: MenuSessionItem) => void;
  onActivate?: (menu: MenuSessionItem) => void;
  sx?: SxProps<Theme>;
}

/**
 * Meal-session card: name, status, menu type, updated stamp, View / Edit / Activate|Deactivate.
 */
export function MenuCard({
  menu,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  sx,
}: Readonly<MenuCardProps>) {
  const isActive = menu.status === 'active';
  const statusActionLabel = isActive ? 'Deactivate' : 'Activate';
  const statusAction = isActive ? onDeactivate : onActivate;

  return (
    <Card
      variant="outlined"
      padding={2}
      headerPadding={2}
      footerPadding={2}
      borderRadius="12px"
      title={
        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            lineHeight: 1.3,
            color: colors.text.primary,
            letterSpacing: '-0.01em',
          }}
        >
          {menu.name}
        </Typography>
      }
      action={
        <StatusChip
          label={isActive ? 'Active' : 'Inactive'}
          variantType={isActive ? 'success' : 'default'}
          pill
          size="small"
          sx={{ flexShrink: 0, height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
        />
      }
      footer={
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography
            variant="caption"
            sx={{ color: colors.text.secondary, fontSize: '0.75rem', lineHeight: 1.4 }}
          >
            {formatUpdatedAgo(menu.updatedAt)}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0, alignItems: 'center' }}>
            <CardAction label="View" tone="primary" onClick={() => onView?.(menu)} />
            <CardAction label="Edit" tone="neutral" onClick={() => onEdit?.(menu)} />
            <CardAction
              label={statusActionLabel}
              tone={isActive ? 'danger' : 'success'}
              onClick={() => statusAction?.(menu)}
            />
          </Stack>
        </Stack>
      }
      footerDivider
      sx={{
        height: '100%',
        bgcolor: colors.surface.default,
        borderColor: colors.border.default,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Typography
        component="span"
        sx={{
          display: 'block',
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: colors.text.secondary,
          mb: 0.75,
        }}
      >
        Menu type:
      </Typography>
      <TagsGrid tags={[menu.menuType]} variantType="info" size="small" pill maxVisible={4} />
    </Card>
  );
}

function CardAction({
  label,
  tone,
  onClick,
}: Readonly<{
  label: string;
  tone: 'primary' | 'neutral' | 'danger' | 'success';
  onClick?: () => void;
}>) {
  const color =
    tone === 'primary'
      ? colors.primary.default
      : tone === 'danger'
        ? colors.danger.default
        : tone === 'success'
          ? colors.success.default
          : colors.text.primary;

  return (
    <ButtonBase
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      disableRipple
      sx={{
        color,
        fontSize: '0.8125rem',
        fontWeight: 600,
        lineHeight: 1.2,
        px: 0.25,
        py: 0.25,
        borderRadius: '4px',
        '&:hover': { opacity: 0.8 },
      }}
    >
      {label}
    </ButtonBase>
  );
}
