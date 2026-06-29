"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const DEFAULT_TITLES = ["Owner", "Founder", "CEO", "Managing Director", "Restaurant Manager", "General Manager", "Operations Manager", "Marketing Manager"];

interface TitlePickerProps { selected: string[]; onChange: (titles: string[]) => void; }

export function TitlePicker({ selected, onChange }: TitlePickerProps) {
  const [customTitle, setCustomTitle] = useState("");
  const allTitles = Array.from(new Set([...DEFAULT_TITLES, ...selected]));

  function toggle(title: string) {
    onChange(selected.includes(title) ? selected.filter((item) => item !== title) : [...selected, title]);
  }

  function addCustom() {
    const title = customTitle.trim();
    if (!title) return;
    onChange(Array.from(new Set([...selected, title])));
    setCustomTitle("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {allTitles.map((title) => (
          <Button key={title} type="button" variant={selected.includes(title) ? "default" : "outline"} size="sm" onClick={() => toggle(title)}>
            {title}{selected.includes(title) ? <X className="h-3.5 w-3.5" /> : null}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder="Add custom title" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustom(); } }} />
        <Button type="button" variant="secondary" onClick={addCustom}><Plus className="h-4 w-4" /> Add</Button>
      </div>
    </div>
  );
}
