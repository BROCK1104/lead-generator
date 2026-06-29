"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onSearch: () => void;
  onFocusWebsite: () => void;
  onExport: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        handlers.onSearch();
      }
      if (!isTyping && event.key === "/") {
        event.preventDefault();
        handlers.onFocusWebsite();
      }
      if (!isTyping && event.key.toLowerCase() === "e") handlers.onExport();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
