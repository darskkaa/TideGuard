import { useState, useEffect } from "react";
import { Wind, Newspaper, MessageSquare, X, ExternalLink, ChevronRight, ChevronDown, Maximize2, Minimize2 } from "lucide-react";
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
  "https://partners.contentiq.symplistic.ai/external/deploy/chat/index.html?chat_id=83e6c4e9-5428-474a-88f2-ca533af9eb4f";

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
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isFullscreen, setFullscreen] = useState(false);
  const [contextExpanded, setContextExpanded] = useState(false);

  // Auto-switch to chat tab when article is selected
  useEffect(() => {
    if (selectedArticle) setActiveTab("chat");
  }, [selectedArticle]);

  const windContext = wind
    ? `Wind: ${wind.directionLabel} at ${wind.speed} km/h (${wind.isOnshore ? "ONSHORE — toxins moving toward coast" : "OFFSHORE — dispersing away"})`
    : "Wind: Data unavailable";

  const suggestedPrompt = selectedArticle
    ? `Analyze "${selectedArticle.title}" (${selectedArticle.source}) in the context of red tide monitoring for Southwest Florida. Current conditions: Bloom level is ${fwcLevel.replace("_", " ")}, ${windContext}. What business risks and actions should coastal restaurants take?`
    : "";

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
            {selectedArticle && activeTab !== "chat" && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "hsl(191 90% 46%)" }}
              />
            )}
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

          {/* ── CHAT TAB ── */}
          {activeTab === "chat" && (
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Chat header with fullscreen toggle */}
              <div
                className="flex-shrink-0 flex items-center justify-between px-4 py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  TideGuard AI
                </div>
                <button
                  onClick={() => setFullscreen(!isFullscreen)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 size={14} className="text-muted-foreground" />
                  ) : (
                    <Maximize2 size={14} className="text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Collapsible context panel */}
              <AnimatePresence>
                {selectedArticle && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <button
                      onClick={() => setContextExpanded(!contextExpanded)}
                      className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-primary uppercase tracking-widest">
                          Article Context
                        </span>
                        <span className="text-[8px] text-muted-foreground truncate max-w-32">
                          {selectedArticle.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedArticle(null); }}
                          className="p-0.5 hover:bg-white/10 rounded"
                        >
                          <X size={10} className="text-muted-foreground" />
                        </button>
                        <ChevronDown
                          size={14}
                          className="flex-shrink-0 transition-transform"
                          style={{ transform: contextExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </div>
                    </button>

                    {contextExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="px-4 py-2 max-h-40 overflow-y-auto"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="space-y-2">
                          <div>
                            <div className="text-[8px] font-semibold text-primary uppercase tracking-widest mb-0.5">
                              Selected Article
                            </div>
                            <div className="text-[9px] text-foreground font-medium leading-snug">
                              {selectedArticle.title}
                            </div>
                            <div className="text-[8px] text-muted-foreground mt-0.5">
                              {selectedArticle.source} · {timeAgo(selectedArticle.publishedAt)}
                            </div>
                          </div>

                          <div className="pt-1 border-t border-white/10 space-y-1">
                            <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                <div className="text-[7px] text-muted-foreground uppercase tracking-widest">Bloom</div>
                                <div className="text-[9px] font-semibold text-white">{fwcLevel.replace("_", " ")}</div>
                              </div>
                              <div>
                                <div className="text-[7px] text-muted-foreground uppercase tracking-widest">Wind</div>
                                <div className="text-[9px] font-semibold text-white">{wind ? `${wind.directionLabel} ${wind.speed}` : "—"}</div>
                              </div>
                            </div>

                            <div className="pt-1">
                              <div className="text-[7px] text-muted-foreground uppercase tracking-widest mb-0.5">Suggested Prompt</div>
                              <div className="text-[8px] text-white/75 bg-white/5 rounded p-1 max-h-16 overflow-y-auto font-mono leading-tight">
                                {suggestedPrompt}
                              </div>
                              <div className="text-[7px] text-muted-foreground/60 mt-0.5 italic">
                                Copy &amp; paste below
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* iframe — fills all remaining space */}
              <div className="flex-1 min-h-0 px-3 pb-3 pt-2">
                <iframe
                  src={CONTENTIQ_DEPLOYMENT_URL}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.02)",
                    display: "block",
                  }}
                  allow="microphone"
                  title="TideGuard AI Agent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
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
              TideGuard AI — Fullscreen
            </span>
            <button
              onClick={() => setFullscreen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 min-h-0 p-4">
            <iframe
              src={CONTENTIQ_DEPLOYMENT_URL}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.02)",
                display: "block",
              }}
              allow="microphone"
              title="TideGuard AI Agent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
