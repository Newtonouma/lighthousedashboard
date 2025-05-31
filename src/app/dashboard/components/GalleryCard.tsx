'use client';

import Image from 'next/image';
import { GalleryItem } from '../../api/gallery/types';
import styles from "./GalleryCard.module.css";

interface GalleryCardProps {
  item: GalleryItem;
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
}

export default function GalleryCard({ item, onEdit, onDelete }: GalleryCardProps) {
  const getImageUrl = () => {
    if (item.imageUrl) {
      try {
        new URL(item.imageUrl);
        return item.imageUrl;
      } catch {
        return 'https://via.placeholder.com/300x200?text=Invalid+Image';
      }
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  return (
    <div className={styles.card}>      <div className={styles.imageContainer}>
        <Image 
          src={getImageUrl()} 
          alt={item.caption || 'Gallery image'}
          width={300}
          height={200}
          className={styles.cardImage}
        />
      </div>
      
      <div className={styles.cardContent}>
        <p className={styles.cardCaption}>{item.caption}</p>
        
        <div className={styles.galleryActions}>
          <button
            className={styles.editButton}
            onClick={() => onEdit(item)}
          >
            <EditIcon />
            Edit
          </button>          <button
            className={styles.deleteButton}
            onClick={() => item.id && onDelete(item.id)}
          >
            <DeleteIcon />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple icon components (you can replace with actual icons from your library)
function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}