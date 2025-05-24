'use client';

import { Team } from '../../api/teams/types';
import Image from 'next/image';

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (id: string) => void;
}

export default function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  return (
    <div className="team-card">
      <div className="team-image">
        <Image
          src={team.imageUrl}
          alt={team.name}
          width={300}
          height={300}
          className="member-image"
        />
      </div>
      <div className="team-content">
        <h3 className="team-name">{team.name}</h3>
        <p className="team-role">{team.role}</p>
        <p className="team-description">{team.description}</p>
        <div className="team-social">
          {team.linkedinUrl && (
            <a
              href={team.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link linkedin"
            >
              LinkedIn
            </a>
          )}
          {team.twitterUrl && (
            <a
              href={team.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link twitter"
            >
              Twitter
            </a>
          )}
        </div>
        <div className="team-actions">
          <button
            className="btn-secondary"
            onClick={() => onEdit(team)}
          >
            Edit
          </button>
          <button
            className="btn-danger"
            onClick={() => onDelete(team.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}