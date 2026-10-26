'use client';

import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import Typography from '@mui/material/Typography';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';

const PRINT_ROOT_ID = 'section-qr-print-root';
const PRINT_ACTIVE_CLASS = 'section-qr-print-active';

export interface SectionQrPrintSheetProps {
  dataUrl: string;
  title: string;
  scanHint: string;
  menuUrl: string;
}

export interface SectionQrPrintSheetHandle {
  print: () => void;
}

/** Off-screen layout used when printing section QR codes from the floor setup dialog. */
export const SectionQrPrintSheet = forwardRef<
  SectionQrPrintSheetHandle,
  Readonly<SectionQrPrintSheetProps>
>(function SectionQrPrintSheet({ dataUrl, title, scanHint, menuUrl }, ref) {
  const [portalTarget] = useState(() => (typeof document !== 'undefined' ? document.body : null));

  useImperativeHandle(ref, () => ({
    print() {
      if (typeof window === 'undefined') return;
      document.documentElement.classList.add(PRINT_ACTIVE_CLASS);
      const cleanup = () => {
        document.documentElement.classList.remove(PRINT_ACTIVE_CLASS);
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
      window.print();
    },
  }));

  if (!portalTarget) return null;

  return createPortal(
    <>
      <GlobalStyles
        styles={{
          '@media print': {
            [`html.${PRINT_ACTIVE_CLASS} body *`]: { visibility: 'hidden' },
            [`html.${PRINT_ACTIVE_CLASS} #${PRINT_ROOT_ID}`]: {
              visibility: 'visible',
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
            },
            [`html.${PRINT_ACTIVE_CLASS} #${PRINT_ROOT_ID} *`]: { visibility: 'visible' },
          },
        }}
      />
      <Box
        id={PRINT_ROOT_ID}
        aria-hidden
        sx={{
          position: 'fixed',
          left: -10000,
          top: 0,
          width: 480,
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography component="h1" sx={{ fontSize: 18, fontWeight: 700, mb: 2, m: 0 }}>
          {title}
        </Typography>
        <Box
          component="img"
          src={dataUrl}
          alt=""
          width={280}
          height={280}
          sx={{ display: 'block', mx: 'auto' }}
        />
        <Typography sx={{ mt: 2, mb: 1, fontWeight: 600 }}>{scanHint}</Typography>
        <Typography sx={{ m: 0, fontSize: 13, color: 'text.secondary' }}>{menuUrl}</Typography>
      </Box>
    </>,
    portalTarget,
  );
});
