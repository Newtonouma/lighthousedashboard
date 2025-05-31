import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useState } from 'react';
import { Cause } from '../api/causes/types';
import ImageUpload from '@/components/ImageUpload';

interface FullScreenEditorProps {
  cause?: Cause;
  onSave: (updatedCause: Partial<Cause>) => Promise<void>;
  onClose: () => void;
}

export default function FullScreenEditor({ cause, onSave, onClose }: FullScreenEditorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(cause?.title || '');
  const [category, setCategory] = useState(cause?.category || '');
  const [goal, setGoal] = useState(cause?.goal?.toString() || '');
  const [imageUrl, setImageUrl] = useState(cause?.imageUrl || '');
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: cause?.description || '',
  });

  const handleImageUpload = (uploadResult: { url: string }) => {
    setImageUrl(uploadResult.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);    try {
      // Parse and validate goal as number
      const goalValue = parseFloat(goal);
      if (isNaN(goalValue) || goalValue < 0) {
        throw new Error('Goal must be a valid number greater than or equal to 0');
      }

      // Format the data to match the backend structure (no updatedAt field)
      const formattedData: Partial<Cause> = {
        title: title.trim(),
        description: editor?.getHTML() || '',
        category: category,
        goal: goalValue, // Send as number
        imageUrl: imageUrl
      };

      // Validate required fields
      if (!formattedData.title) {
        throw new Error('Title is required');
      }      if (!formattedData.category) {
        throw new Error('Category is required');
      }
      if (!formattedData.goal) {
        throw new Error('Goal amount is required');
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
    <div className="fullscreen-editor">      <div className="editor-header">
        <h2>{cause ? 'Edit Cause' : 'Create New Cause'}</h2>
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
        </div>        <div className="form-group">
          <label htmlFor="goal">Goal Amount</label>
          <input
            type="number"
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
            placeholder="Enter goal amount"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Cause Image</label>
          <ImageUpload
            currentImageUrl={imageUrl}
            onUpload={handleImageUpload}
            onError={(error) => setError(error)}
            folder="causes"
            maxFileSize={10 * 1024 * 1024}
          />
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
          </button>          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (cause ? 'Save Changes' : 'Create Cause')}
          </button>
        </div>
      </form>
    </div>
  );
}