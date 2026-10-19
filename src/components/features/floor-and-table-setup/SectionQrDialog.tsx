'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Modal } from '@/components/shared/ui/Modal';
import { printSectionQr } from '@/lib/helpers/floor-and-table-setup/printSectionQr';
import type { SectionGuestMenuTarget } from '@/lib/helpers/floor-and-table-setup/guestMenuUrl';
import { useSectionGuestMenuUrl } from '@/lib/hooks/floor-and-table-setup/useSectionGuestMenuUrl';
import { useSectionQrImage } from '@/lib/hooks/floor-and-table-setup/useSectionQrImage';
import { sectionQrCopy } from '@/lib/strings/floor-and-table-setup/sectionQrCopy';
import { colors } from '@/lib/theme/mui/colors';

export type SectionQrDialogProps = Readonly<{
  open: boolean;
  section: SectionGuestMenuTarget | null;
  floorId: string | null;
  outletLabel: string;
  outletId?: string | null;
  branchId: string | number | null;
  onClose: () => void;
}>;

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

export function SectionQrDialog({
  open,
  section,
  floorId,
  outletLabel,
  outletId,
  branchId,
  onClose,
}: SectionQrDialogProps) {
  const {
    menuUrl,
    error: menuUrlError,
    isPending: menuUrlPending,
  } = useSectionGuestMenuUrl({
    section: open ? section : null,
    outletLabel,
    outletId,
    floorId,
    branchId,
  });
  const {
    dataUrl,
    error: qrError,
    isPending: qrPending,
  } = useSectionQrImage(open ? menuUrl : null);
  const isPending = menuUrlPending || qrPending;
  const error = menuUrlError ?? qrError;
  const sectionName = section?.name?.trim() || 'Section';

  function handlePrint() {
    if (!dataUrl || !menuUrl) return;
    printSectionQr({
      dataUrl,
      title: sectionQrCopy.dialogTitle(sectionName),
      scanHint: sectionQrCopy.scanHint,
      menuUrl,
    });
  }

  function handleDownloadPdf() {
    handlePrint();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={section ? sectionQrCopy.dialogTitle(sectionName) : undefined}
      width={400}
      height="auto"
      padding={20}
      gap={16}
      paperSx={{ maxHeight: '92vh' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
        {isPending ? (
          <Box sx={{ py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        ) : dataUrl && section ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5, pb: 2 }}>
            <Box
              component="img"
              src={dataUrl}
              alt={sectionQrCopy.qrAlt(sectionName)}
              sx={{
                width: 280,
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '6px',
              }}
            />
          </Box>
        ) : null}
        {menuUrl ? (
          <>
            <Typography sx={{ m: 0, textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
              {sectionQrCopy.scanHint}
            </Typography>
            <Typography
              sx={{
                display: 'block',
                mt: 0.5,
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: 'text.secondary',
                wordBreak: 'break-all',
              }}
            >
              {menuUrl}
            </Typography>
          </>
        ) : null}
        <Stack spacing={1.25} sx={{ width: '100%', pt: 0.5 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={!dataUrl || !section}
            onClick={() => {
              if (!dataUrl || !section) return;
              downloadDataUrl(dataUrl, sectionQrCopy.fileNamePng(sectionName));
            }}
          >
            {sectionQrCopy.downloadPng}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            disabled={!dataUrl || !section}
            onClick={handleDownloadPdf}
          >
            {sectionQrCopy.downloadPdf}
          </Button>
          <Button
            variant="text"
            disabled={!dataUrl || !section}
            onClick={handlePrint}
            sx={{
              alignSelf: 'center',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: colors.primary.default,
              textDecoration: 'underline',
              textUnderlineOffset: '0.15rem',
            }}
          >
            {sectionQrCopy.printQr}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
