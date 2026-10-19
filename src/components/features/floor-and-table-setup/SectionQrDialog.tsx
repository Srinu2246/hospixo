'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { sectionQrCopy } from '@/lib/helpers/floor-and-table-setup/sectionQrCopy';
import type { SectionGuestMenuTarget } from '@/lib/helpers/floor-and-table-setup/guestMenuUrl';
import { useSectionGuestMenuUrl } from '@/lib/hooks/floor-and-table-setup/useSectionGuestMenuUrl';
import { useSectionQrImage } from '@/lib/hooks/floor-and-table-setup/useSectionQrImage';
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
    if (!dataUrl || !section) return;
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=480,height=640');
    if (!printWindow) return;
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head><title>${sectionQrCopy.dialogTitle(sectionName)}</title></head>
        <body style="font-family:Arial,sans-serif;text-align:center;padding:24px;">
          <h1 style="font-size:18px;margin:0 0 16px;">${sectionQrCopy.dialogTitle(sectionName)}</h1>
          <img src="${dataUrl}" alt="${sectionQrCopy.qrAlt(sectionName)}" width="280" height="280" />
          <p style="margin:16px 0 8px;font-weight:600;">${sectionQrCopy.scanHint}</p>
          <p style="margin:0;font-size:13px;color:#64748b;">${menuUrl ?? ''}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function handleDownloadPdf() {
    if (!dataUrl || !section) return;
    handlePrint();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, pb: 1 }}>
        {section ? sectionQrCopy.dialogTitle(sectionName) : ''}
      </DialogTitle>
      <DialogContent>
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
              {}
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
      </DialogContent>
    </Dialog>
  );
}
