'use client';

import Image from 'next/image';
import { Event } from '../../api/events/types';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  return (
    <div className="event-card">
      {event.imageUrl && (
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={400}
          height={200}
          className="event-image"
        />
      )}
      <div className="event-content">
        <h2 className="event-title">{event.title}</h2>
        <p className="event-short-description">{event.shortDescription}</p>
        <div className="event-meta">
          <span className="event-category">{event.category}</span>
          <div className="event-datetime">
            <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
            <span className="event-time">{event.time}</span>
          </div>
        </div>
        <div 
          className="event-description"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
        <div className="event-actions">
          <button 
            className="btn-secondary"
            onClick={() => onEdit(event)}
          >
            Edit
          </button>
          <button 
            className="btn-danger"
            onClick={() => event.id && onDelete(event.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 