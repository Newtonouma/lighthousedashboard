import { Cause } from './types';

// In-memory storage for causes
export const causes: Cause[] = [
  {
    id: '1',
    title: 'Help Build a School',
    description: 'Support our mission to build a new school in rural areas to provide quality education.',
    goal: 50000,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Clean Water Initiative',
    description: 'Help us provide clean drinking water to communities in need.',
    goal: 30000,
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];