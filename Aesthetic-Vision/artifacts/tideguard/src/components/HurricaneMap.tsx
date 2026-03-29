import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  CircleMarker,
  Polyline,
  Polygon,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { HurricaneStorm } from "@/lib/hurricane-api";
import { getCategoryColor, getCategoryLabel } from "@/lib/hurricane-api";
import type { WindData } from "@/lib/wind-api";
import { Droplets, MapPin, Home, Layers } from "lucide-react";

const CENTER: [number, number] = [26.4, -82.0]; // SW Florida focus
const ZOOM = 8;

interface Props {
  storms: HurricaneStorm[];
  wind: WindData | null;
  loading: boolean;
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

// ── Evacuation Zones (simplified SW FL polygons) ──
const EVAC_ZONES: Array<{ zone: string; color: string; positions: [number, number][] }> = [
  {
    zone: "A",
    color: "#ef4444",
    positions: [
      [26.45, -82.18], [26.45, -81.87], [26.38, -81.87], [26.38, -81.95],
      [26.33, -81.95], [26.33, -82.10], [26.40, -82.18],
    ],
  },
  {
    zone: "A",
    color: "#ef4444",
    positions: [
      [26.65, -82.02], [26.65, -81.90], [26.58, -81.90], [26.58, -81.95],
      [26.55, -81.95], [26.55, -82.02],
    ],
  },
  {
    zone: "B",
    color: "#f97316",
    positions: [
      [26.50, -81.87], [26.50, -81.78], [26.42, -81.78], [26.42, -81.87],
    ],
  },
  {
    zone: "B",
    color: "#f97316",
    positions: [
      [26.70, -81.90], [26.70, -81.82], [26.62, -81.82], [26.62, -81.90],
    ],
  },
  {
    zone: "C",
    color: "#fbbf24",
    positions: [
      [26.55, -81.78], [26.55, -81.70], [26.47, -81.70], [26.47, -81.78],
    ],
  },
];

// ── Map Overlay Toggle Controls ──
function OverlayControls({
  showFlood,
  showEvac,
  showShelters,
  onToggleFlood,
  onToggleEvac,
  onToggleShelters,
}: {
  showFlood: boolean;
  showEvac: boolean;
  showShelters: boolean;
  onToggleFlood: () => void;
  onToggleEvac: () => void;
  onToggleShelters: () => void;
}) {
  const items = [
    { label: "Flood Zones", active: showFlood, onClick: onToggleFlood, color: "#3b82f6", icon: Droplets },
    { label: "Evacuation", active: showEvac, onClick: onToggleEvac, color: "#f97316", icon: MapPin },
    { label: "Shelters", active: showShelters, onClick: onToggleShelters, color: "#22c55e", icon: Home },
  ];

  return (
    <div className="absolute top-20 left-4 z-[1000]">
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
        {items.map(({ label, active, onClick, color, icon: Icon }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: active ? color + "18" : "rgba(255,255,255,0.03)",
              color: active ? color : "hsl(210 18% 55%)",
              border: active ? `1px solid ${color}35` : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-3 h-3 rounded-sm flex items-center justify-center"
              style={{
                background: active ? color : "transparent",
                border: active ? "none" : `1.5px solid hsl(210 18% 40%)`,
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
                Evacuation Zone {z.zone}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
                {z.zone === "A" ? "Mandatory evacuation for Cat 1+ hurricanes" :
                 z.zone === "B" ? "Mandatory evacuation for Cat 2+ hurricanes" :
                 "Mandatory evacuation for Cat 3+ hurricanes"}
              </div>
            </div>
          </Popup>
        </Polygon>
      ))}
    </>
  );
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
      <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-4" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
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

export default function HurricaneMap({ storms, wind: _wind, loading }: Props) {
  const [showFlood, setShowFlood] = useState(false);
  const [showEvac, setShowEvac] = useState(false);
  const [showShelters, setShowShelters] = useState(false);

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

        {/* FEMA Flood Zones WMS */}
        {showFlood && (
          <WMSTileLayer
            url="https://hazards.fema.gov/gis/nfhl/services/public/NFHL/MapServer/WMSServer"
            layers="28"
            format="image/png"
            transparent={true}
            opacity={0.45}
            attribution="FEMA NFHL"
          />
        )}

        {/* Evacuation Zone Polygons */}
        {showEvac && <EvacZonePolygons />}

        {/* Emergency Shelter Markers */}
        {showShelters && <ShelterMarkers />}

        <StormMarkers storms={storms} />
        <MapFlyTo storms={storms} />
      </MapContainer>

      <OverlayControls
        showFlood={showFlood}
        showEvac={showEvac}
        showShelters={showShelters}
        onToggleFlood={() => setShowFlood(!showFlood)}
        onToggleEvac={() => setShowEvac(!showEvac)}
        onToggleShelters={() => setShowShelters(!showShelters)}
      />
      <CategoryLegend />
      <LoadingOverlay show={loading} />
    </div>
  );
}
