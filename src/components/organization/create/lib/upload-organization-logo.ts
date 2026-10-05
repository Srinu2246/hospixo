export type OrganizationLogoUploadResult = Readonly<{
  assetId: string;
  displayUrl?: string;
  filename: string;
}>;

/** Local dev logo upload — stores an object URL preview without a platform assets API. */
export async function uploadOrganizationLogo(file: File): Promise<OrganizationLogoUploadResult> {
  const assetId = `local-${Date.now()}`;
  return {
    assetId,
    displayUrl: URL.createObjectURL(file),
    filename: file.name,
  };
}
