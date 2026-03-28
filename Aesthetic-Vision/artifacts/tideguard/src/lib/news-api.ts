export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  content?: string | null;
}

export interface NewsResponse {
  articles: NewsArticle[];
  source: "live" | "fallback";
  message?: string;
  totalResults?: number;
}

export async function fetchNewsArticles(): Promise<NewsResponse> {
  const res = await fetch(`/api/news`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`News API error: ${res.status}`);
  }
  const data = await res.json() as NewsResponse;
  return data;
}
