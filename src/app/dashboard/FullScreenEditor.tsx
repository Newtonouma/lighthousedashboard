import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useState, useRef } from 'react';
import { Cause, CauseImage } from '../api/causes/types';
import NextImage from 'next/image';

interface FullScreenEditorProps {
  cause: Cause;
  onSave: (updatedCause: Partial<Cause>) => Promise<void>;
  onClose: () => void;
}

export default function FullScreenEditor({ cause, onSave, onClose }: FullScreenEditorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(cause.title);
  const [category, setCategory] = useState(cause.category);
  const [goal, setGoal] = useState(cause.goal);
  const [images, setImages] = useState<CauseImage[]>(cause.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: cause.description,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploadingImages(true);
    setError(null);

    try {
      // Validate files
      const validFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
          console.error('Invalid file type:', file.type);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          console.error('File too large:', file.name);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        throw new Error('No valid files selected');
      }

      const formData = new FormData();
      validFiles.forEach(file => formData.append('files', file));

      console.log('Uploading files:', validFiles.map(f => f.name));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      console.log('Upload response:', data);

      if (!data.files?.length) {
        throw new Error('No files were uploaded');
      }

      // Create new image objects with required fields
      const newImages: CauseImage[] = data.files.map((file: { url: string }, index: number) => ({
        id: crypto.randomUUID(), // Generate a unique ID
        url: file.url,
        alt: title || 'Cause image',
        order: images.length + index,
        createdAt: new Date().toISOString()
      }));

      setImages(prevImages => [...prevImages, ...newImages]);
      console.log('Images state updated successfully');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format the data to match the backend structure
      const formattedData: Partial<Cause> = {
        title: title.trim(),
        description: editor?.getHTML() || '',
        category: category,
        goal: Number(goal),
        images: images.map((img, index) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || title.trim(),
          order: index,
          createdAt: img.createdAt || new Date().toISOString()
        })),
        updatedAt: new Date().toISOString()
      };

      // Validate required fields
      if (!formattedData.title) {
        throw new Error('Title is required');
      }
      if (!formattedData.category) {
        throw new Error('Category is required');
      }
      if (formattedData.goal <= 0) {
        throw new Error('Goal amount must be greater than 0');
      }
      if (!formattedData.description) {
        throw new Error('Description is required');
      }

      await onSave(formattedData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cause');
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="fullscreen-editor">
      <div className="editor-header">
        <h2>Edit Cause</h2>
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Environment">Environment</option>
            <option value="Social">Social</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="goal">Goal Amount ($)</label>
          <input
            type="number"
            id="goal"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Images</label>
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={image.id} className="image-item">
                <NextImage
                  src={image.url}
                  alt={image.alt}
                  width={200}
                  height={150}
                  className="preview-image"
                />
                <div className="image-info">
                  <span className="image-order">Order: {image.order}</span>
                  <span className="image-date">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-danger remove-image"
                  onClick={() => removeImage(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="image-upload-container">
              <div className="upload-placeholder">
                <p>Click to add images</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                >
                  {uploadingImages ? 'Uploading...' : 'Add Images'}
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                aria-label="Upload cause images"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <div className="editor-toolbar">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive('bold') ? 'is-active' : ''}
            >
              Bold
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive('italic') ? 'is-active' : ''}
            >
              Italic
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor?.isActive('heading') ? 'is-active' : ''}
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={editor?.isActive('bulletList') ? 'is-active' : ''}
            >
              Bullet List
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={editor?.isActive('orderedList') ? 'is-active' : ''}
            >
              Numbered List
            </button>
            <button type="button" onClick={addLink}>
              Add Link
            </button>
            <button type="button" onClick={addImage}>
              Add Image
            </button>
          </div>
          <div className="editor-content">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="editor-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}