export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website: string;
  source?: string;
}

export interface ContactSearchRequest {
  website: string;
  titles: string[];
  apiKey?: string;
}

export interface ContactSearchResponse {
  contacts: Contact[];
  searchedTitles: string[];
  warnings?: string[];
}

export interface LinkedInEnrichRequest {
  linkedinUrl: string;
  apiKey?: string;
}

export interface LinkedInEnrichResponse {
  contact: Contact | null;
  warnings?: string[];
}

export type SortKey = "name" | "title" | "company";
