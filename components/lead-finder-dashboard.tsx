"use client";

import { Loader2, Search, Star } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ResultsTable } from "@/components/results-table";
import { DEFAULT_TITLES, TitlePicker } from "@/components/title-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { downloadCsv } from "@/lib/csv";
import type { Contact, ContactSearchResponse } from "@/types/contacts";

interface RecentSearch { website: string; titles: string[]; searchedAt: string; count: number; }

export function LeadFinderDashboard() {
  const [website, setWebsite] = useState("");
  const [titles, setTitles] = useState<string[]>(["Owner", "General Manager"]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [apiKey] = useLocalStorage("polynovea-quickenrich-api-key", "");
  const [recent, setRecent] = useLocalStorage<RecentSearch[]>("polynovea-recent-searches", []);
  const [favorites, setFavorites] = useLocalStorage<string[]>("polynovea-favorite-companies", []);
  const websiteRef = useRef<HTMLInputElement>(null);

  const searchContacts = useCallback(async () => {
    setMessage(null);
    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ website, titles, apiKey: apiKey || undefined })
      });
      const payload = await response.json() as ContactSearchResponse & { message?: string };
      if (!response.ok) throw new Error(payload.message || "Search failed.");
      setContacts(payload.contacts);
      setRecent([{ website, titles, searchedAt: new Date().toISOString(), count: payload.contacts.length }, ...recent.filter((item) => item.website !== website)].slice(0, 6));
      setMessage(payload.contacts.length ? null : "No contacts found for that website and title selection.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Network failure while searching contacts.");
    } finally {
      setLoading(false);
    }
  }, [apiKey, recent, setRecent, titles, website]);

  const exportAll = useCallback(() => {
    if (contacts.length) downloadCsv("polynovea-contacts.csv", contacts);
  }, [contacts]);

  useKeyboardShortcuts({ onSearch: searchContacts, onFocusWebsite: () => websiteRef.current?.focus(), onExport: exportAll });

  function toggleFavorite(company: string) {
    setFavorites(favorites.includes(company) ? favorites.filter((item) => item !== company) : [...favorites, company]);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">QuickEnrich-powered prospecting</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">Polynovea Lead Finder</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Find restaurant, cafe, and hospitality decision makers without exposing your production API key in the browser.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Card><CardContent className="p-4"><p className="text-2xl font-bold">{contacts.length}</p><p className="text-xs text-muted-foreground">Contacts</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold">{contacts.filter((c) => c.email).length}</p><p className="text-xs text-muted-foreground">Emails</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold">{favorites.length}</p><p className="text-xs text-muted-foreground">Favorites</p></CardContent></Card>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Search Contacts</CardTitle><CardDescription>Enter the exact company domain before searching. Broad names or categories are blocked to avoid irrelevant leads.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2"><Label htmlFor="website">Company Website</Label><Input id="website" ref={websiteRef} value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="example.com" /><p className="text-xs text-muted-foreground">Use the exact business domain only. Example: acmehospitality.com, not Acme Hospitality Group.</p></div>
              <div className="space-y-2"><Label>Job Titles</Label><TitlePicker selected={titles} onChange={setTitles} /></div>
              {message ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{message}</div> : null}
              <Button className="w-full" size="lg" onClick={searchContacts} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search Contacts</Button>
              <p className="text-xs text-muted-foreground">Shortcuts: / focuses website, Ctrl or Cmd + Enter searches, E exports results.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent searches</CardTitle><CardDescription>Quickly rerun your last company lookups.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {recent.length ? recent.map((item) => <button key={item.website + item.searchedAt} className="w-full rounded-md border p-3 text-left hover:bg-muted" onClick={() => { setWebsite(item.website); setTitles(item.titles.length ? item.titles : DEFAULT_TITLES.slice(0, 2)); }}><div className="font-semibold">{item.website}</div><div className="text-xs text-muted-foreground">{item.count} contacts | {item.titles.join(", ")}</div></button>) : <p className="text-sm text-muted-foreground">No recent searches yet.</p>}
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
          <CardHeader><CardTitle>Results</CardTitle><CardDescription>Search, sort, filter, select, copy, and export contacts.</CardDescription></CardHeader>
          <CardContent>{contacts.length ? <ResultsTable contacts={contacts} favoriteCompanies={favorites} onToggleFavorite={toggleFavorite} /> : <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">Run a search to populate decision makers here.</div>}</CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
