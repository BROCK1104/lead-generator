export function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "");
}

export function isValidDomain(value: string) {
  const domain = normalizeDomain(value);
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain) && !domain.includes("..");
}

const blockedLookupDomains = new Set([
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "google.com",
  "maps.google.com",
  "yelp.com",
  "tripadvisor.com",
  "opentable.com",
  "zomato.com",
  "swiggy.com",
  "ubereats.com",
  "doordash.com"
]);

export function isBlockedLookupDomain(value: string) {
  const domain = normalizeDomain(value);
  return Array.from(blockedLookupDomains).some((blocked) => domain === blocked || domain.endsWith("." + blocked));
}

export function domainsMatch(candidate: string, requested: string) {
  const cleanCandidate = normalizeDomain(candidate);
  const cleanRequested = normalizeDomain(requested);
  if (!cleanCandidate || !cleanRequested) return false;
  return cleanCandidate === cleanRequested || cleanCandidate.endsWith("." + cleanRequested);
}

function compact(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function domainBrandKey(domain: string) {
  const label = normalizeDomain(domain).split(".")[0] ?? "";
  return compact(label)
    .replace(/^the/, "")
    .replace(/(hospitality|restaurants|restaurant|dining|group|foods|food|cafe|coffee|inc|llc|co)$/g, "");
}

export function companyNameMatchesDomain(companyName: string, requestedDomain: string) {
  const brand = domainBrandKey(requestedDomain);
  const company = compact(companyName)
    .replace(/^the/, "")
    .replace(/(hospitality|restaurants|restaurant|dining|group|foods|food|cafe|coffee|inc|llc|co)$/g, "");
  if (brand.length < 3 || company.length < 3) return false;
  return company.includes(brand) || brand.includes(company);
}
