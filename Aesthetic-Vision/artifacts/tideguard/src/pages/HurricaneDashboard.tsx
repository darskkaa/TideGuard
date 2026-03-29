import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Wind, RefreshCw, AlertTriangle, MapPin } from "lucide-react";
import HurricaneMap from "@/components/HurricaneMap";
import HurricaneSidebar from "@/components/HurricaneSidebar";
import WeatherWidget from "@/components/WeatherWidget";
import { fetchHurricaneData, getThreatLevel } from "@/lib/hurricane-api";
import type { HurricaneStorm, HurricaneAlert } from "@/lib/hurricane-api";
import { fetchWindData } from "@/lib/wind-api";
import type { WindData } from "@/lib/wind-api";

const CENTER_LAT = 25.5;
const CENTER_LNG = -87.5;

function TopBar({
  storms,
  wind,
  lastUpdated,
  onRefresh,
  refreshing,
  dataSource,
}: {
  storms: HurricaneStorm[];
  wind: WindData | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing: boolean;
  dataSource: "live" | "demo";
}) {
  const threat = getThreatLevel(storms);
  const now = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="absolute top-0 left-0 z-[1001] flex items-center gap-0"
      style={{ width: "calc(100% - 380px)" }}>
      <div className="w-full"
        style={{
          background: "rgba(6, 12, 22, 0.92)",
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
        <div className="flex items-center justify-between px-5 h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                boxShadow: "0 0 20px rgba(239,68,68,0.12)",
              }}>
              <Wind size={15} style={{ color: "#ef4444" }} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-foreground">StormGuard</div>
              <div className="text-[10px] text-muted-foreground leading-none font-mono">
                Gulf of Mexico · NHC Hurricane Tracker
              </div>
            </div>
          </div>

          {/* Center */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin size={11} className="text-muted-foreground" />
              <span className="text-mono text-[11px] text-muted-foreground">
                {CENTER_LAT}°N, {Math.abs(CENTER_LNG)}°W
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: threat.color + "14", border: `1px solid ${threat.color}30` }}>
              {threat.pulse && (
                <div className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: threat.color, boxShadow: `0 0 8px ${threat.color}` }} />
              )}
              <span className="text-[11px] font-bold tracking-widest" style={{ color: threat.color }}>
                {threat.text}
              </span>
            </div>

            <div className="text-mono text-[11px] text-muted-foreground">
              {storms.length} <span className="text-muted-foreground/60">
                {storms.length === 1 ? "storm" : "storms"}
              </span>
              {dataSource === "demo" && (
                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded font-semibold"
                  style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                  DEMO MODE
                </span>
              )}
            </div>
          </div>

          {/* Right */}
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

export default function HurricaneDashboard() {
  const [storms, setStorms] = useState<HurricaneStorm[]>([]);
  const [alerts, setAlerts] = useState<HurricaneAlert[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "demo">("demo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wind, setWind] = useState<WindData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    setError(false);

    try {
      const [hurricaneResult, windResult] = await Promise.allSettled([
        fetchHurricaneData(),
        fetchWindData(CENTER_LAT, CENTER_LNG),
      ]);

      if (hurricaneResult.status === "fulfilled") {
        setStorms(hurricaneResult.value.storms);
        setAlerts(hurricaneResult.value.alerts);
        setDataSource(hurricaneResult.value.source);
      } else {
        setError(true);
      }

      if (windResult.status === "fulfilled") {
        setWind(windResult.value);
      }

      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: "#060c16" }}>
      {/* Map */}
      <div className="flex-1 relative" style={{ marginRight: 380 }}>
        <HurricaneMap storms={storms} wind={wind} loading={loading} />

        <TopBar
          storms={storms}
          wind={wind}
          lastUpdated={lastUpdated}
          onRefresh={loadAll}
          refreshing={refreshing}
          dataSource={dataSource}
        />

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[1001]"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.25)",
                color: "#f59e0b",
              }}>
              <AlertTriangle size={12} />
              NHC API unavailable — showing demo storm data
            </div>
          </motion.div>
        )}

        <WeatherWidget lat={CENTER_LAT} lng={CENTER_LNG} />
      </div>

      {/* Sidebar */}
      <HurricaneSidebar
        storms={storms}
        alerts={alerts}
        wind={wind}
        dataSource={dataSource}
        dataTimestamp={lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
      />
    </div>
  );
}
