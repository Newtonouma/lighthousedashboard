'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cause } from '../../api/causes/types';

export function useCauses() {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCauses = useCallback(async () => {
    try {
      const response = await fetch('/api/causes');
      if (!response.ok) {
        throw new Error('Failed to fetch causes');
      }
      const data = await response.json();
      setCauses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);
  const createCause = useCallback(async (newCause: Partial<Cause>) => {
    try {
      const response = await fetch('/api/causes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCause),
      });

      if (!response.ok) {
        throw new Error('Failed to create cause');
      }

      await fetchCauses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [fetchCauses]);

  const deleteCause = async (id: string) => {
    try {
      const response = await fetch(`/api/causes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete cause');
      }
      await fetchCauses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };  const updateCause = async (id: string, updatedCause: Partial<Cause>) => {
    try {
      const response = await fetch(`/api/causes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCause),
      });

      if (!response.ok) {
        throw new Error('Failed to update cause');
      }

      await fetchCauses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };
  useEffect(() => {
    fetchCauses();
  }, [fetchCauses]);

  return {
    causes,
    loading,
    error,
    createCause,
    deleteCause,
    updateCause,
    refreshCauses: fetchCauses
  };
} 