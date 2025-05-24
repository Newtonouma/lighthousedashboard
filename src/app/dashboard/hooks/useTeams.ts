import { useState } from 'react';
import { Team, CreateTeamDto, UpdateTeamDto } from '../../api/teams/types';

export function useTeams() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async (): Promise<Team[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/teams', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: CreateTeamDto): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      if (!response.ok) {
        throw new Error('Failed to create team');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (id: string, teamData: UpdateTeamDto): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      if (!response.ok) {
        throw new Error('Failed to update team');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  };
} 