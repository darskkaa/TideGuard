import { useState, useEffect, useRef, useCallback } from "react";
import { Wind, Newspaper, MessageSquare, X, ExternalLink, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NewsArticle } from "@/lib/news-api";
import type { WindData } from "@/lib/wind-api";
import type { AbundanceLevel } from "@/lib/fwc-api";

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

const CONTENTIQ_DEPLOYMENT_URL = import.meta.env.VITE_CONTENTIQ_DEPLOYMENT_URL ||
  "https://partners.contentiq.symplistic.ai/external/deploy/chat/index.html?chat_id=7d13ad4b-3e94-4651-a50e-e7d03232f7b9";

function ContentIQWidget({
  selectedArticle,
  fwcLevel,
  wind,
}: {
  selectedArticle: NewsArticle | null;
  fwcLevel: AbundanceLevel;
  wind: WindData | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef<string | null>(null);

  const injectContext = useCallback((article: NewsArticle) => {
    if (injectedRef.current === article.id) return;

    const windContext = wind
      ? `Wind: ${wind.directionLabel} at ${wind.speed} km/h (${wind.isOnshore ? "ONSHORE — toxins moving toward coast" : "OFFSHORE — dispersing away from shore"}).`
      : "";

    const prompt =
      `Analyze this article in the context of TideGuard red tide monitoring for Southwest Florida.\n\n` +
      `Article: "${article.title}"\n` +
      `Source: ${article.source}\n` +
      `Summary: ${article.description || article.content || "(no description)"}\n\n` +
      `Current conditions: Karenia brevis bloom level is ${fwcLevel.replace("_", " ")}. ${windContext}\n\n` +
      `What is the business risk for beachfront restaurants and what immediate actions should they take?`;

    const tryInject = () => {
      const widget = document.querySelector(".contentiq_symplisticai_chat");
      if (!widget) return false;

      const textarea = widget.querySelector("textarea") as HTMLTextAreaElement | null;
      const input = widget.querySelector("input[type='text'], input:not([type])") as HTMLInputElement | null;
      const target = textarea || input;

      if (!target) return false;

      const nativeSetter =
        target instanceof HTMLTextAreaElement
          ? Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set
          : Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

      nativeSetter?.call(target, prompt);
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
      target.focus();

      injectedRef.current = article.id;
      return true;
    };

    let attempts = 0;
    const interval = setInterval(() => {
      if (tryInject() || attempts++ > 20) clearInterval(interval);
    }, 300);
  }, [fwcLevel, wind]);

  useEffect(() => {
    if (selectedArticle) {
      injectContext(selectedArticle);
    } else {
      injectedRef.current = null;
    }
  }, [selectedArticle, injectContext]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col min-h-0">
      {/* Widget label */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={12} className="text-muted-foreground" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            ContentIQ · IBM watsonx
          </span>
        </div>
        <div
          className="text-[9px] font-semibold px-1.5 py-0.5 rounded tracking-wider"
          style={{
            background: "rgba(0,196,228,0.1)",
            border: "1px solid rgba(0,196,228,0.2)",
            color: "hsl(191 90% 46%)",
          }}
        >
          AI AGENT
        </div>
      </div>

      {/* Selected article context badge */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-2 overflow-hidden"
          >
            <div
              className="rounded-xl p-3"
              style={{
                background: "rgba(0,196,228,0.06)",
                border: "1px solid rgba(0,196,228,0.18)",
              }}
            >
              <div className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">
                Analyzing Article
              </div>
              <div className="text-[11px] text-foreground font-medium leading-snug line-clamp-2">
                {selectedArticle.title}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {selectedArticle.source} · {timeAgo(selectedArticle.publishedAt)}
              </div>
              <div className="text-[10px] text-muted-foreground/70 mt-1.5 italic">
                Context pre-loaded into chat ↓
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ContentIQ deployed agent iframe */}
      <div className="flex-1 px-4 pb-2 min-h-0">
        <iframe
          src={CONTENTIQ_DEPLOYMENT_URL}
          style={{ width: "100%", height: "100%", minHeight: 320, border: "none", borderRadius: 12 }}
          allow="microphone"
          title="TideGuard AI Agent"
        />
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
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const riskColor = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#22c55e",
    not_present: "hsl(191 90% 46%)",
  }[fwcLevel] ?? "hsl(191 90% 46%)";

  return (
    <div className="absolute right-0 top-0 h-full z-[1000]" style={{ width: 380 }}>
      <div
        className="h-full flex flex-col"
        style={{
          background: "rgba(7, 12, 22, 0.92)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderLeft: "1px solid rgba(255,255,255, 0.07)",
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255, 0.06)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="text-[10px] font-bold tracking-widest text-primary uppercase">
                  wxO / Symplistic
                </div>
                <div
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded tracking-wider"
                  style={{
                    background: "rgba(0,196,228,0.1)",
                    border: "1px solid rgba(0,196,228,0.2)",
                    color: "hsl(191 90% 46%)",
                  }}
                >
                  LIVE
                </div>
              </div>
              <div className="text-sm font-semibold text-foreground leading-tight">
                Threat Analysis
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                ContentIQ · IBM watsonx Agent
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div
                className="w-3 h-3 rounded-full ml-auto mb-1"
                style={{ background: riskColor, boxShadow: `0 0 12px ${riskColor}` }}
              />
              <div
                className="text-mono text-[10px]"
                style={{ color: riskColor, letterSpacing: "0.08em" }}
              >
                {fwcLevel.replace("_", " ").toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Bloom Level", value: fwcLevel.replace("_", " "), color: riskColor },
              { label: "Wind", value: wind ? `${wind.directionLabel} ${wind.speed}` : "—", color: "hsl(210 30% 75%)" },
              { label: "Updated", value: dataTimestamp || "Just now", color: "hsl(210 18% 50%)" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-2.5 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">
                  {item.label}
                </div>
                <div
                  className="text-mono text-[11px] font-semibold capitalize"
                  style={{ color: item.color }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wind */}
        <div className="flex-shrink-0 pt-3">
          <WindRow wind={wind} />
        </div>

        {/* News feed — compact, non-scrolling */}
        <div
          className="flex-shrink-0 px-4 pb-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Newspaper size={11} className="text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Intel Feed
              </span>
            </div>
            {newsSource && (
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
              {articles.slice(0, 5).map((article) => {
                const isSelected = selectedArticle?.id === article.id;
                return (
                  <motion.button
                    key={article.id}
                    onClick={() => setSelectedArticle(isSelected ? null : article)}
                    className="w-full text-left rounded-xl p-2.5 transition-all duration-150"
                    style={{
                      background: isSelected ? "rgba(0,196,228,0.08)" : "rgba(255,255,255,0.02)",
                      border: isSelected
                        ? "1px solid rgba(0,196,228,0.28)"
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                    whileTap={{ scale: 0.997 }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="text-[10px] font-semibold truncate"
                            style={{ color: isSelected ? "hsl(191 90% 46%)" : "hsl(210 18% 55%)" }}
                          >
                            {article.source}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {timeAgo(article.publishedAt)}
                          </span>
                        </div>
                        <div
                          className="text-[11px] font-medium leading-tight line-clamp-2"
                          style={{ color: isSelected ? "hsl(210 30% 95%)" : "hsl(210 30% 78%)" }}
                        >
                          {article.title}
                        </div>
                      </div>
                      <ChevronRight
                        size={12}
                        className="flex-shrink-0 mt-1"
                        style={{
                          color: isSelected ? "hsl(191 90% 46%)" : "hsl(210 18% 40%)",
                          transform: isSelected ? "rotate(90deg)" : "none",
                          transition: "transform 0.15s",
                        }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* ContentIQ Chat Widget — fills remaining space */}
        <ContentIQWidget
          selectedArticle={selectedArticle}
          fwcLevel={fwcLevel}
          wind={wind}
        />

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
    </div>
  );
}
