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
          <h1 className={styles.title}>Events</h1>
          <p className={styles.subtitle}>Discover and manage upcoming events</p>
        </div>
        <button 
          className={styles.createButton}
          onClick={() => setIsCreating(true)}
          disabled={loading}
        >
          ✨ Create New Event
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      ) : events.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Events Yet</h3>
          <p>Start building your community by creating your first event. Events help bring people together and make a lasting impact.</p>
          <button 
            className={styles.emptyActionButton}
            onClick={() => setIsCreating(true)}
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className={`${styles.cardGrid} ${loading ? styles.loading : ''}`}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={setEditingEvent}
              onDelete={deleteEvent}
            />
          ))}
        </div>
      )}

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
    </div>
  );
}