import { useState } from "react";
import { Wind, AlertTriangle, MessageSquare, Maximize2, Minimize2, X } from "lucide-react";
import type { HurricaneStorm, HurricaneAlert } from "@/lib/hurricane-api";
import { getCategoryColor, getCategoryLabel, getThreatLevel } from "@/lib/hurricane-api";
import type { WindData } from "@/lib/wind-api";
import ContentIQWidget from "@/components/ContentIQWidget";

const HURRICANE_AGENT_ID = "27943894-9de9-4484-a930-0aa992d9dbf9";
const HURRICANE_AGENT_TOKEN = "49c827593630faf8d37b801d1de50eb58d0874f9e96fa8410d55840ebf06c12a";

function AlertBadge({ alert }: { alert: HurricaneAlert }) {
  const color =
    alert.event.includes("Warning") ? "#ef4444" :
    alert.event.includes("Watch") ? "#f59e0b" :
    "#60a5fa";
  return (
    <div
      className="rounded-xl p-2.5 mb-1.5"
      style={{ background: color + "10", border: `1px solid ${color}25` }}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle size={11} style={{ color, flexShrink: 0, marginTop: 1 }} />
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{alert.event}</div>
          <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
            {alert.areaDesc}
          </div>
        </div>
      </div>
    </div>
  );
}

function StormCard({ storm }: { storm: HurricaneStorm }) {
  const color = getCategoryColor(storm.category);
  const label = getCategoryLabel(storm);
  return (
    <div
      className="rounded-xl p-3 mb-2"
      style={{ background: color + "0e", border: `1px solid ${color}28` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="text-sm font-bold text-foreground">{storm.name}</span>
          {storm.isDemo && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}>
              DEMO
            </span>
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
  const [isFullscreen, setFullscreen] = useState(false);
  const threat = getThreatLevel(storms);

  const tabs = [
    { id: "intel" as const, label: "Intel Feed", icon: AlertTriangle },
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
                }}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
            <div className="flex-1" />
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider"
              style={dataSource === "live"
                ? { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }
                : { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}
            >
              <div className="w-1 h-1 rounded-full" style={{ background: dataSource === "live" ? "#22c55e" : "#f59e0b" }} />
              {dataSource === "live" ? "LIVE" : "DEMO"}
            </div>
            {activeTab === "chat" && (
              <button onClick={() => setFullscreen(!isFullscreen)}
                className="p-1 hover:bg-white/10 rounded transition-colors">
                {isFullscreen ? <Minimize2 size={14} className="text-muted-foreground" /> : <Maximize2 size={14} className="text-muted-foreground" />}
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 flex flex-col">

            {/* Intel tab */}
            {activeTab === "intel" && (
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
                  <div className="px-4 pb-3">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Active Warnings</div>
                    {alerts.map((a) => <AlertBadge key={a.id} alert={a} />)}
                  </div>
                )}

                {/* Threat level summary */}
                <div className="px-4 pb-3">
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

                {/* Footer */}
                <div className="px-4 py-2.5 flex items-center justify-between"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-[10px] text-muted-foreground font-mono">NHC · api.weather.gov · Open-Meteo</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground">{dataTimestamp}</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Chat tab */}
            {activeTab === "chat" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div
                  className="flex-shrink-0 flex items-center justify-between px-4 py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    StormGuard AI
                  </div>
                </div>
                <div className="flex-1 min-h-0 px-3 pb-3 pt-2">
                  <ContentIQWidget
                    agentId={HURRICANE_AGENT_ID}
                    token={HURRICANE_AGENT_TOKEN}
                    style={{ height: "100%", borderRadius: 12 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen overlay for AI Chat */}
      {isFullscreen && activeTab === "chat" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(7, 12, 22, 0.97)", display: "flex", flexDirection: "column" }}>
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              StormGuard AI — Fullscreen
            </span>
            <button onClick={() => setFullscreen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 min-h-0 p-4">
            <ContentIQWidget
              agentId={HURRICANE_AGENT_ID}
              token={HURRICANE_AGENT_TOKEN}
              style={{ height: "100%", borderRadius: 12 }}
            />
          </div>
        </div>
      )}
    </>
  );
}
