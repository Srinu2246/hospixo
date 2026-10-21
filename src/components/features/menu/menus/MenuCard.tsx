'use client';

import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { Card } from '@/components/shared/ui/Card';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { TagsGrid } from '@/components/shared/ui/TagsGrid';
import { formatUpdatedAgo } from '@/lib/helpers';
import type { MenuAssignment } from '@/lib/schemas/menu/menus/menuListSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface MenuCardProps {
  menu: MenuAssignment;
  onView?: (menu: MenuAssignment) => void;
  onEdit?: (menu: MenuAssignment) => void;
  onDeactivate?: (menu: MenuAssignment) => void;
  onActivate?: (menu: MenuAssignment) => void;
  sx?: SxProps<Theme>;
}

/**
 * Menu assignment card: nested menu name/type, assignment status, updated stamp, actions.
 */
export function MenuCard({
  menu,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  sx,
}: Readonly<MenuCardProps>) {
  const isActive = menu.status.toLowerCase() === 'active';
  const statusActionLabel = isActive ? 'Deactivate' : 'Activate';
  const statusAction = isActive ? onDeactivate : onActivate;
  const menuType = (menu.menu.menu_type || 'all').toUpperCase();

  return (
    <Card
      variant="outlined"
      padding={2}
      headerPadding={2}
      footerPadding={2}
      borderRadius="12px"
      onClick={onView ? () => onView(menu) : undefined}
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
          {menu.menu.name}
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
            {formatUpdatedAgo(menu.updated_at ?? menu.menu.updated_at)}
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
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Typography
          component="span"
          sx={{
            flexShrink: 0,
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: colors.text.secondary,
          }}
        >
          Menu type:
        </Typography>
        <TagsGrid
          tags={[menuType]}
          variantType="info"
          size="small"
          pill
          maxVisible={4}
          sx={{ flex: 1, minWidth: 0 }}
        />
      </Stack>
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
