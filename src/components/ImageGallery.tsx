'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './ImageGallery.module.css';

export interface ImageItem {
  id: string;
  url: string;
  alt: string;
  order: number;
  createdAt?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  onDelete?: (id: string) => void;
  onReorder?: (images: ImageItem[]) => void;
  showControls?: boolean;
}

export default function ImageGallery({ 
  images, 
  onDelete, 
  onReorder, 
  showControls = true 
}: ImageGalleryProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedId || !onReorder) return;

    const draggedIndex = images.findIndex(img => img.id === draggedId);
    const targetIndex = images.findIndex(img => img.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);

    // Update order values
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index
    }));

    onReorder(reorderedImages);
    setDraggedId(null);
  };

  if (!images || images.length === 0) {
    return (
      <div className={styles.emptyGallery}>
        <p>No images uploaded</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {images.map((image) => (
        <div
          key={image.id}
          className={styles.imageItem}
          draggable={showControls}
          onDragStart={(e) => handleDragStart(e, image.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, image.id)}
        >
          <div className={styles.imageWrapper}>
            <Image
              src={image.url}
              alt={image.alt}
              width={200}
              height={150}
              style={{ objectFit: 'cover' }}
              className={styles.image}
            />
            
            {showControls && onDelete && (
              <button
                className={styles.deleteButton}
                onClick={() => onDelete(image.id)}
                type="button"
                aria-label={`Delete ${image.alt}`}
              >
                ×
              </button>
            )}
          </div>
          
          {showControls && (
            <div className={styles.imageInfo}>
              <span className={styles.order}>#{image.order + 1}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}