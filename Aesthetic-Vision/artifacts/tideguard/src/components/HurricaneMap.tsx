import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { HurricaneStorm } from "@/lib/hurricane-api";
import { getCategoryColor, getCategoryLabel } from "@/lib/hurricane-api";
import type { WindData } from "@/lib/wind-api";

const CENTER: [number, number] = [25.5, -87.5]; // Gulf of Mexico center
const ZOOM = 6;

interface Props {
  storms: HurricaneStorm[];
  wind: WindData | null;
  loading: boolean;
}

function MapFlyTo({ storms }: { storms: HurricaneStorm[] }) {
  const map = useMap();
  useEffect(() => {
    if (storms.length > 0) {
      map.setView([storms[0].lat, storms[0].lng], 7, { animate: true });
    }
  }, [storms, map]);
  return null;
}

function StormMarkers({ storms }: { storms: HurricaneStorm[] }) {
  return (
    <>
      {storms.map((storm) => {
        const color = getCategoryColor(storm.category);
        const label = getCategoryLabel(storm);
        const radius = 8 + storm.category * 4;

        // Track polyline points
        const trackPositions: [number, number][] = storm.track.map((p) => [p.lat, p.lng]);

        return (
          <div key={storm.id}>
            {/* Historical track line */}
            {trackPositions.length > 1 && (
              <Polyline
                positions={trackPositions}
                pathOptions={{
                  color: color,
                  weight: 2,
                  opacity: 0.5,
                  dashArray: "4 6",
                }}
              />
            )}

            {/* Track waypoints */}
            {storm.track.map((pt, i) => {
              const ptColor = getCategoryColor(pt.category);
              const isCurrent = pt.time === "NOW";
              const isForecast = pt.time.startsWith("+");
              if (isCurrent) return null; // main marker covers this
              return (
                <CircleMarker
                  key={`${storm.id}-track-${i}`}
                  center={[pt.lat, pt.lng]}
                  radius={isForecast ? 5 : 4}
                  pathOptions={{
                    color: ptColor,
                    fillColor: ptColor,
                    fillOpacity: isForecast ? 0.4 : 0.65,
                    weight: 1,
                    dashArray: isForecast ? "3 3" : undefined,
                  }}
                >
                  <Popup>
                    <div style={popupStyle}>
                      <div style={{ color: ptColor, fontWeight: 700, fontSize: 12 }}>{pt.time}</div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>
                        {pt.intensity} mph · Cat {pt.category}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Current storm position — main marker */}
            <CircleMarker
              center={[storm.lat, storm.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 3,
              }}
            >
              <Popup>
                <div style={popupStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: color,
                        boxShadow: `0 0 12px ${color}`,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>
                      {storm.name}
                      {storm.isDemo && (
                        <span style={{ fontSize: 10, color: "#64748b", marginLeft: 6 }}>DEMO</span>
                      )}
                    </span>
                  </div>
                  <div style={{ color: "#94a3b8", marginBottom: 4, fontSize: 12 }}>{label}</div>
                  <div style={{ color: "#e2e8f0", fontSize: 12, marginBottom: 2 }}>
                    Winds: <strong style={{ color }}>{storm.intensity} mph</strong>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 2 }}>
                    Pressure: {storm.pressure} mb
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>
                    Movement: {storm.movement}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "hsl(191 90% 46%)" }}>
                    {storm.lat.toFixed(2)}° N, {Math.abs(storm.lng).toFixed(2)}° W
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </div>
        );
      })}
    </>
  );
}

const popupStyle: React.CSSProperties = {
  background: "hsl(216 32% 8%)",
  border: "1px solid hsl(213 35% 14%)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "hsl(210 30% 92%)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  minWidth: 200,
};

function CategoryLegend() {
  const cats = [
    { label: "Cat 5", color: "#dc2626" },
    { label: "Cat 4", color: "#ef4444" },
    { label: "Cat 3", color: "#f97316" },
    { label: "Cat 2", color: "#fbbf24" },
    { label: "Cat 1", color: "#fde68a" },
    { label: "TS/TD", color: "#60a5fa" },
  ];
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
      <div
        className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-4"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
      >
        {cats.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div
              className="rounded-full"
              style={{ width: 8, height: 8, background: c.color, boxShadow: `0 0 8px ${c.color}88` }}
            />
            <span className="text-[11px] text-muted-foreground font-medium">{c.label}</span>
          </div>
        ))}
        <div className="w-px h-3 bg-border" />
        <span className="text-[11px] text-muted-foreground font-mono tracking-wide">NHC · NOAA</span>
      </div>
    </div>
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
        <span className="text-sm text-muted-foreground">Fetching NHC storm data...</span>
      </div>
    </div>
  );
}

export default function HurricaneMap({ storms, wind: _wind, loading }: Props) {
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
        <StormMarkers storms={storms} />
        <MapFlyTo storms={storms} />
      </MapContainer>

      <CategoryLegend />
      <LoadingOverlay show={loading} />
    </div>
  );
}
