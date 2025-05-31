'use client';

import { useState } from 'react';
import { Event, CreateEventDto } from '../../api/events/types';
import ImageUpload from '@/components/ImageUpload';

interface EventEditorProps {
  event?: Event;
  onSave: (event: CreateEventDto) => Promise<void>;
  onClose: () => void;
}

export default function EventEditor({ event, onSave, onClose }: EventEditorProps) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    endTime: event?.endTime || '',
    location: event?.location || '',
    imageUrl: event?.imageUrl || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const backendData: CreateEventDto = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        imageUrl: formData.imageUrl,
        ...(formData.endTime && { endTime: formData.endTime })
      };
      
      await onSave(backendData);
      onClose();
    } catch (err) {
      setError('Failed to save event. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
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

        <form onSubmit={handleSubmit}>          <div className="form-group">
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter event description"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter event location"
            />
          </div>          <div className="form-group">
            <label>Event Image</label>
            <ImageUpload
              currentImageUrl={formData.imageUrl}
              onUpload={handleImageUpload}
              onError={(error) => setError(error)}
              folder="events"
            />
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
              <label htmlFor="endTime">End Time (Optional)</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                placeholder="HH:MM"
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