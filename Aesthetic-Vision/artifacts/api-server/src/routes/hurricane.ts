import { Router, type IRouter } from "express";

const router: IRouter = Router();

const NHC_STORMS_URL = "https://www.nhc.noaa.gov/CurrentStorms.json";

// Proxy NOAA NHC current storms (avoids CORS from browser)
router.get("/hurricane/storms", async (req, res) => {
  try {
    const upstream = await fetch(NHC_STORMS_URL, {
      headers: {
        "User-Agent": "TideGuard/1.0 (educational project)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "NHC upstream error", activeStorms: [] });
      return;
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    req.log.warn({ err }, "NHC storms fetch failed");
    // Return empty storms — frontend will fall back to demo data
    res.json({ activeStorms: [] });
  }
});

export default router;
