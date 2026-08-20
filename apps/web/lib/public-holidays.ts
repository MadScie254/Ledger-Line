/**
 * Kenya Public Holidays via Nager.Date API.
 * Free, open-source, no API key needed.
 * Cache results — do NOT poll per page load.
 */

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

/**
 * Fetch public holidays for Kenya for a given year.
 * @param year Year to fetch holidays for (e.g. 2026)
 */
export async function fetchKenyaHolidays(year: number): Promise<PublicHoliday[]> {
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/KE`;

  const res = await fetch(url, {
    // Cache for 24 hours
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Nager.Date fetch failed: ${res.status}`);
  }

  return res.json() as Promise<PublicHoliday[]>;
}
