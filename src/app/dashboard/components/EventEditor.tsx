'use client';

import { useState, useRef } from 'react';
import { Event, CreateEventDto } from '../../api/events/types';
import Image from 'next/image';

interface EventEditorProps {
  event?: Event;
  onSave: (event: CreateEventDto) => Promise<void>;
  onClose: () => void;
}

export default function EventEditor({ event, onSave, onClose }: EventEditorProps) {
  const [formData, setFormData] = useState<CreateEventDto>({
    title: event?.title || '',
    shortDescription: event?.shortDescription || '',
    description: event?.description || '',
    category: event?.category || '',
    imageUrl: event?.imageUrl || '',
    date: event?.date || '',
    time: event?.time || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(event?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError('Failed to save event. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="event-editor">
      <div className="editor-form">
        <div className="form-header">
          <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button 
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="shortDescription">Short Description</label>
            <input
              type="text"
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              required
              placeholder="Enter a brief description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="workshop">Workshop</option>
              <option value="conference">Conference</option>
              <option value="seminar">Seminar</option>
              <option value="networking">Networking</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter detailed description"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Event Image</label>
            <div className="image-upload-container">
              {previewUrl ? (
                <div className="image-preview">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="preview-image"
                  />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => {
                      setPreviewUrl(null);
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
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
                    aria-label="Upload event image"
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="editor-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 