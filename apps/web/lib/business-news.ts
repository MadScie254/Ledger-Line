/**
 * Kenya Business News via Google News RSS.
 * Free, unlimited, no API key. Commercial use permitted.
 * Cache results — do NOT poll per page load.
 */

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
}

/** Parse a simple RSS feed without relying on a library — works in Node/Edge environments */
function extractTag(xml: string, tag: string): string {
  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;
  const start = xml.indexOf(openTag);
  if (start === -1) return "";
  const contentStart = xml.indexOf(">", start) + 1;
  const end = xml.indexOf(closeTag, contentStart);
  if (end === -1) return "";
  return xml
    .slice(contentStart, end)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .trim();
}

function extractAllItems(xml: string): string[] {
  const items: string[] = [];
  let searchFrom = 0;
  while (true) {
    const itemStart = xml.indexOf("<item>", searchFrom);
    if (itemStart === -1) break;
    const itemEnd = xml.indexOf("</item>", itemStart);
    if (itemEnd === -1) break;
    items.push(xml.slice(itemStart + 6, itemEnd));
    searchFrom = itemEnd + 7;
  }
  return items;
}

/**
 * Fetch recent Kenya business news from Google News RSS.
 * @param query  Search query (default: "Kenya business")
 * @param limit  Max items to return (default: 10)
 */
export async function fetchKenyaBusinessNews(
  query = "Kenya business",
  limit = 10
): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-KE&gl=KE&ceid=KE:en`;

  const res = await fetch(url, {
    headers: { "User-Agent": "LedgerLine/1.0 (business news aggregator)" },
    // Cache for 3 hours in Next.js
    next: { revalidate: 10800 },
  });

  if (!res.ok) {
    throw new Error(`Google News RSS failed: ${res.status}`);
  }

  const xml = await res.text();
  const rawItems = extractAllItems(xml);

  return rawItems.slice(0, limit).map((item) => ({
    title: extractTag(item, "title"),
    link: extractTag(item, "link"),
    pubDate: extractTag(item, "pubDate"),
    source: extractTag(item, "source"),
    description: extractTag(item, "description") || undefined,
  }));
}
