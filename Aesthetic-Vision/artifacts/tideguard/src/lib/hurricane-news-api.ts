import type { NewsArticle, NewsResponse } from "@/lib/news-api";

export async function fetchHurricaneNews(): Promise<NewsResponse> {
  const res = await fetch("/api/hurricane-news", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Hurricane news API error: ${res.status}`);
  return await res.json() as NewsResponse;
}
