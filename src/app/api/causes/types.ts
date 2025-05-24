export interface CauseImage {
  id?: string;
  url: string;
  alt: string;
  order: number;
  createdAt?: string;
}

export interface Cause {
  id?: string;
  title: string;
  description: string;
  goal: number;
  category: string;
  images: CauseImage[];
  createdAt?: string;
  updatedAt?: string;
} 