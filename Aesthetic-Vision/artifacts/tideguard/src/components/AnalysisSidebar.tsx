import { useState, useRef } from "react";
import { Wind, Newspaper, MessageSquare, X, ChevronRight, ClipboardCopy, Check, ChevronDown } from "lucide-react";
import type { NewsArticle } from "@/lib/news-api";
import type { WindData } from "@/lib/wind-api";
import type { AbundanceLevel } from "@/lib/fwc-api";
const RED_ALGAE_CHAT_URL = "https://partners.contentiq.symplistic.ai/external/deploy/chat/index.html?chat_id=83e6c4e9-5428-474a-88f2-ca533af9eb4f";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function WindRow({ wind }: { wind: WindData | null }) {
  if (!wind) return null;
  return (
    <div className="px-4 pb-3">
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{
          background: wind.isOnshore ? "rgba(239,68,68,0.06)" : "rgba(0,196,228,0.04)",
          border: `1px solid ${wind.isOnshore ? "rgba(239,68,68,0.18)" : "rgba(0,196,228,0.12)"}`,
        }}
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: wind.isOnshore ? "rgba(239,68,68,0.12)" : "rgba(0,196,228,0.10)" }}
        >
          <Wind size={14} style={{ color: wind.isOnshore ? "#ef4444" : "hsl(191 90% 46%)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">
              {wind.directionLabel} · {wind.speed} km/h
            </span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{
                background: wind.isOnshore ? "rgba(239,68,68,0.15)" : "rgba(0,196,228,0.12)",
                color: wind.isOnshore ? "#ef4444" : "hsl(191 90% 46%)",
              }}
            >
              {wind.isOnshore ? "ONSHORE" : "OFFSHORE"}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {wind.isOnshore
              ? "Airborne toxins drifting toward coastline"
              : "Bloom dispersing away from shore"}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildQuestions(fwcLevel: AbundanceLevel, wind: WindData | null) {
  const isOnshore = wind?.isOnshore ?? false;
  const speed = wind?.speed ?? 0;

  const bloomLabel: Record<AbundanceLevel, string> = {
    not_present: "no active bloom detected",
    low: "a low-level bloom is present",
    medium: "a moderate bloom is present",
    high: "a high-intensity bloom is active",
  };

  return [
    {
      q: "Is there red tide near me right now?",
      a:
        fwcLevel === "not_present"
          ? "Current FWC sampling shows no active red tide bloom in Southwest Florida waters. Conditions are clear. Always check the FWC red tide map for your exact beach before heading out."
          : fwcLevel === "low"
          ? "FWC data shows a low-level Karenia brevis presence in the area. Sensitive individuals may experience mild eye or throat irritation near the shoreline. Healthy adults are generally not at risk."
          : fwcLevel === "medium"
          ? "A moderate red tide bloom is currently detected. Swimming is not recommended for sensitive groups. Dead fish and respiratory irritation may be present along the coast."
          : "A high-intensity red tide bloom is active. Avoid the beach entirely. Respiratory irritation, dead fish, and shellfish closures are expected. Check FDOH advisories before visiting any Gulf Coast beach.",
    },
    {
      q: "Will red tide come toward shore?",
      a: isOnshore
        ? `Wind is currently blowing ${wind?.directionLabel ?? "onshore"} at ${speed} km/h — this is pushing the bloom toward the coastline. Expect elevated toxin levels and respiratory irritation near shore. Conditions could worsen over the next 12–24 hours.`
        : `Wind is blowing offshore at ${speed} km/h, dispersing the bloom away from the coast. Coastal impact is reduced right now, but conditions can shift quickly — monitor wind forecasts if you're planning a beach visit.`,
    },
    {
      q: "Is it safe to swim today?",
      a:
        fwcLevel === "not_present"
          ? "No bloom is currently detected. Swimming conditions are normal. Standard ocean safety rules still apply — watch for rip currents and marine life."
          : fwcLevel === "low"
          ? "Low-level bloom is present. Swimming is generally safe for healthy adults, but people with asthma, respiratory conditions, or skin sensitivities should avoid the water and beach area."
          : fwcLevel === "medium"
          ? "Moderate bloom detected — swimming is not recommended. You may experience skin irritation, eye burning, and respiratory symptoms. Rinse thoroughly if you do enter the water."
          : "High bloom levels — do not swim. Red tide toxins can cause severe respiratory distress, especially for those with asthma or COPD. Leave the beach area and seek air-conditioned shelter if symptoms occur.",
    },
    {
      q: "When is the best time for boating?",
      a:
        fwcLevel === "not_present"
          ? "Conditions are clear — great time to be on the water. Standard boating safety applies. Check NOAA marine forecasts before departure."
          : isOnshore
          ? `Red tide is onshore with ${wind?.directionLabel ?? "onshore"} winds. Stay offshore in open water to avoid bloom concentrations near the coast. Avoid anchoring in shallow coastal areas. Those with respiratory sensitivities should skip boating today.`
          : `Wind is ${wind?.directionLabel ?? "offshore"} — the bloom is moving away from shore, making nearshore boating more tolerable. Open-water conditions are better, but a ${bloomLabel[fwcLevel]} may still affect low-lying anchorages.`,
    },
    {
      q: "Can I eat shellfish from the Gulf?",
      a: "Do not harvest or eat wild shellfish (clams, oysters, mussels, scallops) from Florida Gulf waters during any red tide event. Karenia brevis toxins (brevetoxins) accumulate in filter feeders and are not destroyed by cooking. FDACS issues shellfish harvesting closures — check fdacs.gov before harvesting. Restaurant-sourced shellfish from commercial aquaculture is tested and generally safe.",
    },
    {
      q: "What are red tide symptoms?",
      a: "On the beach: burning or watery eyes, runny nose, coughing, sneezing, and throat irritation — symptoms appear within minutes and clear when you leave. In the water: skin rash, stinging sensations. If ingested via contaminated shellfish: nausea, vomiting, tingling lips and limbs (Neurotoxic Shellfish Poisoning). Seek medical attention if symptoms are severe or do not resolve after leaving the beach.",
    },
    {
      q: "What causes red tide?",
      a: "Florida red tide is caused by Karenia brevis, a naturally occurring microscopic algae in the Gulf of Mexico. Blooms form offshore when warm water, sunlight, and nutrient-rich conditions align. Wind and currents then carry them to the coast. While natural, blooms can be intensified by nutrient runoff from fertilizers and wastewater. They typically peak in late summer through fall.",
    },
    {
      q: "How long does red tide last?",
      a: "Individual blooms can persist for weeks to months depending on wind, water temperature, and currents. The 2017–2019 Southwest Florida bloom lasted over 15 months. Offshore blooms may dissipate faster. There is no way to remove or end a bloom — conditions improve only when natural factors like wind shifts, cooling water, or dilution break it up.",
    },
  ];
}

function CommonQuestions({ fwcLevel, wind }: { fwcLevel: AbundanceLevel; wind: WindData | null }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const questions = buildQuestions(fwcLevel, wind);

  return (
    <div className="px-4 pb-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Common Questions</div>
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
              <span className="text-xs font-medium pr-2" style={{ color: "hsl(210 30% 78%)" }}>
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
                className="px-3 pb-3 text-xs leading-relaxed"
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
  articles: NewsArticle[];
  articlesLoading: boolean;
  newsSource: "live" | "fallback" | null;
  newsMessage?: string;
  wind: WindData | null;
  fwcLevel: AbundanceLevel;
  dataTimestamp: string;
}

export default function AnalysisSidebar({
  articles,
  articlesLoading,
  newsSource,
  newsMessage,
  wind,
  fwcLevel,
  dataTimestamp,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"intel" | "chat">("intel");
  const [copied, setCopied] = useState(false);
  const [sentQ, setSentQ] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleCloseChat = () => setActiveTab("intel");

  const sendQuestion = (q: string) => {
    // Try postMessage to ContentIQ iframe
    iframeRef.current?.contentWindow?.postMessage({ type: "user-message", text: q }, "*");
    iframeRef.current?.contentWindow?.postMessage({ type: "sendMessage", message: q }, "*");
    iframeRef.current?.contentWindow?.postMessage({ content: q, role: "user" }, "*");
    // Clipboard fallback
    navigator.clipboard.writeText(q).catch(() => {});
    setSentQ(q);
    setTimeout(() => setSentQ(null), 2500);
  };

  const copyContext = () => {
    const lines: string[] = [
      `=== TideGuard Red Tide Context (${dataTimestamp}) ===`,
      "",
      `FWC Bloom Level: ${fwcLevel}`,
    ];
    if (wind) {
      lines.push(`Wind: ${wind.directionLabel} at ${wind.speed} km/h — ${wind.isOnshore ? "ONSHORE (toxins drifting toward coast)" : "OFFSHORE (bloom dispersing away from shore)"}`);
    }
    if (articles.length > 0) {
      lines.push("", "Recent Red Tide News:");
      articles.slice(0, 4).forEach((a) => lines.push(`• [${a.source}] ${a.title}`));
    }
    lines.push("", "Use this context to answer my question about current red tide conditions.");
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="absolute right-0 top-0 h-full z-[1000]" style={{ width: 420 }}>
      <div
        className="h-full flex flex-col overflow-hidden"
        style={{
          background: "rgba(7, 12, 22, 0.92)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderLeft: "1px solid rgba(255,255,255, 0.07)",
        }}
      >
        {/* Tab Bar */}
        <div
          className="flex-shrink-0 flex items-center gap-1 px-3 py-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={() => setActiveTab("intel")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{
              background: activeTab === "intel" ? "rgba(0,196,228,0.12)" : "transparent",
              color: activeTab === "intel" ? "hsl(191 90% 46%)" : "hsl(210 18% 55%)",
              border: activeTab === "intel" ? "1px solid rgba(0,196,228,0.25)" : "1px solid transparent",
            }}
          >
            <Newspaper size={11} />
            Intel Feed
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{
              background: activeTab === "chat" ? "rgba(0,196,228,0.12)" : "transparent",
              color: activeTab === "chat" ? "hsl(191 90% 46%)" : "hsl(210 18% 55%)",
              border: activeTab === "chat" ? "1px solid rgba(0,196,228,0.25)" : "1px solid transparent",
            }}
          >
            <MessageSquare size={11} />
            AI Chat
          </button>

          {/* Spacer + source badge */}
          <div className="flex-1" />
          {newsSource && activeTab === "intel" && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider"
              style={
                newsSource === "live"
                  ? { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }
                  : { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }
              }
            >
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: newsSource === "live" ? "#22c55e" : "#f59e0b" }}
              />
              {newsSource === "live" ? "LIVE" : "CACHED"}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 flex flex-col">

          {/* ── INTEL TAB ── */}
          {activeTab === "intel" && (
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Wind */}
              <div className="flex-shrink-0 pt-3">
                <WindRow wind={wind} />
              </div>

              {/* Articles — scrollable */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3">
                {articlesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-lg p-2.5 animate-pulse"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="h-2.5 rounded mb-1.5" style={{ background: "rgba(255,255,255,0.06)", width: "55%" }} />
                        <div className="h-2 rounded" style={{ background: "rgba(255,255,255,0.04)", width: "85%" }} />
                      </div>
                    ))}
                  </div>
                ) : articles.length === 0 ? (
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="text-xs font-medium text-muted-foreground">No live news available</div>
                    {newsMessage && <div className="text-[11px] text-muted-foreground/60 mt-1">{newsMessage}</div>}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {articles.slice(0, 5).map((article) => (
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
                              <span className="text-[11px] font-semibold truncate" style={{ color: "hsl(210 18% 55%)" }}>
                                {article.source}
                              </span>
                            </div>
                            <div className="text-xs font-medium leading-tight line-clamp-2" style={{ color: "hsl(210 30% 78%)" }}>
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

              {/* Footer */}
              <div
                className="flex-shrink-0 px-4 py-2.5 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="text-[10px] text-muted-foreground font-mono">
                  FWC · Open-Meteo · NewsAPI
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground">Live</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* AI Chat — fullscreen overlay (opens immediately when tab is clicked) */}
      {activeTab === "chat" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(7, 12, 22, 0.97)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-2 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(191 90% 46%)", boxShadow: "0 0 8px hsl(191 90% 46%)" }} />
              <span className="text-sm font-bold tracking-wide" style={{ color: "hsl(191 90% 46%)" }}>
                TideGuard AI
              </span>
            </div>
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
              <button
                onClick={handleCloseChat}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          {/* Quick question pills */}
          <div className="flex-shrink-0 px-4 py-2 flex flex-wrap gap-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {buildQuestions(fwcLevel, wind).map((item) => (
              <button
                key={item.q}
                onClick={() => sendQuestion(item.q)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-150 hover:bg-white/10 active:scale-95"
                style={{
                  background: "rgba(0,196,228,0.07)",
                  border: "1px solid rgba(0,196,228,0.18)",
                  color: "hsl(191 80% 60%)",
                }}
              >
                {item.q}
              </button>
            ))}
          </div>
          {sentQ && (
            <div className="flex-shrink-0 flex items-center justify-center py-1.5">
              <span className="text-[10px] font-medium px-3 py-1 rounded-full"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
                Copied — paste into chat ↓
              </span>
            </div>
          )}
          <div className="flex-1 min-h-0 p-4">
            <iframe
              ref={iframeRef}
              src={RED_ALGAE_CHAT_URL}
              style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
              allow="microphone"
            />
          </div>
        </div>
      )}
    </div>
  );
}
