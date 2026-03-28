export type AbundanceLevel = "not_present" | "low" | "medium" | "high";

export interface FWCFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    Count_?: number | string;
    Abundance?: string;
    Sample_Date?: string;
    Location?: string;
    County?: string;
    [key: string]: unknown;
  };
}

export interface FWCGeoJSON {
  type: "FeatureCollection";
  features: FWCFeature[];
}

export function getAbundanceLevel(properties: FWCFeature["properties"]): AbundanceLevel {
  const abundance = (properties.Abundance || "").toString().toLowerCase();
  const count = Number(properties.Count_ ?? properties.count ?? 0);

  if (
    abundance.includes("not present") ||
    abundance.includes("background") ||
    abundance.includes("very low") ||
    count === 0
  ) {
    return "not_present";
  }
  if (
    abundance.includes("high") ||
    abundance.includes("very high") ||
    abundance.includes("bloom") ||
    count > 100000
  ) {
    return "high";
  }
  if (abundance.includes("medium") || abundance.includes("moderate") || count > 1000) {
    return "medium";
  }
  return "low";
}

export function getAbundanceColor(level: AbundanceLevel): string {
  switch (level) {
    case "high": return "#ef4444";
    case "medium": return "#f59e0b";
    case "low": return "#22c55e";
    case "not_present": return "#3b82f6";
  }
}

export function getAbundanceLabel(level: AbundanceLevel): string {
  switch (level) {
    case "high": return "High";
    case "medium": return "Medium";
    case "low": return "Low";
    case "not_present": return "Not Present";
  }
}

const FWC_URL =
  "https://gis.myfwc.com/mapping/rest/services/Projects_FWC/HAB_forDEP_Dashboard/MapServer/0/query?where=1%3D1&outFields=*&f=geojson";

export async function fetchFWCData(): Promise<FWCGeoJSON> {
  const res = await fetch(FWC_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`FWC API error: ${res.status}`);
  const data = await res.json() as FWCGeoJSON;
  return data;
}

export function getHighestThreatLevel(features: FWCFeature[]): AbundanceLevel {
  let highest: AbundanceLevel = "not_present";
  const order: AbundanceLevel[] = ["not_present", "low", "medium", "high"];
  for (const f of features) {
    const level = getAbundanceLevel(f.properties);
    if (order.indexOf(level) > order.indexOf(highest)) {
      highest = level;
    }
  }
  return highest;
}
