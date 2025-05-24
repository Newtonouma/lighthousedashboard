'use client';

import { useState, useEffect } from 'react';
import { Cause } from '../../api/causes/types';
import { useCauses } from '../hooks/useCauses';
import CauseCard from './CauseCard';
import CauseEditor from './CauseEditor';

export default function CausesPanel() {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [selectedCause, setSelectedCause] = useState<Cause | undefined>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { loading, error, fetchCauses, createCause, updateCause, deleteCause } = useCauses();

  useEffect(() => {
    loadCauses();
  }, []);

  const loadCauses = async () => {
    const data = await fetchCauses();
    setCauses(data);
  };

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
        setCauses(causes.filter(cause => cause.id !== id));
      }
    }
  };

  const handleSave = async (causeData: any) => {
    let success;
    if (selectedCause) {
      success = await updateCause(selectedCause.id, causeData);
      if (success) {
        setCauses(causes.map(cause => 
          cause.id === selectedCause.id ? { ...cause, ...causeData } : cause
        ));
      }
    } else {
      success = await createCause(causeData);
      if (success) {
        await loadCauses(); // Reload to get the new cause with ID
      }
    }
    return success;
  };

  return (
    <div className="causes-panel">
      <div className="panel-header">
        <h2>Causes</h2>
        <button
          className="btn-primary"
          onClick={handleCreate}
        >
          Add Cause
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading causes...</div>
      ) : (
        <div className="causes-grid">
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
        <CauseEditor
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