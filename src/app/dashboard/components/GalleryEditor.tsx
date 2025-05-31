'use client';

import { useState, useEffect } from 'react';
import { GalleryItem, CreateGalleryDto } from '../../api/gallery/types';
import ImageUpload from '@/components/ImageUpload';
import styles from './GalleryEditor.module.css';

interface GalleryEditorProps {
  item?: GalleryItem;
  onSave: (data: CreateGalleryDto) => Promise<boolean>;
  onClose: () => void;
}

export default function GalleryEditor({ item, onSave, onClose }: GalleryEditorProps) {
  const [formData, setFormData] = useState({
    caption: '',
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        caption: item.caption || '',
        imageUrl: item.imageUrl || '',
      });
    } else {
      setFormData({
        caption: '',
        imageUrl: '',
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (result: { url: string; publicId?: string }) => {
    setFormData(prev => ({ ...prev, imageUrl: result.url }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const backendData: CreateGalleryDto = {
        caption: formData.caption,
        imageUrl: formData.imageUrl
      };
      
      const success = await onSave(backendData);
      if (success) {
        onClose();
      }
    } catch (err) {
      setError('Failed to save gallery item. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.editorHeader}>
          <h2>{item ? 'Edit Gallery Item' : 'Add Gallery Item'}</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>        <form onSubmit={handleSubmit} className={styles.editorForm}>
          <div className={styles.formGroup}>
            <label htmlFor="caption">Caption</label>
            <textarea
              id="caption"
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              required
              placeholder="Enter a caption for this gallery item"
              rows={3}
              className={styles.formTextarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Gallery Image</label>
            <div className={styles.imageUploadContainer}>
              <ImageUpload
                currentImageUrl={formData.imageUrl}
                onUpload={handleImageUpload}
                onError={(error) => setError(error)}
                folder="gallery"
              />
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.spinner}></span>
              ) : (
                item ? 'Update Item' : 'Create Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}