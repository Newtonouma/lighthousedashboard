export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string; // ISO date string
  endTime?: string; // ISO date string
  location: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type alias for creating events (excludes auto-generated fields)
export type CreateEventDto = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;

// Type alias for updating events (excludes auto-generated fields and allows partial updates)
export type UpdateEventDto = Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>;

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
}

export function validateEventData(data: Partial<Event>): string | null {
  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    return 'Image URL must be a valid URL address';
  }
  
  // For date validation, accept both ISO strings and simple date strings
  if (data.date) {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      return 'Date must be a valid date string';
    }
  }
  
  // For endTime, accept time strings (HH:MM) or ISO strings
  if (data.endTime) {
    // Check if it's a time string (HH:MM format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.endTime) && !isValidISODate(data.endTime)) {
      return 'End time must be in HH:MM format or a valid ISO date string';
    }
  }
  
  return null;
}