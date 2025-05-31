'use client';

import { useState } from 'react';
import { Team, CreateTeamDto, UpdateTeamDto } from '../../api/teams/types';
import ImageUpload from '@/components/ImageUpload';

interface TeamEditorProps {
  team?: Team;
  onSave: (team: CreateTeamDto | UpdateTeamDto) => Promise<void>;
  onClose: () => void;
}

export default function TeamEditor({ team, onSave, onClose }: TeamEditorProps) {
  const [formData, setFormData] = useState({
    name: team?.name || '',
    description: team?.description || '',
    imageUrl: team?.imageUrl || '',
    contact: team?.contact || '',
    email: team?.email || '',
    facebook: team?.facebook || '',
    linkedin: team?.linkedin || '',
    twitter: team?.twitter || '',
    tiktok: team?.tiktok || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (uploadResult: { url: string }) => {
    setFormData(prev => ({ ...prev, imageUrl: uploadResult.url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Only send non-empty fields
      const payload: Partial<Team> = {
        name: formData.name.trim(),
        description: formData.description,
        imageUrl: formData.imageUrl
      };

      if (formData.contact.trim()) payload.contact = formData.contact.trim();
      if (formData.email.trim()) payload.email = formData.email.trim();
      if (formData.facebook.trim()) payload.facebook = formData.facebook.trim();
      if (formData.linkedin.trim()) payload.linkedin = formData.linkedin.trim();
      if (formData.twitter.trim()) payload.twitter = formData.twitter.trim();
      if (formData.tiktok.trim()) payload.tiktok = formData.tiktok.trim();

      await onSave(payload);
      onClose();
    } catch (err) {
      setError('Failed to save team member. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="team-editor">
      <div className="editor-form">
        <div className="form-header">
          <h2>{team ? 'Edit Team Member' : 'Add New Team Member'}</h2>
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
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter team member's name"
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
              placeholder="Enter team member's description"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Profile Image</label>
            <ImageUpload
              currentImageUrl={formData.imageUrl}
              onUpload={handleImageUpload}
              onError={(error) => setError(error)}
              folder="teams"
              maxFileSize={10 * 1024 * 1024}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Number</label>
            <input
              type="tel"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter contact number (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="linkedin">LinkedIn URL</label>
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="Enter LinkedIn profile URL (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="twitter">Twitter URL</label>
            <input
              type="url"
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="Enter Twitter profile URL (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="facebook">Facebook URL</label>
            <input
              type="url"
              id="facebook"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="Enter Facebook profile URL (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tiktok">TikTok URL</label>
            <input
              type="url"
              id="tiktok"
              name="tiktok"
              value={formData.tiktok}
              onChange={handleChange}
              placeholder="Enter TikTok profile URL (optional)"
            />
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
              {isSubmitting ? 'Saving...' : 'Save Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}