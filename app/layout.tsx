import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polynovea Lead Finder",
  description: "Find hospitality decision makers with QuickEnrich."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
