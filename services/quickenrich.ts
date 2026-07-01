import { AppError, friendlyQuickEnrichError } from "@/lib/errors";
import { mergeContacts, normalizeContact } from "@/lib/contact-normalizer";
import { companyNameMatchesDomain, domainsMatch, normalizeDomain } from "@/lib/domain";
import type { Contact } from "@/types/contacts";
import type { QuickEnrichEnvelope, QuickEnrichRawContact, QuickEnrichSearchInput } from "@/types/quickenrich";

const API_BASE_URL = process.env.QUICKENRICH_API_BASE_URL ?? "https://app.quickenrich.io/api";

const endpoints = {
  datasetSearch: process.env.QUICKENRICH_DATASET_SEARCH_PATH ?? "/employees/dataset-search",
  employeeSearch: process.env.QUICKENRICH_EMPLOYEE_SEARCH_PATH ?? "/employees/search",
  phoneSearch: process.env.QUICKENRICH_PHONE_SEARCH_PATH ?? "/employees/phone-search",
  reverseEmailLookup: process.env.QUICKENRICH_REVERSE_EMAIL_PATH ?? "/employees/email-search",
  contactFinder: process.env.QUICKENRICH_CONTACT_FINDER_PATH ?? "/employees/contact-finder"
};

function getApiKey(override?: string) {
  const key = process.env.QUICKENRICH_API_KEY?.trim() || override?.trim();
  if (!key) throw new AppError("Add a QuickEnrich API key in Settings or QUICKENRICH_API_KEY.", 400, "MISSING_API_KEY");
  return key;
}

function authHeaders(apiKey?: string) {
  const key = getApiKey(apiKey);
  return {
    accept: "application/json",
    authorization: "Bearer " + key,
    "x-api-key": key
  };
}

async function parseResponse(response: Response): Promise<QuickEnrichEnvelope> {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) as QuickEnrichEnvelope : {};
  } catch {
    return { message: text };
  }
}

async function requestGet<T>(path: string, params: Record<string, string | number | boolean | undefined>, apiKey?: string): Promise<T> {
  const url = new URL(API_BASE_URL + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });

  let response: Response;
  try {
    response = await fetch(url, { method: "GET", headers: authHeaders(apiKey), cache: "no-store" });
  } catch {
    throw new AppError("Network failure while contacting QuickEnrich.", 503, "NETWORK_FAILURE");
  }

  const parsed = await parseResponse(response);
  if (!response.ok) {
    const message = friendlyQuickEnrichError(response.status, parsed.error || parsed.message || response.statusText);
    throw new AppError(message, response.status, "QUICKENRICH_ERROR");
  }
  return parsed as T;
}

async function requestPost<T>(path: string, body: Record<string, unknown>, apiKey?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_BASE_URL + path, {
      method: "POST",
      headers: { ...authHeaders(apiKey), "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store"
    });
  } catch {
    throw new AppError("Network failure while contacting QuickEnrich.", 503, "NETWORK_FAILURE");
  }

  const parsed = await parseResponse(response);
  if (!response.ok) {
    const message = friendlyQuickEnrichError(response.status, parsed.error || parsed.message || response.statusText);
    throw new AppError(message, response.status, "QUICKENRICH_ERROR");
  }
  return parsed as T;
}


function contactMatchesRequestedDomain(raw: QuickEnrichRawContact, requestedWebsite: string) {
  const candidates = [raw.company_url, raw.website, raw.domain];
  const hasMatchingDomain = candidates.some((candidate) => typeof candidate === "string" && domainsMatch(candidate, requestedWebsite));
  const companyName = typeof raw.company_name === "string" ? raw.company_name : typeof raw.company === "string" ? raw.company : "";
  return hasMatchingDomain && companyNameMatchesDomain(companyName, requestedWebsite);
}

function extractContacts(payload: QuickEnrichEnvelope): QuickEnrichRawContact[] {
  const candidates = [payload.contacts, payload.results, payload.employees, payload.data];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as QuickEnrichRawContact[];
    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      for (const key of ["contacts", "results", "employees", "data"]) {
        if (Array.isArray(nested[key])) return nested[key] as QuickEnrichRawContact[];
      }
    }
  }
  return [];
}

export async function datasetSearch(input: QuickEnrichSearchInput, apiKey?: string): Promise<Contact[]> {
  const website = normalizeDomain(input.website);
  const payload = await requestGet<QuickEnrichEnvelope>(endpoints.datasetSearch, {
    company_url: website,
    title: input.title,
    page: 1
  }, apiKey);
  return extractContacts(payload)
    .filter((raw) => contactMatchesRequestedDomain(raw, website))
    .map((raw) => normalizeContact(raw, website, input.title));
}

export async function employeeSearch(input: QuickEnrichSearchInput & { linkedinUrl?: string; firstName?: string; lastName?: string }, apiKey?: string) {
  return requestGet<QuickEnrichEnvelope>(endpoints.employeeSearch, {
    linkedin_url: input.linkedinUrl,
    company_url: input.website,
    first_name: input.firstName,
    last_name: input.lastName
  }, apiKey);
}

export async function phoneSearch(input: QuickEnrichSearchInput & { linkedinUrl?: string; firstName?: string; lastName?: string }, apiKey?: string) {
  return requestGet<QuickEnrichEnvelope>(endpoints.phoneSearch, {
    linkedin_url: input.linkedinUrl,
    company_url: input.website,
    first_name: input.firstName,
    last_name: input.lastName
  }, apiKey);
}

export async function reverseEmailLookup(email: string, apiKey?: string) {
  return requestGet<QuickEnrichEnvelope>(endpoints.reverseEmailLookup, { email }, apiKey);
}

export async function contactFinder(filters: Record<string, unknown>, apiKey?: string) {
  return requestPost<QuickEnrichEnvelope>(endpoints.contactFinder, filters, apiKey);
}

export async function searchDatasetForTitles(input: Required<Pick<QuickEnrichSearchInput, "website" | "titles">>, apiKey?: string) {
  const batches = await Promise.all(input.titles.map((title) => datasetSearch({ website: input.website, title }, apiKey)));
  return mergeContacts(batches.flat());
}
