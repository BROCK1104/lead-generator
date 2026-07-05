"use client";

import { Loader2, Search, Star } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ResultsTable } from "@/components/results-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { downloadCsv } from "@/lib/csv";
import type { Contact, LinkedInEnrichResponse } from "@/types/contacts";

interface RecentEnrichment {
  linkedinUrl: string;
  name: string;
  company: string;
  searchedAt: string;
  hasEmail: boolean;
  hasPhone: boolean;
}

export function LeadFinderDashboard() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [apiKey] = useLocalStorage("polynovea-quickenrich-api-key", "");
  const [recent, setRecent] = useLocalStorage<RecentEnrichment[]>("polynovea-recent-enrichments", []);
  const [favorites, setFavorites] = useLocalStorage<string[]>("polynovea-favorite-companies", []);
  const linkedinRef = useRef<HTMLInputElement>(null);

  const enrichProfile = useCallback(async () => {
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ linkedinUrl, apiKey: apiKey || undefined })
      });
      const payload = await response.json() as LinkedInEnrichResponse & { message?: string };

      if (!response.ok) throw new Error(payload.message || "Enrichment failed.");

      const nextContacts = payload.contact ? [payload.contact] : [];
      setContacts(nextContacts);
      setMessage(payload.contact ? null : "No enrichment data was found for this LinkedIn profile.");

      if (payload.contact) {
        setRecent([
          {
            linkedinUrl,
            name: payload.contact.name,
            company: payload.contact.company,
            searchedAt: new Date().toISOString(),
            hasEmail: Boolean(payload.contact.email),
            hasPhone: Boolean(payload.contact.phone)
          },
          ...recent.filter((item) => item.linkedinUrl !== linkedinUrl)
        ].slice(0, 6));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Network failure while enriching this LinkedIn profile.");
    } finally {
      setLoading(false);
    }
  }, [apiKey, linkedinUrl, recent, setRecent]);

  const exportAll = useCallback(() => {
    if (contacts.length) downloadCsv("polynovea-enriched-contact.csv", contacts);
  }, [contacts]);

  useKeyboardShortcuts({ onSearch: enrichProfile, onFocusWebsite: () => linkedinRef.current?.focus(), onExport: exportAll });

  function toggleFavorite(company: string) {
    setFavorites(favorites.includes(company) ? favorites.filter((item) => item !== company) : [...favorites, company]);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">QuickEnrich full enrichment</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">Polynovea Lead Finder</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Paste a LinkedIn profile URL and enrich that exact person with name, title, company, email, and phone data.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Card><CardContent className="p-4"><p className="text-2xl font-bold">{contacts.length}</p><p className="text-xs text-muted-foreground">Profiles</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold">{contacts.filter((c) => c.email).length}</p><p className="text-xs text-muted-foreground">Emails</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold">{contacts.filter((c) => c.phone).length}</p><p className="text-xs text-muted-foreground">Phones</p></CardContent></Card>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Enrich LinkedIn Profile</CardTitle>
              <CardDescription>Use a person profile URL only. Company pages, search pages, and broad company websites are not used in this flow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                <Input id="linkedin-url" ref={linkedinRef} value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} placeholder="https://www.linkedin.com/in/person-name" />
                <p className="text-xs text-muted-foreground">Example: https://www.linkedin.com/in/jane-doe. Do not paste LinkedIn company pages.</p>
              </div>
              {message ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{message}</div> : null}
              <Button className="w-full" size="lg" onClick={enrichProfile} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Enrich Profile
              </Button>
              <p className="text-xs text-muted-foreground">Shortcuts: / focuses LinkedIn URL, Ctrl or Cmd + Enter enriches, E exports results.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent enrichments</CardTitle><CardDescription>Quickly rerun your last profile lookups.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {recent.length ? recent.map((item) => (
                <button key={item.linkedinUrl + item.searchedAt} className="w-full rounded-md border p-3 text-left hover:bg-muted" onClick={() => setLinkedinUrl(item.linkedinUrl)}>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.company} | {item.hasEmail ? "email" : "no email"} | {item.hasPhone ? "phone" : "no phone"}</div>
                </button>
              )) : <p className="text-sm text-muted-foreground">No recent enrichments yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Favorite companies</CardTitle><CardDescription>Companies starred from the results table.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {favorites.length ? favorites.map((company) => <div key={company} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><Star className="h-4 w-4 fill-current text-amber-500" /> {company}</div>) : <p className="text-sm text-muted-foreground">No favorite companies yet.</p>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Enrichment Result</CardTitle><CardDescription>Copy, export, or favorite the enriched contact.</CardDescription></CardHeader>
          <CardContent>{contacts.length ? <ResultsTable contacts={contacts} favoriteCompanies={favorites} onToggleFavorite={toggleFavorite} /> : <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">Paste a LinkedIn profile URL and enrich to see the contact here.</div>}</CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
