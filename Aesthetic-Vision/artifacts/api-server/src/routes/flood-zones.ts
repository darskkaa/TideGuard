import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Proxy /api/flood-zones → FEMA NFHL ArcGIS REST API (free, no key required)
// Returns GeoJSON FeatureCollection of SW Florida flood hazard areas
router.get("/flood-zones", async (_req, res) => {
  try {
    // SW Florida bounding box: Lee, Collier, Charlotte, Sarasota counties
    const geometry = JSON.stringify({
      xmin: -82.7, ymin: 25.7, xmax: -81.3, ymax: 27.5,
      spatialReference: { wkid: 4326 },
    });

    const url =
      "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query" +
      "?geometry=" + encodeURIComponent(geometry) +
      "&geometryType=esriGeometryEnvelope" +
      "&spatialRel=esriSpatialRelIntersects" +
      "&outFields=FLD_ZONE%2CZONE_SUBTY%2CSFHA_TF" +
      "&returnGeometry=true" +
      "&f=geojson" +
      "&resultRecordCount=2000";

    const upstream = await fetch(url, { signal: AbortSignal.timeout(20000) });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "FEMA API error" });
      return;
    }

    const data = await upstream.json();
    // Cache for 1 hour since flood zones rarely change
    res.set("Cache-Control", "public, max-age=3600");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Flood zones unavailable" });
  }
});

export default router;
