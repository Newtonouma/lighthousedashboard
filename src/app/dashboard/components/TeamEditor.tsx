'use client';

import { useState, useRef } from 'react';
import { Team, CreateTeamDto } from '../../api/teams/types';
import Image from 'next/image';

interface TeamEditorProps {
  team?: Team;
  onSave: (team: CreateTeamDto) => Promise<void>;
  onClose: () => void;
}

export default function TeamEditor({ team, onSave, onClose }: TeamEditorProps) {
  const [formData, setFormData] = useState<CreateTeamDto>({
    name: team?.name || '',
    description: team?.description || '',
    imageUrl: team?.imageUrl || '',
    role: team?.role || '',
    linkedinUrl: team?.linkedinUrl || '',
    twitterUrl: team?.twitterUrl || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(team?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setError('Failed to save team member. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
            <label htmlFor="role">Role</label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              placeholder="Enter team member's role"
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
            <div className="image-upload-container">
              {previewUrl ? (
                <div className="image-preview">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={300}
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
                    aria-label="Upload profile image"
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="linkedinUrl">LinkedIn URL</label>
            <input
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="Enter LinkedIn profile URL"
            />
          </div>

          <div className="form-group">
            <label htmlFor="twitterUrl">Twitter URL</label>
            <input
              type="url"
              id="twitterUrl"
              name="twitterUrl"
              value={formData.twitterUrl}
              onChange={handleChange}
              placeholder="Enter Twitter profile URL"
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