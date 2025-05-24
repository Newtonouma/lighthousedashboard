export interface Team {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
}

export interface CreateTeamDto {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
}

export interface UpdateTeamDto {
  name?: string;
  role?: string;
  description?: string;
  imageUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateTeamData(data: CreateTeamDto | UpdateTeamDto): string | null {
  if ('imageUrl' in data && data.imageUrl && !isValidUrl(data.imageUrl)) {
    return 'imageUrl must be a valid URL address';
  }
  if ('linkedinUrl' in data && data.linkedinUrl && !isValidUrl(data.linkedinUrl)) {
    return 'linkedinUrl must be a valid URL address';
  }
  if ('twitterUrl' in data && data.twitterUrl && !isValidUrl(data.twitterUrl)) {
    return 'twitterUrl must be a valid URL address';
  }
  if ('githubUrl' in data && data.githubUrl && !isValidUrl(data.githubUrl)) {
    return 'githubUrl must be a valid URL address';
  }
  return null;
} 