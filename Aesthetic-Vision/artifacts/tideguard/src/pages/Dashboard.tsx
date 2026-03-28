import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, RefreshCw, AlertTriangle, MapPin } from "lucide-react";
import TideMap from "@/components/TideMap";
import AnalysisSidebar from "@/components/AnalysisSidebar";
import type { FWCFeature } from "@/lib/fwc-api";
import { fetchFWCData, getHighestThreatLevel, getAbundanceLabel } from "@/lib/fwc-api";
import type { WindData } from "@/lib/wind-api";
import { fetchWindData } from "@/lib/wind-api";
import type { NewsArticle, NewsResponse } from "@/lib/news-api";
import { fetchNewsArticles } from "@/lib/news-api";
import type { AbundanceLevel } from "@/lib/fwc-api";

const CENTER_LAT = 26.9436;
const CENTER_LNG = -82.1539;

const RISK_HEADER: Record<string, { text: string; color: string; pulse: boolean }> = {
  high: { text: "CRITICAL THREAT", color: "#ef4444", pulse: true },
  medium: { text: "ELEVATED THREAT", color: "#f59e0b", pulse: true },
  low: { text: "LOW THREAT", color: "#22c55e", pulse: false },
  not_present: { text: "ALL CLEAR", color: "hsl(191 90% 46%)", pulse: false },
};

function TopBar({
  fwcLevel,
  featureCount,
  wind,
  lastUpdated,
  onRefresh,
  refreshing,
}: {
  fwcLevel: AbundanceLevel;
  featureCount: number;
  wind: WindData | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const risk = RISK_HEADER[fwcLevel] ?? RISK_HEADER.not_present;
  const now = lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div
      className="absolute top-0 left-0 z-[1001] flex items-center gap-0"
      style={{ width: "calc(100% - 380px)" }}
    >
      <div
        className="w-full"
        style={{
          background: "rgba(6, 12, 22, 0.92)",
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center justify-between px-5 h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(0,196,228,0.12)",
                border: "1px solid rgba(0,196,228,0.25)",
                boxShadow: "0 0 20px rgba(0,196,228,0.12)",
              }}
            >
              <Shield size={15} style={{ color: "hsl(191 90% 46%)" }} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-foreground">TideGuard</div>
              <div className="text-[10px] text-muted-foreground leading-none font-mono">
                SW Florida Gulf Coast · Karenia brevis Monitor
              </div>
            </div>
          </div>

          {/* Center — coordinates + status */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin size={11} className="text-muted-foreground" />
              <span className="text-mono text-[11px] text-muted-foreground">
                {CENTER_LAT}°N, {Math.abs(CENTER_LNG)}°W
              </span>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: risk.color + "14",
                border: `1px solid ${risk.color}30`,
              }}
            >
              {risk.pulse && (
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: risk.color, boxShadow: `0 0 8px ${risk.color}` }}
                />
              )}
              <span
                className="text-[11px] font-bold tracking-widest"
                style={{ color: risk.color }}
              >
                {risk.text}
              </span>
            </div>

            <div className="text-mono text-[11px] text-muted-foreground">
              {featureCount} <span className="text-muted-foreground/60">samples</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground">Last updated</span>
              <span className="text-mono text-[11px] text-foreground">{now}</span>
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "hsl(210 18% 55%)",
              }}
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [features, setFeatures] = useState<FWCFeature[]>([]);
  const [fwcLoading, setFwcLoading] = useState(true);
  const [fwcError, setFwcError] = useState(false);
  const [wind, setWind] = useState<WindData | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [newsSource, setNewsSource] = useState<"live" | "fallback" | null>(null);
  const [newsMessage, setNewsMessage] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/", "");
  const apiBase = "";

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    setFwcLoading(true);

    try {
      const [fwcData, windData] = await Promise.allSettled([
        fetchFWCData(),
        fetchWindData(CENTER_LAT, CENTER_LNG),
      ]);

      if (fwcData.status === "fulfilled") {
        setFeatures(fwcData.value.features || []);
        setFwcError(false);
      } else {
        setFwcError(true);
        setFeatures([]);
      }

      if (windData.status === "fulfilled") {
        setWind(windData.value);
      }

      setLastUpdated(new Date());
    } catch {
      setFwcError(true);
    } finally {
      setFwcLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadNews = useCallback(async () => {
    setArticlesLoading(true);
    try {
      const data = await fetchNewsArticles();
      setArticles(data.articles);
      setNewsSource(data.source);
      setNewsMessage(data.message);
    } catch {
      setArticles([]);
      setNewsSource("fallback");
      setNewsMessage("Unable to reach news service");
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    loadNews();
  }, [loadAll, loadNews]);

  const fwcLevel: AbundanceLevel = getHighestThreatLevel(features);

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: "#060c16" }}>
      {/* Map fills the left side */}
      <div className="flex-1 relative" style={{ marginRight: 380 }}>
        <TideMap features={features} wind={wind} loading={fwcLoading} />

        {/* Top bar sits over the map */}
        <TopBar
          fwcLevel={fwcLevel}
          featureCount={features.length}
          wind={wind}
          lastUpdated={lastUpdated}
          onRefresh={loadAll}
          refreshing={refreshing}
        />

        {/* FWC error banner */}
        {fwcError && !fwcLoading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[1001]"
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.25)",
                color: "#f59e0b",
              }}
            >
              <AlertTriangle size={12} />
              FWC API unavailable — showing cached data
            </div>
          </motion.div>
        )}
      </div>

      {/* Right sidebar */}
      <AnalysisSidebar
        articles={articles}
        articlesLoading={articlesLoading}
        newsSource={newsSource}
        newsMessage={newsMessage}
        wind={wind}
        fwcLevel={fwcLevel}
        dataTimestamp={lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
      />
    </div>
  );
}
