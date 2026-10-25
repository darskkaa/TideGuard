import type { VercelRequest, VercelResponse } from '@vercel/node';

const CURATED_ARTICLES = [
  { id: 'h-1', title: 'Hurricane Milton makes landfall near Siesta Key as Category 3 storm', description: 'Milton struck Florida\'s Gulf Coast with 120 mph winds, storm surge up to 15 feet, and catastrophic rainfall across central Florida.', url: 'https://www.weather.gov', source: 'NWS', publishedAt: new Date().toISOString() },
  { id: 'h-2', title: 'FEMA opens disaster recovery centers across Southwest Florida', description: 'Federal disaster assistance available for residents in Lee, Collier, Charlotte, and Sarasota counties affected by recent hurricane damage.', url: 'https://www.fema.gov', source: 'FEMA', publishedAt: new Date().toISOString() },
  { id: 'h-3', title: 'Florida flood insurance claims surge after back-to-back hurricane seasons', description: 'NFIP reports record claims volume. Experts warn many Gulf Coast homeowners remain underinsured for storm surge and wind damage.', url: 'https://www.floodinsurance.gov', source: 'NFIP', publishedAt: new Date().toISOString() },
  { id: 'h-4', title: 'Lee County updates evacuation zone maps ahead of 2026 hurricane season', description: 'Revised storm surge modeling from NOAA changes evacuation zone boundaries for Fort Myers, Bonita Springs, and Estero.', url: 'https://www.leegov.com', source: 'Lee County EM', publishedAt: new Date().toISOString() },
  { id: 'h-5', title: 'NHC: Atlantic hurricane season forecast calls for above-normal activity', description: 'NOAA predicts 17-21 named storms with 8-12 hurricanes expected due to record-warm Atlantic sea surface temperatures.', url: 'https://www.nhc.noaa.gov', source: 'NHC / NOAA', publishedAt: new Date().toISOString() },
  { id: 'h-6', title: 'How to prepare your home for hurricane season in Southwest Florida', description: 'Emergency management officials recommend impact windows, roof straps, flood barriers, and a 7-day supply kit for Gulf Coast residents.', url: 'https://www.ready.gov/hurricanes', source: 'Ready.gov', publishedAt: new Date().toISOString() },
  { id: 'h-7', title: 'Storm surge remains the deadliest hurricane hazard, NWS warns', description: 'Storm surge causes more fatalities than wind or rain. SW Florida\'s low elevation and coastal geography amplify surge risk during landfalling hurricanes.', url: 'https://www.weather.gov/safety/hurricane-storm-surge', source: 'NWS', publishedAt: new Date().toISOString() },
  { id: 'h-8', title: 'Citizens Property Insurance warns of coverage gaps for hurricane damage', description: 'Florida\'s insurer of last resort reminds policyholders that standard policies exclude flood damage. Separate NFIP flood coverage is essential.', url: 'https://www.citizensfla.com', source: 'Citizens Insurance', publishedAt: new Date().toISOString() },
];

type Article = { id: string; title: string; description: string | null; url: string; source: string; publishedAt: string };

async function fetchNewsApi(key: string): Promise<Article[]> {
  const url = `https://newsapi.org/v2/everything?qInTitle=${encodeURIComponent('(hurricane OR "tropical storm" OR "storm surge") AND (Florida OR Gulf)')}&sortBy=publishedAt&pageSize=8&language=en&apiKey=${key}`;
  const upstream = await fetch(url, { headers: { 'User-Agent': 'TideGuard/1.0' }, signal: AbortSignal.timeout(8000) });
  if (!upstream.ok) throw new Error(`NewsAPI error: ${upstream.status}`);
  const data = await upstream.json() as { status?: string; articles?: Array<{ title?: string; description?: string; url?: string; source?: { name?: string }; publishedAt?: string }> };
  if (data.status !== 'ok' || !data.articles?.length) throw new Error('No articles');
  return data.articles.map((a, i) => ({
    id: `newsapi-h-${i}`,
    title: a.title ?? 'Untitled',
    description: a.description ?? null,
    url: a.url ?? '',
    source: a.source?.name ?? 'NewsAPI',
    publishedAt: a.publishedAt ?? new Date().toISOString(),
  }));
}

function cleanText(html: string): string {
  return html
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchNhcFeed(): Promise<Article[]> {
  const r = await fetch('https://www.nhc.noaa.gov/index-at.xml', {
    headers: { 'User-Agent': 'TideGuard/1.0 (educational project)' },
    signal: AbortSignal.timeout(6000),
  });
  if (!r.ok) throw new Error(`NHC RSS ${r.status}`);
  const xml = await r.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items.slice(0, 4).map((item, i) => {
    const tag = (name: string) => item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? '';
    const text = cleanText(tag('description'));
    const outlook = text.match(/(?:Gulf of (?:America|Mexico)|Caribbean Sea[^:]*):\s*(.+?)(?:\$\$|$)/);
    const date = new Date(cleanText(tag('pubDate')));
    return {
      id: `nhc-${i}`,
      title: cleanText(tag('title')),
      description: (outlook?.[1] ?? text).slice(0, 220) || null,
      url: cleanText(tag('link')) || 'https://www.nhc.noaa.gov/',
      source: 'NOAA National Hurricane Center',
      publishedAt: isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
    };
  }).filter((a) => a.title);
}

async function fetchGdelt(): Promise<Article[]> {
  const query = encodeURIComponent('("tropical storm" OR hurricane OR "National Hurricane Center") sourcelang:english');
  const upstream = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=6&format=json&sort=datedesc`, {
    headers: { 'User-Agent': 'TideGuard/1.0' },
    signal: AbortSignal.timeout(5000),
  });
  if (!upstream.ok) throw new Error(`GDELT error: ${upstream.status}`);
  const data = await upstream.json() as { articles?: Array<{ title?: string; url?: string; domain?: string; seendate?: string }> };
  if (!data.articles?.length) throw new Error('No articles');
  return data.articles.map((a, i) => {
    const d = a.seendate ?? '';
    const publishedAt = /^\d{8}T\d{6}Z$/.test(d)
      ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${d.slice(9, 11)}:${d.slice(11, 13)}:${d.slice(13, 15)}Z`
      : new Date().toISOString();
    return { id: `gdelt-h-${i}`, title: a.title ?? 'Untitled', description: null, url: a.url ?? '', source: a.domain ?? 'GDELT', publishedAt };
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const newsApiKey = process.env.NEWS_API_KEY;
  if (newsApiKey) {
    try {
      const articles = await fetchNewsApi(newsApiKey);
      res.setHeader('Cache-Control', 'public, max-age=600');
      return res.status(200).json({ articles, source: 'live', totalResults: articles.length });
    } catch { /* fall through to GDELT */ }
  }

  const [nhc, gdelt] = await Promise.allSettled([fetchNhcFeed(), fetchGdelt()]);
  const live = [
    ...(nhc.status === 'fulfilled' ? nhc.value : []),
    ...(gdelt.status === 'fulfilled' ? gdelt.value : []),
  ];

  if (live.length > 0) {
    const articles = live.length >= 4 ? live : [...live, ...CURATED_ARTICLES.slice(0, 6 - live.length)];
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.status(200).json({ articles, source: 'live', totalResults: articles.length });
  }

  return res.status(200).json({
    articles: CURATED_ARTICLES,
    source: 'fallback',
    totalResults: CURATED_ARTICLES.length,
    message: 'Using curated hurricane articles',
  });
}
