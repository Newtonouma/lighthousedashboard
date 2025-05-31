'use client';

import { Team } from '../../api/teams/types';
import Image from 'next/image';
import styles from './TeamCard.module.css';

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (id: string) => void;
}

export default function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  // Safe URL extraction with validation
  const getImageUrl = () => {
    if (team.imageUrl) {
      try {
        new URL(team.imageUrl);
        return team.imageUrl;
      } catch {
        return 'https://via.placeholder.com/300x300?text=Invalid+Image';
      }
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={getImageUrl()}
          alt={team.name || 'Team member'}
          width={300}
          height={240}
          className={styles.cardImage}
          priority={false}
        />
        <div className={styles.imageOverlay}>
          <div className={styles.actionButtons}>
            <button
              className={styles.editButton}
              onClick={() => onEdit(team)}
              title="Edit team member"
            >
              ✏️
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => onDelete(team.id!)}
              title="Delete team member"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{team.name}</h3>
        </div>
        
        <p className={styles.cardDescription}>
          {team.description || 'No description available'}
        </p>
        
        <div className={styles.contactInfo}>
          {team.contact && (
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>📞</span>
              <span className={styles.contactValue}>{team.contact}</span>
            </div>
          )}
          
          {team.email && (
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>✉️</span>
              <span className={styles.contactValue}>{team.email}</span>
            </div>
          )}
        </div>
        
        {(team.linkedin || team.twitter || team.facebook || team.tiktok) && (
          <div className={styles.socialLinks}>
            {team.linkedin && (
              <a
                href={team.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialLink} ${styles.linkedin}`}
                title="LinkedIn"
              >
                🔗
              </a>
            )}
            {team.twitter && (
              <a
                href={team.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialLink} ${styles.twitter}`}
                title="Twitter"
              >
                🐦
              </a>
            )}
            {team.facebook && (
              <a
                href={team.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialLink} ${styles.facebook}`}
                title="Facebook"
              >
                📘
              </a>
            )}
            {team.tiktok && (
              <a
                href={team.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialLink} ${styles.tiktok}`}
                title="TikTok"
              >
                🎵
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}