'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cause } from '../../api/causes/types';
import { useCauses } from '../hooks/useCauses';
import CauseCard from './CauseCard';
import FullScreenEditor from '../FullScreenEditor';
import styles from './CausesPanel.module.css';

export default function CausesPanel() {
  const [selectedCause, setSelectedCause] = useState<Cause | undefined>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { causes, loading, error, createCause, updateCause, deleteCause, refreshCauses } = useCauses();

  const loadCauses = useCallback(async () => {
    await refreshCauses();
  }, [refreshCauses]);

  useEffect(() => {
    loadCauses();
  }, [loadCauses]);

  const handleCreate = () => {
    setSelectedCause(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (cause: Cause) => {
    setSelectedCause(cause);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this cause?')) {
      const success = await deleteCause(id);
      if (success) {
        await loadCauses();
      }
    }
  };

  const handleSave = async (causeData: Partial<Cause>): Promise<void> => {
    if (selectedCause && selectedCause.id) {
      await updateCause(selectedCause.id, causeData);
    } else {
      await createCause(causeData);
    }
    await loadCauses();
    setIsEditorOpen(false);
    setSelectedCause(undefined);
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Causes</h2>
          <p className={styles.subtitle}>Manage your charitable causes and initiatives</p>
        </div>
        <button
          className={styles.addButton}
          onClick={handleCreate}
        >
          <svg className={styles.addButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Cause
        </button>
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      ) : causes.length === 0 ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <h3 className={styles.emptyStateTitle}>No causes yet</h3>
          <p className={styles.emptyStateDescription}>
            Start making a difference by creating your first charitable cause. Share your mission and connect with supporters.
          </p>
          <button
            className={styles.addButton}
            onClick={handleCreate}
          >
            <svg className={styles.addButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your First Cause
          </button>
        </div>
      ) : (
        <div className={styles.causesGrid}>
          {causes.map(cause => (
            <CauseCard
              key={cause.id}
              cause={cause}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isEditorOpen && (
        <FullScreenEditor
          cause={selectedCause}
          onSave={handleSave}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedCause(undefined);
          }}
        />
      )}
    </div>
  );
}