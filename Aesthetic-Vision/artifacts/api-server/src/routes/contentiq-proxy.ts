import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CIQ_BACKEND = "https://backend.contentiq.symplistic.ai";

router.all("/ciq/*splat", async (req, res) => {
  const subPath = (req.params as Record<string, string>)["splat"] ?? "";
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const targetUrl = `${CIQ_BACKEND}/${subPath}${qs}`;

  const forwardHeaders: Record<string, string> = {
    "Content-Type": req.headers["content-type"] ?? "application/json",
    "Accept": req.headers["accept"] ?? "application/json",
    "User-Agent": "TideGuard-Proxy/1.0",
  };

  if (req.headers["authorization"]) {
    forwardHeaders["Authorization"] = req.headers["authorization"] as string;
  }

  const fetchOpts: RequestInit = {
    method: req.method,
    headers: forwardHeaders,
    signal: AbortSignal.timeout(30000),
  };

  if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
    fetchOpts.body = JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(targetUrl, fetchOpts);

    res.status(upstream.status);

    const ct = upstream.headers.get("content-type") ?? "application/json";
    res.setHeader("Content-Type", ct);

    const raw = await upstream.text();
    res.send(raw);
  } catch (err) {
    req.log.error({ err, targetUrl }, "ContentIQ proxy error");
    res.status(502).json({ error: "Proxy error reaching ContentIQ backend" });
  }
});

export default router;
