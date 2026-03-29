export type HurricaneCategory = 0 | 1 | 2 | 3 | 4 | 5;
export type StormClassification = "TD" | "TS" | "HU" | "EX" | "SD" | "SS";

export interface StormTrackPoint {
  lat: number;
  lng: number;
  time: string;
  intensity: number; // mph
  category: HurricaneCategory;
}

export interface HurricaneStorm {
  id: string;
  name: string;
  classification: StormClassification;
  category: HurricaneCategory;
  intensity: number; // max sustained wind mph
  pressure: number; // mb
  lat: number;
  lng: number;
  movement: string;
  lastUpdate: string;
  track: StormTrackPoint[];
  isDemo?: boolean;
}

export interface HurricaneAlert {
  id: string;
  event: string;
  headline: string;
  areaDesc: string;
  severity: string;
  expires: string;
}

export interface HurricaneData {
  storms: HurricaneStorm[];
  alerts: HurricaneAlert[];
  source: "live" | "demo";
  fetchedAt: string;
}

export function getCategory(intensityMph: number): HurricaneCategory {
  if (intensityMph >= 157) return 5;
  if (intensityMph >= 130) return 4;
  if (intensityMph >= 111) return 3;
  if (intensityMph >= 96) return 2;
  if (intensityMph >= 74) return 1;
  return 0;
}

export function getCategoryColor(category: HurricaneCategory): string {
  switch (category) {
    case 5: return "#dc2626";
    case 4: return "#ef4444";
    case 3: return "#f97316";
    case 2: return "#fbbf24";
    case 1: return "#fde68a";
    case 0: return "#60a5fa";
  }
}

export function getCategoryLabel(storm: HurricaneStorm): string {
  if (storm.classification === "TD") return "Tropical Depression";
  if (storm.classification === "TS") return "Tropical Storm";
  if (storm.category === 0) return storm.classification;
  return `Category ${storm.category} Hurricane`;
}

export function getThreatLevel(storms: HurricaneStorm[]): {
  level: "critical" | "high" | "moderate" | "low" | "none";
  text: string;
  color: string;
  pulse: boolean;
} {
  if (!storms.length) return { level: "none", text: "NO ACTIVE STORMS", color: "hsl(191 90% 46%)", pulse: false };
  const maxCat = Math.max(...storms.map((s) => s.category)) as HurricaneCategory;
  if (maxCat >= 4) return { level: "critical", text: "CRITICAL THREAT", color: "#dc2626", pulse: true };
  if (maxCat >= 3) return { level: "high", text: "MAJOR HURRICANE", color: "#ef4444", pulse: true };
  if (maxCat >= 1) return { level: "moderate", text: "HURRICANE WARNING", color: "#f97316", pulse: true };
  return { level: "low", text: "TROPICAL STORM", color: "#fbbf24", pulse: true };
}

// Demo data: Hurricane Milton (Oct 2024) track approaching SW Florida
const DEMO_STORMS: HurricaneStorm[] = [
  {
    id: "al142024-demo",
    name: "MILTON",
    classification: "HU",
    category: 3,
    intensity: 120,
    pressure: 941,
    lat: 25.9,
    lng: -82.2,
    movement: "ENE at 17 mph",
    lastUpdate: new Date().toISOString(),
    isDemo: true,
    track: [
      { lat: 21.0, lng: -94.5, time: "D-4", intensity: 55, category: 0 },
      { lat: 22.5, lng: -91.8, time: "D-3", intensity: 100, category: 2 },
      { lat: 23.4, lng: -89.2, time: "D-2", intensity: 165, category: 5 },
      { lat: 24.5, lng: -86.1, time: "D-1", intensity: 155, category: 5 },
      { lat: 25.1, lng: -84.0, time: "D-0", intensity: 140, category: 4 },
      { lat: 25.9, lng: -82.2, time: "NOW", intensity: 120, category: 3 },
      { lat: 27.0, lng: -80.5, time: "+12h", intensity: 90, category: 2 },
      { lat: 28.5, lng: -78.5, time: "+24h", intensity: 65, category: 0 },
    ],
  },
];

interface NHCStormRaw {
  id?: string;
  name?: string;
  classification?: string;
  intensity?: string | number;
  pressure?: string | number;
  latitudeNumeric?: number;
  longitudeNumeric?: number;
  movement?: string;
  lastUpdate?: string;
}

interface NHCResponse {
  activeStorms?: NHCStormRaw[];
}

// Fetch active storms from NOAA NHC via backend proxy
export async function fetchHurricaneStorms(): Promise<HurricaneStorm[]> {
  const res = await fetch("/api/hurricane/storms", {
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Hurricane API error: ${res.status}`);
  const data = await res.json() as NHCResponse;
  const active = data?.activeStorms ?? [];

  return active.map((s: NHCStormRaw) => {
    const intensity = Number(s.intensity ?? 0);
    const category = getCategory(intensity);
    return {
      id: s.id ?? "unknown",
      name: s.name ?? "Unknown",
      classification: (s.classification as StormClassification) ?? "TS",
      category,
      intensity,
      pressure: Number(s.pressure ?? 1013),
      lat: s.latitudeNumeric ?? 0,
      lng: s.longitudeNumeric ?? 0,
      movement: s.movement ?? "Unknown",
      lastUpdate: s.lastUpdate ?? new Date().toISOString(),
      track: [],
    };
  });
}

interface NOAAAlert {
  id?: string;
  properties?: {
    event?: string;
    headline?: string;
    areaDesc?: string;
    severity?: string;
    expires?: string;
  };
}

interface NOAAAlertsResponse {
  features?: NOAAAlert[];
}

// Fetch active hurricane/TS warnings from NOAA Weather API (no key needed)
export async function fetchHurricaneAlerts(): Promise<HurricaneAlert[]> {
  const url =
    "https://api.weather.gov/alerts/active?event=Hurricane%20Warning,Hurricane%20Watch,Tropical%20Storm%20Warning,Tropical%20Storm%20Watch,Storm%20Surge%20Warning";
  const res = await fetch(url, {
    headers: { Accept: "application/geo+json", "User-Agent": "TideGuard/1.0" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return [];
  const data = await res.json() as NOAAAlertsResponse;
  return (data?.features ?? []).slice(0, 8).map((f: NOAAAlert) => ({
    id: f.id ?? Math.random().toString(36),
    event: f.properties?.event ?? "Unknown",
    headline: f.properties?.headline ?? "",
    areaDesc: f.properties?.areaDesc ?? "",
    severity: f.properties?.severity ?? "Unknown",
    expires: f.properties?.expires ?? "",
  }));
}

export async function fetchHurricaneData(): Promise<HurricaneData> {
  const [stormsResult, alertsResult] = await Promise.allSettled([
    fetchHurricaneStorms(),
    fetchHurricaneAlerts(),
  ]);

  const liveStorms = stormsResult.status === "fulfilled" ? stormsResult.value : [];
  const alerts = alertsResult.status === "fulfilled" ? alertsResult.value : [];

  // Off-season: use demo data so the dashboard is always useful
  const storms = liveStorms.length > 0 ? liveStorms : DEMO_STORMS;
  const source = liveStorms.length > 0 ? "live" : "demo";

  return {
    storms,
    alerts,
    source,
    fetchedAt: new Date().toISOString(),
  };
}
