import { useState, useEffect, useCallback } from "react";
import { Wind, AlertTriangle, MessageSquare, X, ChevronRight, Newspaper, ClipboardCopy, Check, ChevronDown } from "lucide-react";
import type { HurricaneStorm, HurricaneAlert } from "@/lib/hurricane-api";
import { getCategoryColor, getCategoryLabel, getThreatLevel } from "@/lib/hurricane-api";
import type { WindData } from "@/lib/wind-api";
import type { NewsArticle } from "@/lib/news-api";
import { fetchHurricaneNews } from "@/lib/hurricane-news-api";
const HURRICANE_CHAT_URL = "https://partners.contentiq.symplistic.ai/external/deploy/chat/index.html?chat_id=dcaff135-7274-4581-bb0a-25ea26b62d72";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AlertBadge({ alert }: { alert: HurricaneAlert }) {
  const color =
    alert.event.includes("Warning") ? "#ef4444" :
    alert.event.includes("Watch") ? "#f59e0b" :
    "#60a5fa";
  return (
    <div className="rounded-xl p-2.5 mb-1.5"
      style={{ background: color + "10", border: `1px solid ${color}25` }}>
      <div className="flex items-start gap-2">
        <AlertTriangle size={11} style={{ color, flexShrink: 0, marginTop: 1 }} />
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{alert.event}</div>
          <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">{alert.areaDesc}</div>
        </div>
      </div>
    </div>
  );
}

function StormCard({ storm }: { storm: HurricaneStorm }) {
  const color = getCategoryColor(storm.category);
  const label = getCategoryLabel(storm);
  return (
    <div className="rounded-xl p-3 mb-2" style={{ background: color + "0e", border: `1px solid ${color}28` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          <span className="text-sm font-bold text-foreground">{storm.name}</span>
          {storm.isDemo && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}>DEMO</span>
          )}
        </div>
        <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "WINDS", value: `${storm.intensity} mph` },
          { label: "PRESSURE", value: `${storm.pressure} mb` },
          { label: "MOVEMENT", value: storm.movement },
        ].map(({ label: l, value }) => (
          <div key={l}>
            <div className="text-[8px] text-muted-foreground uppercase tracking-widest">{l}</div>
            <div className="text-[11px] font-semibold text-foreground">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildHurricaneQuestions(storms: HurricaneStorm[], alerts: HurricaneAlert[], wind: WindData | null) {
  const hasActiveStorm = storms.length > 0;
  const hasWarning = alerts.some((a) => a.event.includes("Warning"));
  const topStorm = storms[0];

  return [
    // ── Passed TestIQ cases ──
    {
      q: "What was the average NFIP payout for Hurricane Ian?",
      a: "Hurricane Ian (2022) generated over 44,000 NFIP flood insurance claims across Florida. The average payout was approximately $116,000 per claim, with total NFIP payments exceeding $3.6 billion. Lee County alone accounted for the majority of claims, making Ian the single most expensive NFIP event in Florida history. Many homeowners who lacked flood coverage received nothing — underscoring the coverage gap that affects an estimated 60% of Gulf Coast homeowners.",
    },
    {
      q: "What is a Zone V/VE flood zone?",
      a: "Zone V/VE (Velocity Hazard Zone) is FEMA's highest-risk coastal flood designation — areas subject to wave action in addition to flooding. Building requirements include: elevation on open pilings or columns (not fill), breakaway walls below the BFE, no enclosed space used for living below the BFE, freeboard above the Base Flood Elevation (BFE), and mandatory NFIP flood insurance for federally-backed mortgages. Zone VE includes BFE data while Zone V does not. Most of Southwest Florida's beachfront and barrier island properties fall in VE zones.",
    },
    {
      q: "What was the total economic damage from Hurricane Ian?",
      a: "Hurricane Ian (September 28, 2022) caused an estimated $112–$113 billion in total economic damage, making it the third-costliest U.S. hurricane on record. Insured losses reached approximately $60 billion. Lee County bore the brunt — Fort Myers Beach and Pine Island were nearly destroyed. Over 150 people died, primarily from storm surge. Ian made landfall near Fort Myers as a Category 4 storm with 150 mph winds and a storm surge of 12–18 feet along the Lee County coast.",
    },
    {
      q: "What is the risk profile for Lee County?",
      a: "Lee County is among Florida's highest-risk counties for hurricane storm surge and wind damage. Key risk factors: (1) Low elevation — much of the county sits 5–10 ft above sea level. (2) Extensive coastline and estuaries amplify surge. (3) Large pre-2002 housing stock with older wind mitigation standards. (4) High population density in Zones A/B (Cape Coral, Fort Myers Beach, Bonita Springs). (5) Ian 2022 demonstrated catastrophic vulnerability — surge of 12–18 ft inundated areas miles inland. Properties in Zones A, AE, and VE face mandatory flood insurance requirements.",
    },
    // ── Live-condition questions ──
    {
      q: "Should I evacuate right now?",
      a: hasWarning
        ? `A Hurricane Warning is currently active in the area. If you are in an evacuation Zone A or B, leave immediately — do not wait for the storm to approach. Bring your go-bag, medications, documents, and pets. Use designated evacuation routes and go to the nearest public shelter. Do NOT shelter in place in Zone A during a major hurricane.`
        : hasActiveStorm
        ? `A tropical system is active (${topStorm?.name ?? "unnamed"}). Monitor your local Emergency Management agency and NHC advisories closely. Prepare your go-bag now. If you are in Zone A or B and a Warning is issued, be ready to leave within 1–2 hours.`
        : "No active storm warnings are in effect. This is a good time to review your evacuation zone, plan your route, and assemble your hurricane kit so you're ready before a storm threatens.",
    },
    {
      q: "What should my hurricane kit include?",
      a: "FEMA recommends a minimum 7-day supply kit for Southwest Florida: (1) Water — 1 gallon/person/day. (2) Non-perishable food and manual can opener. (3) Medications and copies of prescriptions. (4) Important documents — insurance policies, IDs, deeds — in a waterproof bag. (5) Phone chargers + portable battery bank. (6) Flashlights and extra batteries. (7) First aid kit. (8) Cash in small bills (ATMs fail after storms). (9) Pet supplies, leash, carrier, and vaccination records. (10) N95 masks and hand sanitizer. Store your kit in a grab-and-go bag near the door.",
    },
    {
      q: "How do I file a hurricane damage claim?",
      a: "1. Document everything first — photograph and video all damage before any cleanup or repairs. 2. Call your homeowner's insurer and file a claim as soon as possible — backlogs form fast after major storms. 3. If you have NFIP flood insurance, file a separate flood claim (different policy). 4. Request your adjuster appointment and ask for a written estimate. 5. Apply for FEMA Individual Assistance at DisasterAssistance.gov if a federal disaster is declared. 6. Apply for an SBA disaster loan (available to homeowners and renters) at disasterloanassistance.sba.gov. Keep all receipts for temporary repairs and living expenses — these may be reimbursable.",
    },
    {
      q: "What are hurricane deductibles in Florida?",
      a: "Florida homeowners insurance policies have a separate hurricane deductible — typically 2%, 5%, or 10% of the insured dwelling value (not a flat dollar amount). Example: a $400,000 home with a 5% deductible means you pay the first $20,000 out of pocket before insurance applies. Hurricane deductibles activate once the NHC names a storm that threatens Florida. Citizens Property Insurance offers 2% minimum deductibles. Always check whether your policy has a separate wind deductible and a separate flood deductible — they are not the same coverage.",
    },
    {
      q: "What are major Florida insurance changes for 2026?",
      a: "Key 2026 Florida insurance developments: (1) SB 2A (2022) & HB 837 (2023) reforms reduced litigation abuse, lowering some market pressures. (2) Reinsurance costs remain elevated post-Ian, keeping premiums high across SW Florida. (3) Citizens Property Insurance depopulation program continues pushing policies to private market. (4) New roof age rules: insurers may not deny coverage solely due to a roof over 15 years old if in good condition. (5) Surplus lines and E&S carriers now cover more properties where admitted carriers have withdrawn. Always compare Citizens vs. private market rates annually — the gap has narrowed.",
    },
  ];
}

function HurricaneCommonQuestions({ storms, alerts, wind }: { storms: HurricaneStorm[]; alerts: HurricaneAlert[]; wind: WindData | null }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const questions = buildHurricaneQuestions(storms, alerts, wind);

  return (
    <div className="px-4 pb-3">
      <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Common Questions</div>
      <div className="space-y-1">
        {questions.map((item, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <span className="text-[11px] font-medium pr-2" style={{ color: "hsl(210 30% 78%)" }}>
                {item.q}
              </span>
              <ChevronDown
                size={12}
                className="flex-shrink-0 transition-transform duration-150"
                style={{
                  color: "hsl(210 18% 45%)",
                  transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {openIndex === i && (
              <div
                className="px-3 pb-3 text-[11px] leading-relaxed"
                style={{
                  color: "hsl(210 15% 60%)",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  paddingTop: 8,
                }}
              >
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SidebarProps {
  storms: HurricaneStorm[];
  alerts: HurricaneAlert[];
  wind: WindData | null;
  dataSource: "live" | "demo";
  dataTimestamp: string;
}

export default function HurricaneSidebar({
  storms,
  alerts,
  wind,
  dataSource,
  dataTimestamp,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"intel" | "chat">("intel");
  const [copied, setCopied] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [newsSource, setNewsSource] = useState<"live" | "fallback" | null>(null);
  const threat = getThreatLevel(storms);

  const loadNews = useCallback(async () => {
    setArticlesLoading(true);
    try {
      const data = await fetchHurricaneNews();
      setArticles(data.articles);
      setNewsSource(data.source);
    } catch {
      setArticles([]);
      setNewsSource("fallback");
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const copyContext = () => {
    const lines: string[] = [
      `=== StormGuard Hurricane Context (${dataTimestamp}) ===`,
      `Data Source: ${dataSource.toUpperCase()}`,
      "",
    ];
    if (storms.length === 0) {
      lines.push("Active Storms: None");
    } else {
      lines.push("Active Storms:");
      storms.forEach((s) => {
        lines.push(`• ${s.name} — ${getCategoryLabel(s)}, ${s.intensity} mph winds, ${s.pressure} mb, moving ${s.movement}`);
      });
    }
    lines.push(``, `Threat Level: ${threat.text}`);
    if (wind) {
      lines.push(`Wind: ${wind.directionLabel} at ${wind.speed} km/h — ${wind.isOnshore ? "ONSHORE (surge risk elevated)" : "OFFSHORE (reduced coastal impact)"}`);
    }
    if (alerts.length > 0) {
      lines.push("", "Active Warnings:");
      alerts.forEach((a) => lines.push(`• ${a.event}: ${a.areaDesc}`));
    }
    if (articles.length > 0) {
      lines.push("", "Recent Hurricane News:");
      articles.slice(0, 4).forEach((a) => lines.push(`• [${a.source}] ${a.title}`));
    }
    lines.push("", "Use this context to answer my question about current hurricane conditions.");
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const tabs = [
    { id: "intel" as const, label: "Intel Feed", icon: Newspaper },
    { id: "chat" as const, label: "AI Chat", icon: MessageSquare },
  ];

  return (
    <>
      <div className="absolute right-0 top-0 h-full z-[1000]" style={{ width: 420 }}>
        <div className="h-full flex flex-col overflow-hidden"
          style={{
            background: "rgba(7, 12, 22, 0.92)",
            backdropFilter: "blur(24px) saturate(1.6)",
            WebkitBackdropFilter: "blur(24px) saturate(1.6)",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
          }}>

          {/* Tab bar */}
          <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
                style={{
                  background: activeTab === id ? "rgba(0,196,228,0.12)" : "transparent",
                  color: activeTab === id ? "hsl(191 90% 46%)" : "hsl(210 18% 55%)",
                  border: activeTab === id ? "1px solid rgba(0,196,228,0.25)" : "1px solid transparent",
                }}>
                <Icon size={11} />
                {label}
              </button>
            ))}
            <div className="flex-1" />
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider"
              style={dataSource === "live"
                ? { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }
                : { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
              <div className="w-1 h-1 rounded-full" style={{ background: dataSource === "live" ? "#22c55e" : "#f59e0b" }} />
              {dataSource === "live" ? "LIVE" : "DEMO"}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 flex flex-col">

            {/* ── Intel tab ── */}
            {activeTab === "intel" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {/* Wind row */}
                  {wind && (
                    <div className="px-4 pt-3 pb-2">
                      <div className="rounded-xl p-3 flex items-center gap-3"
                        style={{
                          background: wind.isOnshore ? "rgba(239,68,68,0.06)" : "rgba(0,196,228,0.04)",
                          border: `1px solid ${wind.isOnshore ? "rgba(239,68,68,0.18)" : "rgba(0,196,228,0.12)"}`,
                        }}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: wind.isOnshore ? "rgba(239,68,68,0.12)" : "rgba(0,196,228,0.10)" }}>
                          <Wind size={14} style={{ color: wind.isOnshore ? "#ef4444" : "hsl(191 90% 46%)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">
                              {wind.directionLabel} · {wind.speed} km/h
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{
                                background: wind.isOnshore ? "rgba(239,68,68,0.15)" : "rgba(0,196,228,0.12)",
                                color: wind.isOnshore ? "#ef4444" : "hsl(191 90% 46%)",
                              }}>
                              {wind.isOnshore ? "ONSHORE" : "OFFSHORE"}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {wind.isOnshore ? "Storm surge risk elevated along coastline" : "Offshore flow — reduced coastal impact"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Storms */}
                  <div className="px-4 pb-2">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Active Storms</div>
                    {storms.length === 0 ? (
                      <div className="rounded-xl p-3 text-center"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="text-xs text-muted-foreground">No active tropical cyclones</div>
                      </div>
                    ) : (
                      storms.map((s) => <StormCard key={s.id} storm={s} />)
                    )}
                  </div>

                  {/* Alerts */}
                  {alerts.length > 0 && (
                    <div className="px-4 pb-2">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Active Warnings</div>
                      {alerts.map((a) => <AlertBadge key={a.id} alert={a} />)}
                    </div>
                  )}

                  {/* Threat level */}
                  <div className="px-4 pb-2">
                    <div className="rounded-xl p-3"
                      style={{ background: threat.color + "0a", border: `1px solid ${threat.color}22` }}>
                      <div className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1">Current Threat Level</div>
                      <div className="flex items-center gap-2">
                        {threat.pulse && (
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: threat.color }} />
                        )}
                        <span className="text-sm font-bold" style={{ color: threat.color }}>{threat.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Common Questions */}
                  <HurricaneCommonQuestions storms={storms} alerts={alerts} wind={wind} />

                  {/* Hurricane News Articles */}
                  <div className="px-4 pb-3">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Hurricane News</div>
                    {articlesLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="rounded-lg p-2.5 animate-pulse"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="h-2.5 rounded mb-1.5" style={{ background: "rgba(255,255,255,0.06)", width: "55%" }} />
                            <div className="h-2 rounded" style={{ background: "rgba(255,255,255,0.04)", width: "85%" }} />
                          </div>
                        ))}
                      </div>
                    ) : articles.length === 0 ? (
                      <div className="rounded-xl p-3 text-center"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="text-xs text-muted-foreground">No hurricane news available</div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {articles.slice(0, 6).map((article) => (
                          <a
                            key={article.id}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-left rounded-xl p-2.5 transition-all duration-150 hover:bg-white/5"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.05)",
                              textDecoration: "none",
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[10px] font-semibold text-muted-foreground truncate">
                                    {article.source}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
                                    {timeAgo(article.publishedAt)}
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium leading-tight line-clamp-2"
                                  style={{ color: "hsl(210 30% 78%)" }}>
                                  {article.title}
                                </div>
                              </div>
                              <ChevronRight size={12} className="flex-shrink-0 mt-1" style={{ color: "hsl(210 18% 40%)" }} />
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-4 py-2.5 flex items-center justify-between"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-[10px] text-muted-foreground font-mono">NHC · NOAA · NewsAPI</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground">{dataTimestamp}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* AI Chat — fullscreen overlay (opens immediately when tab is clicked) */}
      {activeTab === "chat" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(7, 12, 22, 0.97)", display: "flex", flexDirection: "column" }}>
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              StormGuard AI
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyContext}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-150"
                style={{
                  background: copied ? "rgba(34,197,94,0.12)" : "rgba(0,196,228,0.08)",
                  border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(0,196,228,0.2)",
                  color: copied ? "#22c55e" : "hsl(191 90% 46%)",
                }}
                title="Copy live context to paste into chat"
              >
                {copied ? <Check size={11} /> : <ClipboardCopy size={11} />}
                {copied ? "Copied!" : "Copy Context"}
              </button>
              <button onClick={() => setActiveTab("intel")}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-4">
            <iframe
              src={HURRICANE_CHAT_URL}
              style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
              allow="microphone"
            />
          </div>
        </div>
      )}
    </>
  );
}
