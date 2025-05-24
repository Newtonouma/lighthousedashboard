'use client';

import { useState, useEffect } from 'react';
import { GalleryItem } from '../../api/gallery/types';
import { useGallery } from '../hooks/useGallery';
import GalleryCard from './GalleryCard';
import GalleryEditor from './GalleryEditor';

export default function GalleryPanel() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | undefined>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { loading, error, fetchGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } = useGallery();

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const data = await fetchGallery();
      if (data) {
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to load gallery:', err);
    }
  };

  const handleCreate = () => {
    setSelectedItem(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      const success = await deleteGalleryItem(id);
      if (success) {
        setItems(items.filter(item => item.id !== id));
      }
    }
  };

  const handleSave = async (data: any) => {
    let success;
    if (selectedItem) {
      success = await updateGalleryItem(selectedItem.id, data);
      if (success) {
        setItems(items.map(item => 
          item.id === selectedItem.id ? { ...item, ...data } : item
        ));
      }
    } else {
      success = await createGalleryItem(data);
      if (success) {
        await loadGallery(); // Reload to get the new item with ID
      }
    }
    return success;
  };

  if (loading) {
    return (
      <div className="gallery-panel">
        <div className="loading">Loading gallery items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-panel">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="gallery-panel">
      <div className="panel-header">
        <h2>Gallery Items</h2>
        <button
          className="btn-primary"
          onClick={handleCreate}
        >
          Add Gallery Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No gallery items yet. Click "Add Gallery Item" to get started.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map(item => (
            <GalleryCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isEditorOpen && (
        <GalleryEditor
          item={selectedItem}
          onSave={handleSave}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedItem(undefined);
          }}
        />
      )}
    </div>
  );
} 