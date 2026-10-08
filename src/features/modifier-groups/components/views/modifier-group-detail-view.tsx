'use client';

import { useEffect, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { Pencil } from 'lucide-react';

import { CrudDetailCard, type CrudDetailCardField } from '@/components/ui/crud-detail-card';
import { CrudDetailHeader } from '@/components/ui/crud-detail-header';
import { StickyBreadcrumbBar } from '@/components/ui/sticky-breadcrumb-bar';
import { useModifierGroups } from '../../context/modifier-groups-context';
import { ModifierOptionsPanel } from '../shared/modifier-options-panel';

export function ModifierGroupDetailView() {
  const {
    selectedGroup,
    detailLoading,
    detailError,
    backToList,
    openEditGroupPage,
    loadGroupDetail,
  } = useModifierGroups();

  const selectedGroupId = selectedGroup?.id;
  const hasDetails = selectedGroup?.minSelect !== undefined;

  useEffect(() => {
    if (!selectedGroupId || hasDetails) return;
    void loadGroupDetail(selectedGroupId);
  }, [hasDetails, loadGroupDetail, selectedGroupId]);

  const fields = useMemo<readonly CrudDetailCardField[]>(() => {
    if (!selectedGroup) return [];
    const isActive = (selectedGroup.status ?? 'active').toLowerCase() === 'active';
    return [
      { label: 'Group Name', value: selectedGroup.name, bold: true },
      {
        label: 'Selection Rules',
        value: `Min ${selectedGroup.minSelect} – Max ${selectedGroup.maxSelect}`,
      },
      {
        label: 'Requirement',
        value: (
          <Chip
            size="small"
            label={selectedGroup.isRequired ? 'Required' : 'Optional'}
            color={selectedGroup.isRequired ? 'primary' : 'default'}
            variant={selectedGroup.isRequired ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        label: 'Status',
        value: (
          <Chip
            size="small"
            label={isActive ? 'Active' : 'Inactive'}
            color={isActive ? 'success' : 'default'}
            variant="outlined"
          />
        ),
      },
    ];
  }, [selectedGroup]);

  if (!selectedGroup) return null;

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <StickyBreadcrumbBar
        items={[
          { label: 'Dashboard', href: '/company' },
          { label: 'Modifier Groups', onClick: backToList },
          { label: selectedGroup.name },
        ]}
      />

      <CrudDetailHeader
        title={selectedGroup.name}
        subtitle="Modifier Group Details"
        onBack={backToList}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Pencil size={15} />}
            onClick={() => openEditGroupPage(selectedGroup)}
            sx={{
              height: 40,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Edit Group
          </Button>
        }
      />

      {detailError ? (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {detailError}
        </Alert>
      ) : null}

      <CrudDetailCard
        title="Group Information"
        loading={detailLoading && !hasDetails}
        fields={fields}
      />

      <ModifierOptionsPanel groupId={selectedGroup.id} />
    </Box>
  );
}
