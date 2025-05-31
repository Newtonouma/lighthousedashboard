'use client';

import Image from 'next/image';
import { Event } from '../../api/events/types';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  // Safe URL extraction with validation
  const getImageUrl = () => {
    if (event.imageUrl) {
      try {
        new URL(event.imageUrl);
        return event.imageUrl;
      } catch {
        return 'https://via.placeholder.com/400x200?text=Event+Image';
      }
    }
    return 'https://via.placeholder.com/400x200?text=No+Image';
  };

  const formatEventDate = () => {
    const date = new Date(event.date);
    return {
      dayMonth: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      year: date.getFullYear(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  };

  const formatTime = () => {
    if (!event.endTime) return null;
    try {
      // Handle time format like "17:00" or full ISO strings
      const timeStr = event.endTime.includes('T') ? event.endTime : `1970-01-01T${event.endTime}`;
      const time = new Date(timeStr);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return event.endTime;
    }
  };

  const dateInfo = formatEventDate();
  const timeInfo = formatTime();

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={getImageUrl()}
          alt={event.title}
          width={400}
          height={200}
          className={styles.cardImage}
        />
        <div className={styles.dateOverlay}>
          <div className={styles.dateDay}>{dateInfo.dayMonth}</div>
          <div className={styles.dateYear}>{dateInfo.year}</div>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.eventHeader}>
          <h3 className={styles.cardTitle}>{event.title}</h3>
          <div className={styles.eventMeta}>
            <div className={styles.eventDateTime}>
              <ClockIcon />
              <span>{dateInfo.weekday}{timeInfo && `, ${timeInfo}`}</span>
            </div>
            {event.location && (
              <div className={styles.eventLocation}>
                <LocationIcon />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <p className={styles.cardDescription}>{event.description}</p>
        
        <div className={styles.eventActions}>
          <button
            className={styles.editButton}
            onClick={() => onEdit(event)}
          >
            <EditIcon />
            Edit
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => event.id && onDelete(event.id)}
          >
            <DeleteIcon />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Icon components
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}