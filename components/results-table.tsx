"use client";

import { ArrowDownUp, ChevronLeft, ChevronRight, Download, Mail, Phone, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { downloadCsv } from "@/lib/csv";
import type { Contact, SortKey } from "@/types/contacts";

interface ResultsTableProps {
  contacts: Contact[];
  favoriteCompanies: string[];
  onToggleFavorite: (company: string) => void;
}

const pageSize = 10;

export function ResultsTable({ contacts, favoriteCompanies, onToggleFavorite }: ResultsTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [hasEmail, setHasEmail] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return contacts
      .filter((contact) => !q || [contact.name, contact.title, contact.company, contact.email, contact.phone, contact.linkedin, contact.website].filter(Boolean).join(" ").toLowerCase().includes(q))
      .filter((contact) => !hasEmail || Boolean(contact.email))
      .filter((contact) => !hasPhone || Boolean(contact.phone))
      .sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
  }, [contacts, hasEmail, hasPhone, query, sortKey]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selectedContacts = contacts.filter((contact) => selected.includes(contact.id));
  const exportContacts = selectedContacts.length ? selectedContacts : filtered;

  async function copyValues(kind: "email" | "phone") {
    const values = exportContacts.map((contact) => contact[kind]).filter(Boolean).join("\n");
    await navigator.clipboard.writeText(values);
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? Array.from(new Set([...selected, ...visible.map((contact) => contact.id)])) : selected.filter((id) => !visible.some((contact) => contact.id === id)));
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected(checked ? Array.from(new Set([...selected, id])) : selected.filter((item) => item !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search results" className="lg:max-w-sm" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={hasEmail ? "default" : "outline"} size="sm" onClick={() => setHasEmail(!hasEmail)}>Has Email</Button>
          <Button type="button" variant={hasPhone ? "default" : "outline"} size="sm" onClick={() => setHasPhone(!hasPhone)}>Has Phone</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => copyValues("email")}><Mail className="h-4 w-4" /> Copy Emails</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => copyValues("phone")}><Phone className="h-4 w-4" /> Copy Phones</Button>
          <Button type="button" size="sm" onClick={() => downloadCsv("polynovea-contacts.csv", exportContacts)}><Download className="h-4 w-4" /> Export CSV</Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3"><Checkbox checked={visible.length > 0 && visible.every((contact) => selected.includes(contact.id))} onCheckedChange={(checked) => toggleAll(Boolean(checked))} /></th>
                <th className="px-3 py-3"><button className="inline-flex items-center gap-1 font-semibold" onClick={() => setSortKey("name")}>Name<ArrowDownUp className="h-3.5 w-3.5" /></button></th>
                <th className="px-3 py-3"><button className="inline-flex items-center gap-1 font-semibold" onClick={() => setSortKey("title")}>Title<ArrowDownUp className="h-3.5 w-3.5" /></button></th>
                <th className="px-3 py-3"><button className="inline-flex items-center gap-1 font-semibold" onClick={() => setSortKey("company")}>Company<ArrowDownUp className="h-3.5 w-3.5" /></button></th>
                <th className="px-3 py-3">Email</th><th className="px-3 py-3">Phone</th><th className="px-3 py-3">LinkedIn</th><th className="px-3 py-3">Website</th><th className="px-3 py-3">Favorite</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((contact) => (
                <tr key={contact.id} className="border-t align-top hover:bg-muted/40">
                  <td className="px-3 py-3"><Checkbox checked={selected.includes(contact.id)} onCheckedChange={(checked) => toggleOne(contact.id, Boolean(checked))} /></td>
                  <td className="px-3 py-3 font-semibold">{contact.name}</td>
                  <td className="px-3 py-3">{contact.title}</td>
                  <td className="px-3 py-3">{contact.company}</td>
                  <td className="px-3 py-3">{contact.email || <span className="text-muted-foreground">None</span>}</td>
                  <td className="px-3 py-3">{contact.phone || <span className="text-muted-foreground">None</span>}</td>
                  <td className="px-3 py-3">{contact.linkedin ? <a className="text-primary underline-offset-4 hover:underline" href={contact.linkedin} target="_blank" rel="noreferrer">Profile</a> : <span className="text-muted-foreground">None</span>}</td>
                  <td className="px-3 py-3">{contact.website}</td>
                  <td className="px-3 py-3"><Button type="button" variant="ghost" size="icon" onClick={() => onToggleFavorite(contact.company)}><Star className={favoriteCompanies.includes(contact.company) ? "h-4 w-4 fill-current text-amber-500" : "h-4 w-4"} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visible.length ? <div className="p-8 text-center text-muted-foreground">No contacts match the current filters.</div> : null}
      </div>
      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{selected.length ? selected.length + " selected. Export and copy actions use selected rows." : filtered.length + " contacts"}</span>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /> Prev</Button><span>Page {page} of {pages}</span><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next <ChevronRight className="h-4 w-4" /></Button></div>
      </div>
    </div>
  );
}
