"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useLocalStorage("polynovea-quickenrich-api-key", "");

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Development settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">Settings</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Production should use QUICKENRICH_API_KEY on the server. This local setting is only a development fallback and is sent to your own API route, never directly to QuickEnrich from the browser.</p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> QuickEnrich API Key</CardTitle><CardDescription>Stored in this browser's local storage for local development.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="api-key">API Key</Label><Input id="api-key" type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="qe_..." /></div>
          <div className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground"><ShieldCheck className="mb-2 h-5 w-5 text-primary" /> For deployed environments, set QUICKENRICH_API_KEY in your hosting provider. Do not prefix it with NEXT_PUBLIC.</div>
          <Button variant="outline" onClick={() => setApiKey("")}>Clear local key</Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
