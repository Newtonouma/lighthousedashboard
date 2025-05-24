'use client';

import { useState, useEffect } from 'react';
import { Team } from '../../api/teams/types';
import { useTeams } from '../hooks/useTeams';
import TeamCard from './TeamCard';
import TeamEditor from './TeamEditor';
import styles from "./TeamsPanel.module.css";

export default function TeamsPanel() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { loading, error, fetchTeams, createTeam, updateTeam, deleteTeam } = useTeams();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      if (data) {
        setTeams(data);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const handleCreate = () => {
    setSelectedTeam(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      const success = await deleteTeam(id);
      if (success) {
        setTeams(teams.filter(team => team.id !== id));
      }
    }
  };

  const handleSave = async (teamData: any) => {
    let success;
    if (selectedTeam) {
      success = await updateTeam(selectedTeam.id, teamData);
      if (success) {
        setTeams(teams.map(team => 
          team.id === selectedTeam.id ? { ...team, ...teamData } : team
        ));
      }
    } else {
      success = await createTeam(teamData);
      if (success) {
        await loadTeams(); // Reload to get the new team with ID
      }
    }
    return success;
  };

  if (loading) {
    return (
      <div className={styles.teamsPanel}>
        <div className={styles.loading}>Loading team members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.teamsPanel}>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.teamsPanel}>
      <div className={styles.panelHeader}>
        <h2>Team Members</h2>
        <button
          className={styles.btnPrimary}
          onClick={handleCreate}
        >
          Add Team Member
        </button>
      </div>

      {teams.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No team members yet. Click "Add Team Member" to get started.</p>
        </div>
      ) : (
        <div className={styles.teamsGrid}>
          {teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isEditorOpen && (
        <TeamEditor
          team={selectedTeam}
          onSave={handleSave}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedTeam(undefined);
          }}
        />
      )}
    </div>
  );
} 