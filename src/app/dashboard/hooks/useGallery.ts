import { useState, useCallback } from 'react';
import { GalleryItem, CreateGalleryDto, UpdateGalleryDto } from '../../api/gallery/types';

export function useGallery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGallery = useCallback(async (): Promise<GalleryItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery items');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createGalleryItem = useCallback(async (data: CreateGalleryDto): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create gallery item');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gallery item');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGalleryItem = useCallback(async (id: string, data: UpdateGalleryDto): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update gallery item');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gallery item');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGalleryItem = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete gallery item');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gallery item');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchGallery,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  };
} 