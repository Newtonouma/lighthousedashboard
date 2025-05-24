'use client';

import { useState, useEffect, useRef } from 'react';
import { GalleryItem, CreateGalleryDto } from '../../api/gallery/types';
import Image from 'next/image';

interface GalleryEditorProps {
  item?: GalleryItem;
  onSave: (data: CreateGalleryDto) => Promise<boolean>;
  onClose: () => void;
}

export default function GalleryEditor({ item, onSave, onClose }: GalleryEditorProps) {
  const [formData, setFormData] = useState<CreateGalleryDto>({
    src: '',
    alt: '',
    title: '',
    description: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(item?.src || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        src: item.src,
        alt: item.alt,
        title: item.title,
        description: item.description,
      });
      setPreviewUrl(item.src);
    }
  }, [item]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the image
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, src: data.url }));
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  const renderImagePreview = () => {
    if (!previewUrl) return null;

    // Check if the preview URL is a base64 string
    const isBase64 = previewUrl.startsWith('data:image');
    
    if (isBase64) {
      return (
        <img
          src={previewUrl}
          alt="Preview"
          className="preview-image"
          style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
        />
      );
    }

    // For regular URLs, use Next.js Image component
    return (
      <Image
        src={previewUrl}
        alt="Preview"
        width={400}
        height={300}
        className="preview-image"
        style={{ objectFit: 'contain' }}
      />
    );
  };

  return (
    <div className="gallery-editor">
      <div className="editor-form">
        <div className="form-header">
          <h2>{item ? 'Edit Gallery Item' : 'Add Gallery Item'}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Gallery Image</label>
            <div className="image-upload-container">
              {previewUrl ? (
                <div className="image-preview">
                  {renderImagePreview()}
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => {
                      setPreviewUrl(null);
                      setFormData(prev => ({ ...prev, src: '' }));
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <p>Drag and drop an image here, or click to select</p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={triggerFileInput}
                  >
                    Choose Image
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                    aria-label="Upload gallery image"
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="alt">Alt Text</label>
            <input
              type="text"
              id="alt"
              value={formData.alt}
              onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="editor-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 