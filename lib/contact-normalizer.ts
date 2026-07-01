import type { Contact } from "@/types/contacts";
import type { QuickEnrichRawContact } from "@/types/quickenrich";

function stringValue(value: unknown) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  return cleaned && cleaned.toLowerCase() !== "n/a" ? cleaned : "";
}

function splitName(raw: QuickEnrichRawContact) {
  const firstName = stringValue(raw.first_name ?? raw.firstName);
  const lastName = stringValue(raw.last_name ?? raw.lastName);
  const full = stringValue(raw.name ?? raw.full_name);
  if (firstName || lastName) return { firstName, lastName, name: [firstName, lastName].filter(Boolean).join(" ") };
  const parts = full.split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" "), name: full };
}

export function normalizeContact(raw: QuickEnrichRawContact, website: string, searchedTitle?: string): Contact {
  const names = splitName(raw);
  const email = stringValue(raw.email ?? raw.email_address).toLowerCase();
  const phone = stringValue(raw.phone ?? raw.phone_number ?? raw.employee_phone);
  const linkedin = stringValue(raw.linkedin ?? raw.linkedin_url ?? raw.employee_linkedin);
  const title = stringValue(raw.job_title ?? raw.title) || searchedTitle || "Decision maker";
  const company = stringValue(raw.company ?? raw.company_name) || website;
  const site = stringValue(raw.website ?? raw.domain ?? raw.company_url ?? raw.email_domain) || website;
  const fingerprint = [email, linkedin, phone, names.name, title, company].filter(Boolean).join("|").toLowerCase();

  return {
    id: fingerprint || crypto.randomUUID(),
    firstName: names.firstName,
    lastName: names.lastName,
    name: names.name || [names.firstName, names.lastName].filter(Boolean).join(" ") || "Unknown contact",
    title,
    company,
    email: email || undefined,
    phone: phone || undefined,
    linkedin: linkedin || undefined,
    website: site,
    source: "QuickEnrich"
  };
}

export function mergeContacts(contacts: Contact[]) {
  const byKey = new Map<string, Contact>();
  for (const contact of contacts) {
    const key = (contact.email || contact.linkedin || contact.phone || contact.name + "|" + contact.company).toLowerCase();
    const existing = byKey.get(key);
    byKey.set(key, existing ? { ...existing, ...contact, email: existing.email ?? contact.email, phone: existing.phone ?? contact.phone, linkedin: existing.linkedin ?? contact.linkedin } : contact);
  }
  return Array.from(byKey.values());
}
