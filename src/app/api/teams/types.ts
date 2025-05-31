export interface Team {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  contact?: string;
  email?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type alias for creating teams (excludes auto-generated fields)
export type CreateTeamDto = Omit<Team, 'id' | 'createdAt' | 'updatedAt'>;

// Type alias for updating teams (excludes auto-generated fields and allows partial updates)
export type UpdateTeamDto = Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>;

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateTeamData(data: Partial<Team>): string | null {
  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    return 'Image URL must be a valid URL address';
  }
  if (data.email && !isValidEmail(data.email)) {
    return 'Email must be a valid email address';
  }
  if (data.facebook && !isValidUrl(data.facebook)) {
    return 'Facebook URL must be a valid URL address';
  }
  if (data.linkedin && !isValidUrl(data.linkedin)) {
    return 'LinkedIn URL must be a valid URL address';
  }
  if (data.twitter && !isValidUrl(data.twitter)) {
    return 'Twitter URL must be a valid URL address';
  }
  if (data.tiktok && !isValidUrl(data.tiktok)) {
    return 'TikTok URL must be a valid URL address';
  }
  return null;
}