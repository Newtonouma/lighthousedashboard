import { useState, useEffect, useCallback } from 'react';
import { Team, CreateTeamDto, UpdateTeamDto } from '../../api/teams/types';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
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
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (teamData: CreateTeamDto): Promise<boolean> => {
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
      await fetchTeams(); // Refresh teams list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  const updateTeam = useCallback(async (id: string, teamData: UpdateTeamDto): Promise<boolean> => {
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
      await fetchTeams(); // Refresh teams list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  const deleteTeam = useCallback(async (id: string): Promise<boolean> => {
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
      await fetchTeams(); // Refresh teams list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    refreshTeams: fetchTeams
  };
}