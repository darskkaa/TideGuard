import { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Polygon,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

function MapResizer({ isMobile }: { isMobile: boolean }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map, isMobile]);
  return null;
}
import type { HurricaneStorm } from "@/lib/hurricane-api";
import { getCategoryColor, getCategoryLabel } from "@/lib/hurricane-api";
import type { WindData } from "@/lib/wind-api";
import { Droplets, MapPin, Home, Layers, CloudRain } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const CENTER: [number, number] = [26.4, -82.0]; // SW Florida focus
const ZOOM = 8;

interface Props {
  storms: HurricaneStorm[];
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

// ── Shelter Data (SW Florida) ──
const SHELTERS = [
  { name: "Germain Arena", address: "11000 Everblades Pkwy, Estero FL", lat: 26.4383, lng: -81.7506, capacity: 7500, petFriendly: true },
  { name: "Hertz Arena (Suncoast Arena)", address: "11000 Everblades Pkwy, Estero FL", lat: 26.4390, lng: -81.7510, capacity: 8000, petFriendly: true },
  { name: "South Fort Myers High School", address: "14020 Plantation Rd, Fort Myers FL", lat: 26.5450, lng: -81.8690, capacity: 2000, petFriendly: false },
  { name: "Island Coast High School", address: "2125 De Navarra Pkwy, Cape Coral FL", lat: 26.6102, lng: -81.9950, capacity: 1800, petFriendly: false },
  { name: "North Fort Myers High School", address: "5000 Orange Grove Blvd, North Fort Myers FL", lat: 26.7160, lng: -81.8530, capacity: 2200, petFriendly: true },
  { name: "Palmetto Ridge High School", address: "1655 Victory Ln, Naples FL", lat: 26.2780, lng: -81.7290, capacity: 1500, petFriendly: false },
  { name: "Golden Gate High School", address: "2925 Titan Way, Naples FL", lat: 26.1770, lng: -81.6960, capacity: 1800, petFriendly: true },
  { name: "Barron Collier High School", address: "5600 Cougar Dr, Naples FL", lat: 26.2350, lng: -81.7590, capacity: 2000, petFriendly: false },
  { name: "Estero Recreation Center", address: "9200 Corkscrew Palms Blvd, Estero FL", lat: 26.4310, lng: -81.8070, capacity: 800, petFriendly: true },
  { name: "Charlotte High School", address: "1250 Cooper St, Punta Gorda FL", lat: 26.9310, lng: -82.0430, capacity: 1500, petFriendly: false },
];

// Custom shelter icon
const shelterIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:6px;background:rgba(34,197,94,0.9);border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5)">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// ── Evacuation Zones — SW Florida (Lee, Collier, Charlotte, Sarasota counties) ──
const EVAC_ZONES: Array<{ zone: string; label: string; color: string; positions: [number, number][] }> = [
  // ── ZONE A — immediate coastal / barrier islands ──
  // Lee: Fort Myers Beach / Estero Island
  { zone: "A", label: "Lee Co — Fort Myers Beach", color: "#ef4444",
    positions: [[26.507,-81.977],[26.507,-81.930],[26.364,-81.928],[26.364,-81.962]] },
  // Lee: Cape Coral SW waterfront & Pine Island Sound
  { zone: "A", label: "Lee Co — Cape Coral coastal", color: "#ef4444",
    positions: [[26.668,-82.095],[26.668,-82.000],[26.535,-81.998],[26.490,-82.015],[26.490,-82.068],[26.560,-82.092]] },
  // Lee: Sanibel / Captiva
  { zone: "A", label: "Lee Co — Sanibel / Captiva", color: "#ef4444",
    positions: [[26.537,-82.120],[26.537,-81.980],[26.433,-81.978],[26.433,-82.102]] },
  // Collier: Naples coastal strip
  { zone: "A", label: "Collier Co — Naples coast", color: "#ef4444",
    positions: [[26.195,-81.825],[26.195,-81.785],[26.075,-81.775],[26.055,-81.800],[26.055,-81.828]] },
  // Collier: Marco Island
  { zone: "A", label: "Collier Co — Marco Island", color: "#ef4444",
    positions: [[25.978,-81.738],[25.978,-81.635],[25.902,-81.635],[25.902,-81.722]] },
  // Charlotte: Boca Grande / Gasparilla Island
  { zone: "A", label: "Charlotte Co — Boca Grande", color: "#ef4444",
    positions: [[26.775,-82.375],[26.775,-82.320],[26.678,-82.318],[26.678,-82.368]] },
  // Charlotte: Englewood / Manasota Key
  { zone: "A", label: "Charlotte Co — Englewood coast", color: "#ef4444",
    positions: [[26.998,-82.392],[26.998,-82.348],[26.858,-82.340],[26.858,-82.385]] },
  // Charlotte: Punta Gorda waterfront
  { zone: "A", label: "Charlotte Co — Punta Gorda waterfront", color: "#ef4444",
    positions: [[26.960,-82.090],[26.960,-82.005],[26.900,-82.003],[26.900,-82.080]] },
  // Sarasota: Siesta Key / barrier islands
  { zone: "A", label: "Sarasota Co — Siesta Key", color: "#ef4444",
    positions: [[27.298,-82.570],[27.298,-82.532],[27.178,-82.515],[27.178,-82.550]] },
  // Sarasota: Venice Island / Nokomis Beach
  { zone: "A", label: "Sarasota Co — Venice coast", color: "#ef4444",
    positions: [[27.122,-82.465],[27.122,-82.430],[27.002,-82.420],[27.002,-82.455]] },

  // ── ZONE B — near-coastal, low elevation ──
  // Lee County Zone B
  { zone: "B", label: "Lee Co — Zone B", color: "#f97316",
    positions: [[26.720,-82.110],[26.720,-81.878],[26.492,-81.875],[26.492,-82.012],[26.610,-82.112]] },
  // Collier County Zone B
  { zone: "B", label: "Collier Co — Zone B", color: "#f97316",
    positions: [[26.375,-81.862],[26.375,-81.722],[25.902,-81.712],[25.902,-81.842]] },
  // Charlotte County Zone B
  { zone: "B", label: "Charlotte Co — Zone B", color: "#f97316",
    positions: [[27.022,-82.220],[27.022,-81.988],[26.872,-81.985],[26.872,-82.202]] },
  // Sarasota County Zone B
  { zone: "B", label: "Sarasota Co — Zone B", color: "#f97316",
    positions: [[27.395,-82.645],[27.395,-82.445],[27.030,-82.408],[27.030,-82.612]] },

  // ── ZONE C — moderate risk inland ──
  // Lee County Zone C
  { zone: "C", label: "Lee Co — Zone C", color: "#fbbf24",
    positions: [[26.825,-82.058],[26.825,-81.825],[26.545,-81.822],[26.545,-82.015]] },
  // Collier County Zone C
  { zone: "C", label: "Collier Co — Zone C", color: "#fbbf24",
    positions: [[26.385,-81.908],[26.385,-81.705],[25.995,-81.700],[25.995,-81.895]] },
  // Charlotte / South Sarasota Zone C
  { zone: "C", label: "Charlotte/Sarasota — Zone C", color: "#fbbf24",
    positions: [[27.155,-82.265],[27.155,-81.988],[26.975,-81.985],[26.975,-82.248]] },
];

// ── Map Overlay Toggle Controls ──
function OverlayControls({
  showFlood,
  showRadar,
  showEvac,
  showShelters,
  isPlaying,
  frameLabel,
  onToggleFlood,
  onToggleRadar,
  onTogglePlay,
  onToggleEvac,
  onToggleShelters,
}: {
  showFlood: boolean;
  showRadar: boolean;
  showEvac: boolean;
  showShelters: boolean;
  isPlaying: boolean;
  frameLabel: string;
  onToggleFlood: () => void;
  onToggleRadar: () => void;
  onTogglePlay: () => void;
  onToggleEvac: () => void;
  onToggleShelters: () => void;
}) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const anyActive = showFlood || showRadar || showEvac || showShelters;

  const items = [
    { label: "Live Radar", active: showRadar, onClick: onToggleRadar, color: "#60a5fa", icon: CloudRain },
    { label: "Flood Zones", active: showFlood, onClick: onToggleFlood, color: "#3b82f6", icon: Droplets },
    { label: "Evacuation", active: showEvac, onClick: onToggleEvac, color: "#f97316", icon: MapPin },
    { label: "Shelters", active: showShelters, onClick: onToggleShelters, color: "#22c55e", icon: Home },
  ];

  const itemsList = (
    <>
      {items.map(({ label, active, onClick, color, icon: Icon }) => (
        <button
          key={label}
          onClick={onClick}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
          style={{
            background: active ? color + "18" : "rgba(255,255,255,0.03)",
            color: active ? color : "hsl(210 18% 55%)",
            border: active ? `1px solid ${color}35` : "1px solid rgba(255,255,255,0.06)",
            minHeight: isMobile ? 44 : undefined,
          }}
        >
          <div
            className="w-3 h-3 rounded-sm flex items-center justify-center"
            style={{
              background: active ? color : "transparent",
              border: active ? "none" : `1.5px solid hsl(210 18% 60%)`,
            }}
          >
            {active && (
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <Icon size={11} />
          {label}
        </button>
      ))}
      {showRadar && (
        <div className="flex items-center gap-2 px-2 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={onTogglePlay}
            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: isPlaying ? "rgba(96,165,250,0.2)" : "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)" }}
          >
            {isPlaying
              ? <div style={{ width: 6, height: 6, background: "#60a5fa", borderRadius: 1 }} />
              : <svg width="8" height="8" viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9" fill="#60a5fa" /></svg>
            }
          </button>
          <span className="text-[10px] font-mono font-bold" style={{ color: "#60a5fa", minWidth: 28 }}>{frameLabel}</span>
          {!isPlaying && <span className="text-[9px] text-muted-foreground">2hr loop</span>}
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <div className="absolute top-16 right-3 z-[1000]">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-11 h-11 rounded-xl glass-panel flex items-center justify-center relative"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
        >
          <Layers size={16} className="text-muted-foreground" />
          {anyActive && (
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>
        {mobileOpen && (
          <div className="mt-2 glass-panel rounded-xl p-2 space-y-1.5" style={{ minWidth: 150, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
            {itemsList}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute top-16 left-4 z-[1000]">
      <div
        className="glass-panel rounded-xl p-2 space-y-1.5"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)", minWidth: 140 }}
      >
        <div className="flex items-center gap-1.5 px-2 py-0.5">
          <Layers size={10} className="text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
            Map Layers
          </span>
        </div>
        {itemsList}
      </div>
    </div>
  );
}

// ── Shelter Markers ──
function ShelterMarkers() {
  return (
    <>
      {SHELTERS.map((s) => (
        <Marker key={s.name} position={[s.lat, s.lng]} icon={shelterIcon}>
          <Popup>
            <div style={popupStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>Emergency Shelter</span>
              </div>
              <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{s.name}</div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 2 }}>{s.address}</div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 2 }}>Capacity: ~{s.capacity.toLocaleString()}</div>
              <div style={{
                fontSize: 10, fontWeight: 600, marginTop: 6,
                color: s.petFriendly ? "#22c55e" : "#f59e0b",
              }}>
                {s.petFriendly ? "PET FRIENDLY" : "NO PETS"}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// ── Evacuation Zone Polygons ──
function EvacZonePolygons() {
  return (
    <>
      {EVAC_ZONES.map((z, i) => (
        <Polygon
          key={`evac-${i}`}
          positions={z.positions}
          pathOptions={{
            color: z.color,
            fillColor: z.color,
            fillOpacity: 0.18,
            weight: 2,
            opacity: 0.6,
            dashArray: "4 4",
          }}
        >
          <Popup>
            <div style={popupStyle}>
              <div style={{ fontWeight: 700, fontSize: 13, color: z.color }}>
                Zone {z.zone} — {z.label}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
                {z.zone === "A" ? "Evacuate for any hurricane threat. Highest surge risk." :
                 z.zone === "B" ? "Evacuate for Cat 2+ hurricanes." :
                 "Evacuate for Cat 3+ hurricanes."}
              </div>
            </div>
          </Popup>
        </Polygon>
      ))}
    </>
  );
}

// ── Hardcoded SWFL FEMA Flood Zones (near-shore, no API) ──
const STATIC_FLOOD_ZONES: Array<{
  zone: string; label: string; color: string; positions: [number, number][];
}> = [
  { zone: "VE", label: "Fort Myers Beach", color: "#dc2626",
    positions: [[26.507,-81.977],[26.507,-81.930],[26.364,-81.928],[26.364,-81.962]] },
  { zone: "VE", label: "Sanibel Island", color: "#dc2626",
    positions: [[26.537,-82.120],[26.537,-81.980],[26.433,-81.978],[26.433,-82.102]] },
  { zone: "VE", label: "Boca Grande / Gasparilla Is.", color: "#dc2626",
    positions: [[26.775,-82.375],[26.775,-82.320],[26.678,-82.318],[26.678,-82.368]] },
  { zone: "AE", label: "Cape Coral Waterfront", color: "#ef4444",
    positions: [[26.668,-82.095],[26.668,-82.000],[26.535,-81.998],[26.490,-82.015],[26.490,-82.068],[26.560,-82.092]] },
  { zone: "AE", label: "Naples Coast", color: "#ef4444",
    positions: [[26.195,-81.825],[26.195,-81.785],[26.075,-81.775],[26.055,-81.800],[26.055,-81.828]] },
  { zone: "AE", label: "Marco Island", color: "#ef4444",
    positions: [[25.978,-81.738],[25.978,-81.635],[25.902,-81.635],[25.902,-81.722]] },
  { zone: "AE", label: "Punta Gorda / Charlotte Harbor", color: "#ef4444",
    positions: [[26.960,-82.090],[26.960,-82.005],[26.900,-82.003],[26.900,-82.080]] },
];

function StaticFloodZoneLayer() {
  return (
    <>
      {STATIC_FLOOD_ZONES.map((z, i) => (
        <Polygon
          key={`flood-${i}`}
          positions={z.positions}
          pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.20, weight: 1.5, opacity: 0.65, dashArray: "3 5" }}
        >
          <Popup>
            <div style={popupStyle}>
              <div style={{ fontWeight: 700, fontSize: 13, color: z.color }}>
                FEMA Zone {z.zone} — {z.label}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
                {z.zone === "VE"
                  ? "Coastal high hazard — wave action + storm surge. Highest flood risk."
                  : "Special flood hazard area — 1% annual flood risk. Insurance typically required."}
              </div>
            </div>
          </Popup>
        </Polygon>
      ))}
    </>
  );
}

// ── RainViewer Radar Tile Layer (keyless) ──
const RADAR_FRAMES = ["-120min", "-90min", "-60min", "-30min", "current"] as const;
const RADAR_STEPS_BACK = [12, 9, 6, 3, 0];

function useRainViewerFrames(enabled: boolean) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((d: { host: string; radar: { past: { path: string }[] } }) => {
        if (cancelled) return;
        const past = d.radar.past;
        setUrls(RADAR_STEPS_BACK.map((back) => {
          const frame = past[Math.max(0, past.length - 1 - back)];
          return `${d.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
        }));
      })
      .catch(() => { if (!cancelled) setUrls([]); });
    return () => { cancelled = true; };
  }, [enabled]);
  return urls;
}
const FRAME_LABELS = ["-2h", "-90m", "-60m", "-30m", "LIVE"] as const;


function StormMarkers({ storms }: { storms: HurricaneStorm[] }) {
  return (
    <>
      {storms.map((storm) => {
        const color = getCategoryColor(storm.category);
        const label = getCategoryLabel(storm);
        const radius = 8 + storm.category * 4;
        const trackPositions: [number, number][] = storm.track.map((p) => [p.lat, p.lng]);

        return (
          <div key={storm.id}>
            {trackPositions.length > 1 && (
              <Polyline
                positions={trackPositions}
                pathOptions={{ color, weight: 2, opacity: 0.5, dashArray: "4 6" }}
              />
            )}
            {storm.track.map((pt, i) => {
              const ptColor = getCategoryColor(pt.category);
              const isCurrent = pt.time === "NOW";
              const isForecast = pt.time.startsWith("+");
              if (isCurrent) return null;
              return (
                <CircleMarker
                  key={`${storm.id}-track-${i}`}
                  center={[pt.lat, pt.lng]}
                  radius={isForecast ? 5 : 4}
                  pathOptions={{
                    color: ptColor, fillColor: ptColor,
                    fillOpacity: isForecast ? 0.4 : 0.65,
                    weight: 1, dashArray: isForecast ? "3 3" : undefined,
                  }}
                >
                  <Popup>
                    <div style={popupStyle}>
                      <div style={{ color: ptColor, fontWeight: 700, fontSize: 12 }}>{pt.time}</div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>{pt.intensity} mph · Cat {pt.category}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
            <CircleMarker
              center={[storm.lat, storm.lng]}
              radius={radius}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 3 }}
            >
              <Popup>
                <div style={popupStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, boxShadow: `0 0 12px ${color}`, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>
                      {storm.name}
                      {storm.isDemo && <span style={{ fontSize: 10, color: "#64748b", marginLeft: 6 }}>DEMO</span>}
                    </span>
                  </div>
                  <div style={{ color: "#94a3b8", marginBottom: 4, fontSize: 12 }}>{label}</div>
                  <div style={{ color: "#e2e8f0", fontSize: 12, marginBottom: 2 }}>Winds: <strong style={{ color }}>{storm.intensity} mph</strong></div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 2 }}>Pressure: {storm.pressure} mb</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>Movement: {storm.movement}</div>
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

function CategoryLegend({ isMobile }: { isMobile: boolean }) {
  const cats = [
    { label: "Cat 5", color: "#dc2626" },
    { label: "Cat 4", color: "#ef4444" },
    { label: "Cat 3", color: "#f97316" },
    { label: "Cat 2", color: "#fbbf24" },
    { label: "Cat 1", color: "#fde68a" },
    { label: "TS/TD", color: "#60a5fa" },
  ];
  return (
    <div className={`absolute ${isMobile ? "bottom-20" : "bottom-8"} left-1/2 -translate-x-1/2 z-[1000] pointer-events-none ${isMobile ? "max-w-[calc(100vw-2rem)]" : ""}`}>
      <div className={`glass-panel rounded-xl px-4 py-2.5 flex items-center gap-4 ${isMobile ? "overflow-x-auto whitespace-nowrap" : ""}`} style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
        {cats.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className="rounded-full" style={{ width: 8, height: 8, background: c.color, boxShadow: `0 0 8px ${c.color}88` }} />
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

export default function HurricaneMap({ storms, wind: _wind, loading, onCenterChange }: Props) {
  const isMobile = useIsMobile();
  const [showFlood, setShowFlood] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showEvac, setShowEvac] = useState(false);
  const [showShelters, setShowShelters] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(RADAR_FRAMES.length - 1);
  const radarUrls = useRainViewerFrames(showRadar);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setFrameIndex((i) => (i + 1) % RADAR_FRAMES.length);
      }, 1800);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      setFrameIndex(RADAR_FRAMES.length - 1);
    }
    return () => { if (playTimerRef.current) clearInterval(playTimerRef.current); };
  }, [isPlaying]);

  useEffect(() => {
    if (!showRadar) { setIsPlaying(false); setFrameIndex(RADAR_FRAMES.length - 1); }
  }, [showRadar]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        style={{ width: "100%", height: "100%", background: "#060d17" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
          maxZoom={16}
        />
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
          zIndex={150}
        />

        {showRadar && radarUrls.map((url, i) => (
          <TileLayer
            key={url}
            url={url}
            attribution='Radar &copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
            maxNativeZoom={7}
            opacity={i === frameIndex ? 0.72 : 0}
            zIndex={i === frameIndex ? 201 : 200}
          />
        ))}
        {showFlood && <StaticFloodZoneLayer />}
        {showEvac && <EvacZonePolygons />}
        {showShelters && <ShelterMarkers />}

        <StormMarkers storms={storms} />
        <MapCenterTracker onCenterChange={onCenterChange} />
        <MapResizer isMobile={isMobile} />
      </MapContainer>

      <OverlayControls
        showFlood={showFlood}
        showRadar={showRadar}
        showEvac={showEvac}
        showShelters={showShelters}
        isPlaying={isPlaying}
        frameLabel={FRAME_LABELS[frameIndex]}
        onToggleFlood={() => setShowFlood(!showFlood)}
        onToggleRadar={() => setShowRadar(!showRadar)}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onToggleEvac={() => setShowEvac(!showEvac)}
        onToggleShelters={() => setShowShelters(!showShelters)}
      />
      <CategoryLegend isMobile={isMobile} />
      <LoadingOverlay show={loading} />
    </div>
  );
}
