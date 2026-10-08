import type { MenuItemId } from './menu-item-api';

export type MenuItemImageId = string;

export type MenuItemImageApiStatus = 'active' | 'inactive';

export type ListMenuItemImagesApiQuery = Readonly<{
  status?: MenuItemImageApiStatus;
}>;

export type MenuItemImageApi = Readonly<{
  id: number;
  menu_item_id: number;
  url: string;
  storage_key: string;
  mime_type: string;
  sort_order: number;
  is_primary: boolean;
  status: MenuItemImageApiStatus;
  created_at: string;
  updated_at: string;
}>;

export type CreateMenuItemImageUploadUrlApiRequest = Readonly<{
  filename: string;
  content_type: string;
  file_size: number;
}>;

export type MenuItemImageUploadUrlApi = Readonly<{
  upload_url: string;
  storage_key: string;
  /** CDN/public URL after upload (OpenAPI: `public_url`). */
  url: string;
  public_url?: string;
}>;

export type CreateMenuItemImageApiRequest = Readonly<{
  url: string;
  storage_key: string;
  mime_type: string;
  sort_order?: number;
  is_primary?: boolean;
}>;

export type UpdateMenuItemImageApiRequest = Partial<
  CreateMenuItemImageApiRequest & {
    status: MenuItemImageApiStatus;
  }
>;

export type UploadMenuItemImageInput = Readonly<{
  itemId: MenuItemId;
  file: File;
  sortOrder?: number;
  isPrimary?: boolean;
}>;
