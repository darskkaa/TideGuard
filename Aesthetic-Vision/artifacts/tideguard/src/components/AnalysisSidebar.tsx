import { useState } from "react";
import { Wind, Newspaper, MessageSquare, X, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { NewsArticle } from "@/lib/news-api";
import type { WindData } from "@/lib/wind-api";
import type { AbundanceLevel } from "@/lib/fwc-api";
import ContentIQWidget from "@/components/ContentIQWidget";

const RED_ALGAE_AGENT_ID = "1f1af1fb-c3fa-4286-b4aa-6a609d5c91e3";
const RED_ALGAE_AGENT_TOKEN = "9ee484b45a15dcc3cef0206aabcea67c0b0d7577144bebb5b5e33662d6913319";

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

  // Chat tab opens fullscreen; closing reverts to intel
  const handleCloseChat = () => setActiveTab("intel");

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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
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
                              <span className="text-[10px] font-semibold truncate" style={{ color: "hsl(210 18% 55%)" }}>
                                {article.source}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                {timeAgo(article.publishedAt)}
                              </span>
                            </div>
                            <div className="text-[11px] font-medium leading-tight line-clamp-2" style={{ color: "hsl(210 30% 78%)" }}>
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
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              TideGuard AI
            </span>
            <button
              onClick={handleCloseChat}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 min-h-0 p-4">
            <ContentIQWidget
              agentId={RED_ALGAE_AGENT_ID}
              token={RED_ALGAE_AGENT_TOKEN}
              style={{ height: "100%", borderRadius: 12 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
