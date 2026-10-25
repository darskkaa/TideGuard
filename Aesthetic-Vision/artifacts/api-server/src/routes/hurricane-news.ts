import { Router, type IRouter } from "express";

const router: IRouter = Router();

const NEWS_API_KEY = process.env.NEWS_API_KEY ?? "";

const CURATED_HURRICANE_ARTICLES = [
  {
    id: "h-1",
    title: "Hurricane Milton makes landfall near Siesta Key as Category 3 storm",
    description: "Milton struck Florida's Gulf Coast with 120 mph winds, storm surge up to 15 feet, and catastrophic rainfall across central Florida.",
    url: "https://www.weather.gov",
    source: "NWS",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "h-2",
    title: "FEMA opens disaster recovery centers across Southwest Florida",
    description: "Federal disaster assistance available for residents in Lee, Collier, Charlotte, and Sarasota counties affected by recent hurricane damage.",
    url: "https://www.fema.gov",
    source: "FEMA",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "h-3",
    title: "Florida flood insurance claims surge after back-to-back hurricane seasons",
    description: "NFIP reports record claims volume. Experts warn many Gulf Coast homeowners remain underinsured for storm surge and wind damage.",
    url: "https://www.floodinsurance.gov",
    source: "NFIP",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "h-4",
    title: "Lee County updates evacuation zone maps ahead of 2026 hurricane season",
    description: "Revised storm surge modeling from NOAA changes evacuation zone boundaries for Fort Myers, Bonita Springs, and Estero.",
    url: "https://www.leegov.com",
    source: "Lee County EM",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "h-5",
    title: "NHC: Atlantic hurricane season forecast calls for above-normal activity",
    description: "NOAA predicts 17-21 named storms with 8-12 hurricanes expected due to record-warm Atlantic sea surface temperatures.",
    url: "https://www.nhc.noaa.gov",
    source: "NHC / NOAA",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "h-6",
    title: "How to prepare your home for hurricane season in Southwest Florida",
    description: "Emergency management officials recommend impact windows, roof straps, flood barriers, and a 7-day supply kit for Gulf Coast residents.",
    url: "https://www.ready.gov/hurricanes",
    source: "Ready.gov",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "h-7",
    title: "Storm surge remains the deadliest hurricane hazard, NWS warns",
    description: "Storm surge causes more fatalities than wind or rain. SW Florida's low elevation and coastal geography amplify surge risk during landfalling hurricanes.",
    url: "https://www.weather.gov/safety/hurricane-storm-surge",
    source: "NWS",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "h-8",
    title: "Citizens Property Insurance warns of coverage gaps for hurricane damage",
    description: "Florida's insurer of last resort reminds policyholders that standard policies exclude flood damage. Separate NFIP flood coverage is essential.",
    url: "https://www.citizensfla.com",
    source: "Citizens Insurance",
    publishedAt: new Date().toISOString(),
  },
];

interface NewsAPIArticle {
  title?: string;
  description?: string;
  url?: string;
  source?: { name?: string };
  publishedAt?: string;
}

interface NewsAPIResponse {
  status?: string;
  articles?: NewsAPIArticle[];
}

router.get("/hurricane-news", async (req, res) => {
  try {
    const url = `https://newsapi.org/v2/everything?q=hurricane+OR+tropical+storm+florida&sortBy=relevancy&pageSize=8&language=en&apiKey=${NEWS_API_KEY}`;
    const upstream = await fetch(url, {
      headers: { "User-Agent": "TideGuard/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) throw new Error(`NewsAPI error: ${upstream.status}`);

    const data = await upstream.json() as NewsAPIResponse;
    if (data.status !== "ok" || !data.articles?.length) throw new Error("No articles");

    const articles = data.articles.map((a: NewsAPIArticle, i: number) => ({
      id: `newsapi-h-${i}`,
      title: a.title ?? "Untitled",
      description: a.description ?? null,
      url: a.url ?? "",
      source: a.source?.name ?? "NewsAPI",
      publishedAt: a.publishedAt ?? new Date().toISOString(),
    }));

    res.json({ articles, source: "live", totalResults: articles.length });
  } catch (err) {
    req.log.warn({ err }, "Hurricane NewsAPI fetch failed, using curated fallback");
    res.json({
      articles: CURATED_HURRICANE_ARTICLES,
      source: "fallback",
      totalResults: CURATED_HURRICANE_ARTICLES.length,
      message: "Using curated hurricane articles",
    });
  }
});

export default router;
