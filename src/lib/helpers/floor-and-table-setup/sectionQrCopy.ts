export const sectionQrCopy = {
  downloadQr: 'Download QR',
  dialogTitle: (sectionName: string) => `${sectionName} Section Menu`,
  scanHint: 'Scan to view menu',
  downloadPng: 'Download PNG',
  downloadPdf: 'Download PDF',
  printQr: 'Print QR Code',
  qrAlt: (sectionName: string) => `QR code for ${sectionName} guest menu`,
  fileNamePng: (sectionName: string) =>
    `${sectionName.replace(/\s+/g, '-').toLowerCase()}-section-menu.png`,
  fileNamePdf: (sectionName: string) =>
    `${sectionName.replace(/\s+/g, '-').toLowerCase()}-section-menu.pdf`,
} as const;
