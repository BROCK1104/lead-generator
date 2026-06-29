import type { Contact } from "@/types/contacts";

export function contactsToCsv(contacts: Contact[]) {
  const headers = ["First Name", "Last Name", "Title", "Company", "Email", "Phone", "LinkedIn", "Website"];
  const rows = contacts.map((contact) => [
    contact.firstName,
    contact.lastName,
    contact.title,
    contact.company,
    contact.email ?? "",
    contact.phone ?? "",
    contact.linkedin ?? "",
    contact.website
  ]);
  return [headers, ...rows].map((row) => row.map((cell) => "\"" + String(cell).replaceAll("\"", "\"\"") + "\"").join(",")).join("\n");
}

export function downloadCsv(filename: string, contacts: Contact[]) {
  const blob = new Blob([contactsToCsv(contacts)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
