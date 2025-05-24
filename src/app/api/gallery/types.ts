export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
}

export interface CreateGalleryDto {
  src: string;
  alt: string;
  title: string;
  description: string;
}

export interface UpdateGalleryDto {
  src?: string;
  alt?: string;
  title?: string;
  description?: string;
} 