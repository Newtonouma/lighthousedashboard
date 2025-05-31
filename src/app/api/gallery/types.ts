export interface GalleryItem {
  id?: string;
  caption: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type alias for creating gallery items (excludes auto-generated fields)
export type CreateGalleryDto = Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>;

// Type alias for updating gallery items (excludes auto-generated fields)
export type UpdateGalleryDto = Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>;

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateGalleryData(data: Record<string, unknown>): string | null {
  if (!data.caption || typeof data.caption !== 'string' || data.caption.trim() === '') {
    return 'Caption is required and must be a non-empty string';
  }

  if (!data.imageUrl || typeof data.imageUrl !== 'string' || !isValidUrl(data.imageUrl)) {
    return 'Valid image URL is required';
  }

  return null;
}