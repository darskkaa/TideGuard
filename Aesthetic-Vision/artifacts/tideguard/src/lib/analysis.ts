import type { AbundanceLevel } from "./fwc-api";
import type { WindData } from "./wind-api";
import type { NewsArticle } from "./news-api";

export type RiskLevel = "CRITICAL" | "ELEVATED" | "MODERATE" | "LOW" | "MINIMAL";

export interface ThreatAnalysis {
  riskLevel: RiskLevel;
  location: string;
  detectedSymptoms: string[];
  recommendation: string;
  briefText: string;
  confidence: number;
}

export function buildAnalysis(
  article: NewsArticle,
  fwcLevel: AbundanceLevel,
  wind: WindData | null
): ThreatAnalysis {
  const isCritical = fwcLevel === "high" && wind?.isOnshore;
  const isElevated = fwcLevel === "high" || (fwcLevel === "medium" && wind?.isOnshore);
  const isModerate = fwcLevel === "medium" || (fwcLevel === "low" && wind?.isOnshore);

  const riskLevel: RiskLevel = isCritical
    ? "CRITICAL"
    : isElevated
    ? "ELEVATED"
    : isModerate
    ? "MODERATE"
    : "LOW";

  const locations = extractLocations(article.title + " " + (article.description ?? ""));
  const location = locations.length > 0 ? locations.join(", ") : "Southwest Florida Gulf Coast";

  const symptoms = extractSymptoms(article.title + " " + (article.description ?? ""));

  const recommendations: Record<RiskLevel, string> = {
    CRITICAL: "CRITICAL RISK: Close outdoor patio immediately. Airborne Karenia brevis toxins approaching onshore. Respiratory hazard for staff and guests.",
    ELEVATED: "ELEVATED RISK: Limit outdoor dining exposure. Monitor air quality hourly. Prepare contingency for patio closure within 2–4 hours.",
    MODERATE: "MODERATE RISK: Post health advisory at entrance. Reduce outdoor seating capacity 50%. Keep guests informed of current conditions.",
    LOW: "LOW RISK: Standard monitoring protocol. Update guests on conditions. No operational changes required at this time.",
    MINIMAL: "MINIMAL RISK: No action required. Bloom activity is not present in monitored zones. Continue routine monitoring.",
  };

  const briefText = `TideGuard Alert for ${location}. Risk level: ${riskLevel}. ${recommendations[riskLevel]}. Wind is ${wind ? `${wind.directionLabel} at ${wind.speed} km/h — ${wind.isOnshore ? "onshore, carrying toxins toward coast" : "offshore, dispersing blooms seaward"}` : "conditions unavailable"}. Karenia brevis concentration: ${fwcLevel.replace("_", " ")}. Confidence: ${getConfidence(riskLevel)}%.`;

  return {
    riskLevel,
    location,
    detectedSymptoms: symptoms,
    recommendation: recommendations[riskLevel],
    briefText,
    confidence: getConfidence(riskLevel),
  };
}

function getConfidence(level: RiskLevel): number {
  switch (level) {
    case "CRITICAL": return 94;
    case "ELEVATED": return 87;
    case "MODERATE": return 79;
    case "LOW": return 82;
    case "MINIMAL": return 91;
  }
}

function extractLocations(text: string): string[] {
  const places = ["Fort Myers", "Sarasota", "Naples", "Bonita Springs", "Cape Coral", "Sanibel", "Siesta Key", "Longboat Key", "Marco Island", "Englewood", "Venice", "Charlotte Harbor"];
  return places.filter(p => text.toLowerCase().includes(p.toLowerCase()));
}

function extractSymptoms(text: string): string[] {
  const symptoms: string[] = [];
  if (/fish kill|dead fish|dying fish/i.test(text)) symptoms.push("Fish kill events detected");
  if (/respiratory|cough|irritat|wheez/i.test(text)) symptoms.push("Respiratory irritation reported");
  if (/beach clos|swim|advisory/i.test(text)) symptoms.push("Beach advisories issued");
  if (/shellfish|red tide bloom|karenia/i.test(text)) symptoms.push("Karenia brevis bloom confirmed");
  if (/discolor|brown|rust/i.test(text)) symptoms.push("Discolored water visible");
  if (symptoms.length === 0) {
    symptoms.push("Karenia brevis cells detected in water samples");
    symptoms.push("Monitoring in progress by FWC");
  }
  return symptoms;
}
