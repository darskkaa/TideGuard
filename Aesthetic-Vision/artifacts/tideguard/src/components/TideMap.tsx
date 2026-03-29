import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { FWCFeature } from "@/lib/fwc-api";
import { getAbundanceLevel, getAbundanceColor, getAbundanceLabel } from "@/lib/fwc-api";
import type { WindData } from "@/lib/wind-api";

const CENTER: [number, number] = [26.9436, -82.1539];
const ZOOM = 9;

interface Props {
  features: FWCFeature[];
  wind: WindData | null;
  loading: boolean;
  onCenterChange?: (lat: number, lng: number) => void;
}

function MapCenterTracker({ onCenterChange }: { onCenterChange?: (lat: number, lng: number) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useMapEvents({
    moveend(e) {
      if (!onCenterChange) return;
      const c = e.target.getCenter();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onCenterChange(c.lat, c.lng), 1200);
    },
  });
  return null;
}

function WindCompass({ wind }: { wind: WindData | null }) {
  if (!wind) return null;
  return (
    <div className="absolute bottom-8 left-6 z-[1000] pointer-events-none">
      <div
        className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2"
        style={{ width: 140, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
      >
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-full h-full opacity-30">
            <circle cx="32" cy="32" r="30" fill="none" stroke="hsl(191 90% 46%)" strokeWidth="0.5" />
            <circle cx="32" cy="32" r="20" fill="none" stroke="hsl(191 90% 46%)" strokeWidth="0.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 32 + 20 * Math.sin(rad);
              const y1 = 32 - 20 * Math.cos(rad);
              const x2 = 32 + 30 * Math.sin(rad);
              const y2 = 32 - 30 * Math.cos(rad);
              return (
                <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsl(191 90% 46%)" strokeWidth="0.5" />
              );
            })}
            <text x="32" y="6" textAnchor="middle" fill="hsl(210 30% 70%)" fontSize="5" fontFamily="JetBrains Mono">N</text>
            <text x="58" y="34" textAnchor="middle" fill="hsl(210 30% 70%)" fontSize="5" fontFamily="JetBrains Mono">E</text>
            <text x="32" y="60" textAnchor="middle" fill="hsl(210 30% 70%)" fontSize="5" fontFamily="JetBrains Mono">S</text>
            <text x="6" y="34" textAnchor="middle" fill="hsl(210 30% 70%)" fontSize="5" fontFamily="JetBrains Mono">W</text>
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${wind.direction}deg)` }}
          >
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <polygon
                points="32,8 36,40 32,36 28,40"
                fill="hsl(191 90% 46%)"
                opacity="0.9"
              />
              <polygon
                points="32,56 36,24 32,28 28,24"
                fill="hsl(213 35% 30%)"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <div className="text-mono text-xs font-medium text-primary" style={{ letterSpacing: "0.05em" }}>
            {wind.directionLabel}
          </div>
          <div className="text-mono text-[11px] text-muted-foreground mt-0.5">
            {wind.speed} <span className="text-[9px]">km/h</span>
          </div>
          {wind.isOnshore && (
            <div className="mt-1 text-[9px] font-medium text-destructive uppercase tracking-widest">
              ONSHORE
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MapLegend() {
  const levels = [
    { label: "High Bloom", color: "#ef4444" },
    { label: "Medium", color: "#f59e0b" },
    { label: "Low", color: "#22c55e" },
    { label: "Not Present", color: "#3b82f6" },
  ];
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
      <div
        className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-4"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
      >
        {levels.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div
              className="rounded-full"
              style={{ width: 8, height: 8, background: l.color, boxShadow: `0 0 8px ${l.color}88` }}
            />
            <span className="text-[11px] text-muted-foreground font-medium">{l.label}</span>
          </div>
        ))}
        <div className="w-px h-3 bg-border" />
        <span className="text-[11px] text-muted-foreground font-mono tracking-wide">FWC · LIVE</span>
      </div>
    </div>
  );
}

function FWCMarkers({ features }: { features: FWCFeature[] }) {
  return (
    <>
      {features.map((f, i) => {
        const [lng, lat] = f.geometry.coordinates;
        const level = getAbundanceLevel(f.properties);
        const color = getAbundanceColor(level);
        const radius = level === "high" ? 10 : level === "medium" ? 7 : 5;
        const weight = level === "high" ? 2 : 1;

        return (
          <CircleMarker
            key={i}
            center={[lat, lng]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: level === "high" ? 0.85 : level === "medium" ? 0.7 : 0.6,
              weight,
            }}
          >
            <Popup>
              <div
                style={{
                  background: "hsl(216 32% 8%)",
                  border: "1px solid hsl(213 35% 14%)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "hsl(210 30% 92%)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  minWidth: 200,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: color,
                      boxShadow: `0 0 8px ${color}`,
                    }}
                  />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {getAbundanceLabel(level)}
                  </span>
                </div>
                {f.properties.County && (
                  <div style={{ color: "hsl(210 18% 55%)", marginBottom: 4 }}>
                    {f.properties.County} County
                  </div>
                )}
                {f.properties.Sample_Date && (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "hsl(191 90% 46%)", marginBottom: 4 }}>
                    {f.properties.Sample_Date}
                  </div>
                )}
                {f.properties.Count_ !== undefined && (
                  <div style={{ color: "hsl(210 18% 55%)", fontSize: 11 }}>
                    Count: {Number(f.properties.Count_).toLocaleString()} cells/L
                  </div>
                )}
                <div style={{ marginTop: 8, fontSize: 10, color: "hsl(210 18% 40%)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {lat.toFixed(4)}° N, {Math.abs(lng).toFixed(4)}° W
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
      <div className="glass-panel rounded-2xl px-6 py-4 flex items-center gap-3">
        <div className="flex gap-1">
          <div className="thinking-dot w-2 h-2 rounded-full bg-primary" />
          <div className="thinking-dot w-2 h-2 rounded-full bg-primary" />
          <div className="thinking-dot w-2 h-2 rounded-full bg-primary" />
        </div>
        <span className="text-sm text-muted-foreground">Fetching FWC bloom data...</span>
      </div>
    </div>
  );
}

export default function TideMap({ features, wind, loading, onCenterChange }: Props) {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        style={{ width: "100%", height: "100%", background: "#060d17" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <FWCMarkers features={features} />
        <MapCenterTracker onCenterChange={onCenterChange} />
      </MapContainer>

      <WindCompass wind={wind} />
      <MapLegend />
      <LoadingOverlay show={loading} />
    </div>
  );
}
