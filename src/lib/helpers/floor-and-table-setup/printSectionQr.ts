/** Opens the browser print dialog for a QR data URL (isolated from UI components). */
export function printSectionQr(
  input: Readonly<{
    dataUrl: string;
    title: string;
    scanHint: string;
    menuUrl: string;
  }>,
): void {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    return;
  }

  doc.open();
  doc.write(
    `<!doctype html><html><head><title>${escapeHtml(input.title)}</title></head>` +
      `<body style="font-family:Arial,sans-serif;text-align:center;padding:24px">` +
      `<h1 style="font-size:18px;margin:0 0 16px">${escapeHtml(input.title)}</h1>` +
      `<img src="${input.dataUrl}" alt="" width="280" height="280" />` +
      `<p style="margin:16px 0 8px;font-weight:600">${escapeHtml(input.scanHint)}</p>` +
      `<p style="margin:0;font-size:13px;color:#64748b">${escapeHtml(input.menuUrl)}</p>` +
      `</body></html>`,
  );
  doc.close();

  frame.contentWindow?.focus();
  frame.contentWindow?.print();

  window.setTimeout(() => frame.remove(), 1000);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
