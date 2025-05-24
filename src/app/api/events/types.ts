export interface Event {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  description: string;
  imageUrl: string;
  time: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateEventDto = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEventDto = Partial<CreateEventDto>; 