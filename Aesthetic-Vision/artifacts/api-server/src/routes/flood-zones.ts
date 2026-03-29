import { Router, type IRouter } from "express";

const router: IRouter = Router();

const FLOOD_API_KEY = process.env.NATIONAL_FLOOD_API_KEY ?? "";
const FLOOD_API_BASE = "https://api.nationalflooddata.com";

// Proxy /api/flood-zones?lat=&lng= → National Flood Data /floodmapraw
router.get("/flood-zones", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    res.status(400).json({ error: "lat and lng required" });
    return;
  }

  try {
    const url = `${FLOOD_API_BASE}/floodmapraw?lat=${lat}&lng=${lng}&size=0.08&excludex=false&geojson=true`;
    const upstream = await fetch(url, {
      headers: { "X-API-KEY": FLOOD_API_KEY },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      req.log.warn({ status: upstream.status }, "Flood API error");
      res.status(upstream.status).json({ error: "Flood API error" });
      return;
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Flood zones fetch failed");
    res.status(500).json({ error: "Flood zones unavailable" });
  }
});

export default router;
