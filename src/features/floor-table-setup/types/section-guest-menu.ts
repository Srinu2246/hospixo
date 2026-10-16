/** Section identity encoded in guest-menu / QR URLs. */
export type SectionGuestMenuTarget = Readonly<{
  id: string;
  code?: string;
  name: string;
}>;
