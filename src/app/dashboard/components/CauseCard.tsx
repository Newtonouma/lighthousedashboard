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
      {cause.images && cause.images[0] && (
        <Image
          src={cause.images[0].url}
          alt={cause.images[0].alt}
          width={400}
          height={192}
          className={styles.cardImage}
        />
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
            Goal: ${cause.goal.toLocaleString()}
          </span>
        </div>
        <div className={styles.cardActions}>
          <button 
            className="btn-secondary"
            onClick={() => onEdit(cause)}
          >
            Edit
          </button>
          <button 
            className="btn-danger"
            onClick={() => cause.id && onDelete(cause.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 