import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CLIENT_ID = process.env.XWEATHER_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.XWEATHER_CLIENT_SECRET ?? "";
const XWEATHER_BASE = "https://data.api.xweather.com";

// Key SW Florida road locations
const ROAD_POINTS = [
  { id: "us41-fortmyers", name: "US-41 · Fort Myers", lat: 26.634, lng: -81.874 },
  { id: "us41-naples", name: "US-41 · Naples", lat: 26.142, lng: -81.800 },
  { id: "i75-leeco", name: "I-75 · Lee County", lat: 26.628, lng: -81.828 },
  { id: "sr951-marco", name: "SR-951 · Marco Island", lat: 25.971, lng: -81.712 },
  { id: "us41-punta", name: "US-41 · Punta Gorda", lat: 26.931, lng: -82.038 },
  { id: "us41-sarasota", name: "US-41 · Sarasota", lat: 27.221, lng: -82.518 },
];

interface XweatherPeriod {
  roadConditions?: { code?: string; phrase?: string };
  roadSurface?: { code?: string; phrase?: string; tempF?: number; tempC?: number };
  summary?: { phrase?: string };
}

interface XweatherResponse {
  success?: boolean;
  response?: Array<{ periods?: XweatherPeriod[] }>;
}

async function fetchPoint(lat: number, lng: number): Promise<XweatherPeriod | null> {
  const url = `${XWEATHER_BASE}/roadweather/conditions/${lat},${lng}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&limit=1`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!resp.ok) return null;
  const data = (await resp.json()) as XweatherResponse;
  return data?.response?.[0]?.periods?.[0] ?? null;
}

router.get("/road-conditions", async (_req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    res.status(500).json({ error: "Xweather credentials not configured" });
    return;
  }

  try {
    type RoadResult = {
      id: string; name: string; lat: number; lng: number;
      status: string; statusPhrase: string;
      surface: string; surfacePhrase: string;
      tempF: number | null; summary: string | null;
    };

    const settled = await Promise.allSettled(
      ROAD_POINTS.map(async (pt): Promise<RoadResult> => {
        const period = await fetchPoint(pt.lat, pt.lng);
        return {
          id: pt.id,
          name: pt.name,
          lat: pt.lat,
          lng: pt.lng,
          status: period?.roadConditions?.code ?? "unknown",
          statusPhrase: period?.roadConditions?.phrase ?? "Unknown",
          surface: period?.roadSurface?.code ?? "unknown",
          surfacePhrase: period?.roadSurface?.phrase ?? "Unknown",
          tempF: period?.roadSurface?.tempF ?? null,
          summary: period?.summary?.phrase ?? null,
        };
      })
    );

    const points = settled
      .filter((r): r is PromiseFulfilledResult<RoadResult> => r.status === "fulfilled")
      .map((r) => r.value);

    res.set("Cache-Control", "public, max-age=900"); // 15 min
    res.json({ points });
  } catch {
    res.status(500).json({ error: "Road conditions unavailable" });
  }
});

export default router;
