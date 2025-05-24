'use client';

import { useState } from 'react';
import { Event, CreateEventDto } from '../../api/events/types';
import { useEvents } from '../hooks/useEvents';
import EventCard from './EventCard';
import EventEditor from './EventEditor';
import styles from "./EventsSection.module.css";

export default function EventsSection() {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const {
    events,
    loading,
    error,
    createEvent,
    deleteEvent,
    updateEvent
  } = useEvents();

  const handleCreateEvent = async (newEvent: CreateEventDto) => {
    const success = await createEvent(newEvent);
    if (success) {
      setIsCreating(false);
    }
  };

  const handleEditEvent = async (updatedEvent: CreateEventDto) => {
    if (!editingEvent?.id) return;
    const success = await updateEvent(editingEvent.id, updatedEvent);
    if (success) {
      setEditingEvent(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <h1>Events</h1>
        <button 
          className="btn-primary"
          onClick={() => setIsCreating(true)}
        >
          Create New Event
        </button>
      </div>
      <div className={styles.cardGrid}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={setEditingEvent}
            onDelete={deleteEvent}
          />
        ))}
      </div>

      {editingEvent && (
        <EventEditor
          event={editingEvent}
          onSave={handleEditEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {isCreating && (
        <EventEditor
          onSave={handleCreateEvent}
          onClose={() => setIsCreating(false)}
        />
      )}
    </>
  );
}