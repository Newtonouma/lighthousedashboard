'use client';

import { GalleryItem } from '../../api/gallery/types';
import styles from "./GalleryCard.module.css";

interface GalleryCardProps {
  item: GalleryItem;
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
}

export default function GalleryCard({ item, onEdit, onDelete }: GalleryCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardImage}>
        <img src={item.src} alt={item.alt} />
      </div>
      <div className={styles.cardContent}>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className={styles.galleryActions}>
          <button
            className="btn-secondary"
            onClick={() => onEdit(item)}
          >
            Edit
          </button>
          <button
            className="btn-danger"
            onClick={() => onDelete(item.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 