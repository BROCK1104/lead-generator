export function normalizeLinkedInProfileUrl(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;

  try {
    const url = new URL(withProtocol);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = url.pathname.replace(/\/+$/, "");

    if (!hostname.endsWith("linkedin.com")) return "";
    if (!pathname.toLowerCase().startsWith("/in/")) return "";

    return "https://www.linkedin.com" + pathname;
  } catch {
    return "";
  }
}

export function isLinkedInProfileUrl(value: string) {
  return Boolean(normalizeLinkedInProfileUrl(value));
}
