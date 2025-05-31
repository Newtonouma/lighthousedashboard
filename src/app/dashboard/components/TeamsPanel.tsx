'use client';

import { useState } from 'react';
import { Team, CreateTeamDto, UpdateTeamDto } from '../../api/teams/types';
import { useTeams } from '../hooks/useTeams';
import TeamCard from './TeamCard';
import TeamEditor from './TeamEditor';
import styles from "./TeamsPanel.module.css";

export default function TeamsPanel() {
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const { teams, loading, error, createTeam, updateTeam, deleteTeam } = useTeams();

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
      await deleteTeam(id);
    }
  };
  const handleSave = async (teamData: CreateTeamDto | UpdateTeamDto): Promise<void> => {
    if (selectedTeam && selectedTeam.id) {
      await updateTeam(selectedTeam.id, teamData as UpdateTeamDto);
    } else {
      await createTeam(teamData as CreateTeamDto);
    }
  };

  const handleClose = () => {
    setIsEditorOpen(false);
    setSelectedTeam(undefined);
  };

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
          <h1 className={styles.title}>Team Members</h1>
          <p className={styles.subtitle}>Meet the amazing people behind our mission</p>
        </div>
        <button 
          className={styles.createButton}
          onClick={handleCreate}
          disabled={loading}
        >
          ✨ Add Team Member
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      ) : teams.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Team Members Yet</h3>
          <p>Build your team by adding the amazing people who make your mission possible. Every great cause starts with great people.</p>
          <button 
            className={styles.emptyActionButton}
            onClick={handleCreate}
          >
            Add Your First Team Member
          </button>
        </div>
      ) : (
        <div className={`${styles.cardGrid} ${loading ? styles.loading : ''}`}>
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
          onClose={handleClose}
        />
      )}
    </div>
  );
}