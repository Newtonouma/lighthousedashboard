'use client';

import Image from 'next/image';
import { Cause } from '../../api/causes/types';
import styles from "./CauseCard.module.css";

interface CauseCardProps {
  cause: Cause;
  onEdit: (cause: Cause) => void;
  onDelete: (id: string) => void;
}

export default function CauseCard({ cause, onEdit, onDelete }: CauseCardProps) {
  return (
    <div className={styles.card}>
      {cause.imageUrl && (
        <div className={styles.imageContainer}>
          <Image
            src={cause.imageUrl}
            alt={`${cause.title} image`}
            width={400}
            height={200}
            className={styles.cardImage}
          />
        </div>
      )}
      <div className={styles.cardContent}>
        <h2 className={styles.cardTitle}>{cause.title}</h2>
        <div 
          className={styles.cardDescription}
          dangerouslySetInnerHTML={{ __html: cause.description }}
        />
        <div className={styles.cardMeta}>
          <span className={styles.causeCategory}>
            {cause.category}
          </span>
          <span className={styles.causeGoal}>
            Goal: ${cause.goal}
          </span>
        </div>
        <div className={styles.cardActions}>
          <button 
            className={styles.editButton}
            onClick={() => onEdit(cause)}
          >
            Edit
          </button>
          <button 
            className={styles.deleteButton}
            onClick={() => cause.id && onDelete(cause.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}