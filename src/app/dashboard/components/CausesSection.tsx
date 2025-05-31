'use client';

import { Cause } from '../../api/causes/types';
import CauseCard from './CauseCard';
import styles from "./CausesSection.module.css";

interface CausesSectionProps {
  causes: Cause[];
  onEdit: (cause: Cause) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function CausesSection({ 
  causes, 
  onEdit, 
  onDelete, 
  onCreateNew, 
  isLoading = false,
  error 
}: CausesSectionProps) {
  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>
            ⚠️ {error}
          </p>
        </div>
      )}
      
      <div className={styles.sectionHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Causes</h1>
          <p className={styles.subtitle}>
            Manage and organize the causes your organization supports
          </p>
        </div>
        <button 
          className={styles.createButton}
          onClick={onCreateNew}
          disabled={isLoading}
        >
          + Create New Cause
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
        </div>
      ) : causes.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No causes found</h3>
          <p>
            Start by creating your first cause to organize your charitable activities 
            and track your impact.
          </p>
          <button 
            className={styles.emptyActionButton}
            onClick={onCreateNew}
          >
            Create Your First Cause
          </button>
        </div>
      ) : (
        <div className={`${styles.cardGrid} ${isLoading ? styles.loading : ''}`}>
          {causes.map((cause) => (
            <CauseCard
              key={cause.id}
              cause={cause}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}