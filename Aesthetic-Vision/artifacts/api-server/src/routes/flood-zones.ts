import { Router, type IRouter } from "express";

const router: IRouter = Router();

const FLOOD_API_KEY = process.env.NATIONAL_FLOOD_API_KEY ?? "";
const FLOOD_API_BASE = "https://api.nationalflooddata.com";

// 6 strategic SW Florida coastal points covering Lee, Collier, Charlotte, Sarasota
const SWFL_POINTS: [number, number][] = [
  [26.45, -82.05],   // Fort Myers / Cape Coral
  [26.36, -81.95],   // Fort Myers Beach
  [26.15, -81.80],   // Naples coastal
  [25.95, -81.69],   // Marco Island
  [26.93, -82.05],   // Punta Gorda / Charlotte Harbor
  [27.22, -82.52],   // Sarasota / Siesta Key
];

interface FloodRegion {
  fld_zone?: string;
  geojson?: unknown;
}

async function fetchPoint(lat: number, lng: number): Promise<FloodRegion[]> {
  const url = `${FLOOD_API_BASE}/floodmapraw?lat=${lat}&lng=${lng}&size=0.08&excludex=false&geojson=true`;
  const resp = await fetch(url, {
    headers: { "X-API-KEY": FLOOD_API_KEY },
    signal: AbortSignal.timeout(12000),
  });
  if (!resp.ok) return [];
  const data = (await resp.json()) as { result?: { floodregions?: FloodRegion[] } };
  return data?.result?.floodregions ?? [];
}

// Proxy /api/flood-zones → National Flood Data API (aggregates 6 SWFL points)
// Returns a standard GeoJSON FeatureCollection
router.get("/flood-zones", async (_req, res) => {
  if (!FLOOD_API_KEY) {
    res.status(500).json({ error: "Flood API key not configured" });
    return;
  }

  try {
    const features: Array<{
      type: string;
      properties: { FLD_ZONE: string };
      geometry: unknown;
    }> = [];

    // Fetch in batches of 3 to respect rate limit (4 req/sec, burst 3)
    for (let i = 0; i < SWFL_POINTS.length; i += 3) {
      const batch = SWFL_POINTS.slice(i, i + 3);
      const results = await Promise.allSettled(
        batch.map(([lat, lng]) => fetchPoint(lat, lng))
      );

      results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        result.value.forEach((region) => {
          if (!region.geojson) return;
          try {
            const geom =
              typeof region.geojson === "string"
                ? JSON.parse(region.geojson as string)
                : region.geojson;
            features.push({
              type: "Feature",
              properties: { FLD_ZONE: region.fld_zone ?? "" },
              geometry: geom,
            });
          } catch {
            // skip malformed geojson
          }
        });
      });

      // Respect rate limit between batches
      if (i + 3 < SWFL_POINTS.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Cache 1 hour — flood zones rarely change
    res.set("Cache-Control", "public, max-age=3600");
    res.json({ type: "FeatureCollection", features });
  } catch {
    res.status(500).json({ error: "Flood zones unavailable" });
  }
});

export default router;
