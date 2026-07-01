export interface QuickEnrichSearchInput {
  website: string;
  title?: string;
  titles?: string[];
}

export interface QuickEnrichRawContact {
  id?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  name?: string;
  full_name?: string;
  job_title?: string;
  title?: string;
  company?: string;
  company_name?: string;
  email?: string;
  email_address?: string;
  phone?: string;
  phone_number?: string;
  employee_phone?: string;
  linkedin?: string;
  linkedin_url?: string;
  employee_linkedin?: string;
  website?: string;
  domain?: string;
  company_url?: string;
  email_domain?: string;
  [key: string]: unknown;
}

export interface QuickEnrichEnvelope {
  success?: boolean;
  code?: number;
  data?: unknown;
  results?: unknown;
  contacts?: unknown;
  employees?: unknown;
  error?: string;
  message?: string;
}
