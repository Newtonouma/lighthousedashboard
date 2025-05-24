'use client';

import { Cause } from '../../api/causes/types';
import CauseCard from './CauseCard';
import styles from "./CausesSection.module.css";

interface CausesSectionProps {
  causes: Cause[];
  onEdit: (cause: Cause) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export default function CausesSection({ causes, onEdit, onDelete, onCreateNew }: CausesSectionProps) {
  return (
    <>
      <div className={styles.sectionHeader}>
        <h1>Causes</h1>
        <button 
          className="btn-primary"
          onClick={onCreateNew}
        >
          Create New Cause
        </button>
      </div>
      <div className={styles.cardGrid}>
        {causes.map((cause) => (
          <CauseCard
            key={cause.id}
            cause={cause}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
} 