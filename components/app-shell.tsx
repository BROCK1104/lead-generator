"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Search, Settings, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Lead Finder", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("polynovea-theme");
    const enabled = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("polynovea-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r bg-card p-5 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-lg font-black text-primary-foreground">P</div>
          <div><p className="font-bold">Polynovea</p><p className="text-sm text-muted-foreground">Lead Finder</p></div>
        </div>
        <nav className="grid gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground", pathname === link.href && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}><Icon className="h-4 w-4" />{link.label}</Link>;
          })}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-black text-primary-foreground">P</div><span className="font-bold">Polynovea</span></div>
            <div className="flex gap-2">{links.map((link) => <Button key={link.href} asChild variant="outline" size="sm"><Link href={link.href}>{link.label}</Link></Button>)}</div>
          </div>
          <div className="mb-4 flex justify-end"><Button variant="outline" size="sm" onClick={toggleTheme}>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Theme</Button></div>
          {children}
        </div>
      </main>
    </div>
  );
}
