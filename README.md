# TideGuard

![TideGuard — EagleHacks 2026](banner.png)

Dual-threat coastal monitoring for Southwest Florida — real-time red tide blooms and Atlantic hurricane tracking, built for the people who have to make fast decisions on the ground.

**EagleHacks 2026**

Live deployment: https://tideguard-saddasads-projects.vercel.app

---

## The Problem

Southwest Florida has no single place to check what is actually happening on the coast. Red tide bloom data exists inside FWC's GIS portal but requires GIS literacy to read. Hurricane information is split across NHC advisories, county emergency management PDFs, and local news broadcasts. Evacuation zones and shelter locations live in separate documents that change with each season.

During an active event — a bloom that shifted overnight, a storm that changed track at 3 AM — the gap between knowing and not knowing can mean a closed restaurant, a missed evacuation, or a beach visit that sends someone to the emergency room.

TideGuard puts all of it on one screen.

---

## What It Does

TideGuard runs two dashboards. Both are fully usable on a phone.

### Red Tide Dashboard

The main view shows a live Leaflet map of Karenia brevis sample locations from the Florida Fish and Wildlife Conservation Commission, color-coded by bloom intensity: high (red), medium (amber), low (green), not present (blue). Every marker shows the sample date, county, and cell count in cells per liter.

Above the map, a threat header updates in real time: Critical Threat, Elevated Threat, Low Threat, or All Clear — derived from the peak bloom concentration in the dataset combined with the current wind vector. The wind panel shows direction, speed, and whether the wind is onshore (pushing airborne toxins toward populated beaches) or offshore (dispersing the bloom to sea).

The sidebar — or on mobile, a swipe-up drawer — contains a beach respiratory risk grid for Southwest Florida beaches, a dead fish cleanup priority index, a live news feed, and an AI chat window backed by IBM watsonx. The chat has live context injected: current bloom level, wind conditions, and recent articles are passed as context so the model can answer grounded, specific questions about today's conditions.

### Hurricane Dashboard

The second dashboard tracks active Atlantic storms via NOAA's National Hurricane Center feed. Each storm shows its current position, category, sustained wind speed, barometric pressure, and movement vector. Forecast track points extend forward in time with dashed lines; past track points show where the storm has been.

Overlay controls on the map let users toggle:

- **Live Radar** — animated Xweather tile overlay with a 2-hour loop and play/stop controls
- **Flood Zones** — hardcoded FEMA VE and AE zone polygons for SWFL barrier islands and coastal strips (no API call required)
- **Evacuation Zones** — Zone A, B, and C polygons for Lee, Collier, Charlotte, and Sarasota counties
- **Shelters** — ten emergency shelter locations with capacity and pet-friendly status

The sidebar for this dashboard includes active NOAA weather alerts, storm details, and the same AI chat pattern — IBM watsonx context-injected with current storm data, alerts, and hurricane news articles.

When no live storms are active, the dashboard loads Hurricane Milton (October 2024) as a demonstration dataset.

### Mobile

On screens under 768px, both dashboards switch to a full-screen map layout. A fixed bottom tab bar replaces the sidebar, with three tabs: Map, Intel, and Chat. The Intel tab opens a vaul swipe-up drawer with scrollable content. The Chat tab opens a full-screen overlay. The map fills 100 percent of the viewport. The navigation toggle between dashboards sits in the top-right corner as a compact icon button.

---

## Tech Stack

### Frontend

| | |
|---|---|
| Framework | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS 4, tw-animate-css |
| Component primitives | Radix UI (40+ components) |
| Maps | Leaflet 1.9, React-Leaflet 5 |
| Animations | Framer Motion 12 |
| Data fetching | TanStack React Query 5 |
| Routing | Wouter 3 |
| Bottom sheets | Vaul |
| Charts | Recharts 2 |

### Backend

| | |
|---|---|
| Runtime | Node.js 20, ESM |
| Framework | Express 5 |
| Logging | Pino 9, pino-http |
| Build | esbuild (custom build.mjs) |

### Deployment

| | |
|---|---|
| Platform | Vercel (frontend + serverless API functions) |
| CI | GitHub — auto-deploys on push to main |

---

## Data Sources

| Feature | Source | Auth |
|---|---|---|
| Red tide bloom samples | FWC GIS HAB for DEP Dashboard (MapServer) | None |
| Weather and wind | Open-Meteo API | None |
| Hurricane tracks | NOAA National Hurricane Center | None |
| Weather alerts | NOAA Weather API | None |
| Animated radar | Xweather / AerisWeather tile API | App ID + Secret |
| Hurricane news | NewsAPI v2 | API key |
| Flood zones | Hardcoded FEMA NFHL designations, SWFL | None |
| AI chat | IBM watsonx + ContentIQ | Deployment URL |

---

## Running Locally

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)

### 1. Clone

```bash
git clone https://github.com/darskkaa/redalage-.git
cd redalage-/Aesthetic-Vision
pnpm install
```

### 2. Configure the API server

Create `artifacts/api-server/.env`:

```env
PORT=3001

# Xweather animated radar (required for the radar layer)
# Get credentials at xweather.com
XWEATHER_CLIENT_ID=your_client_id
XWEATHER_CLIENT_SECRET=your_client_secret

# NewsAPI — required for hurricane news feed
NEWS_API_KEY=your_newsapi_key

# IBM watsonx — optional, insurance claims AI
IBM_WATSONX_API_KEY=
IBM_WATSONX_PROJECT_ID=
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### 3. Configure the frontend

Create `artifacts/tideguard/.env.local`:

```env
VITE_CONTENTIQ_DEPLOYMENT_URL=https://partners.contentiq.symplistic.ai/external/deploy/chat/index.html?chat_id=83e6c4e9-5428-474a-88f2-ca533af9eb4f
```

### 4. Add the Vite proxy

The frontend uses relative `/api/*` URLs. In development, Vite needs to forward those to the Express server. Open `artifacts/tideguard/vite.config.ts` and add a `proxy` block inside `server`:

```ts
server: {
  port,
  host: "0.0.0.0",
  proxy: {
    "/api": "http://localhost:3001",
  },
  // ...existing options
},
```

### 5. Start the API server

```bash
cd artifacts/api-server
pnpm dev
# Server starts on http://localhost:3001
```

### 6. Start the frontend

Open a second terminal:

```bash
cd artifacts/tideguard
pnpm dev
# Vite starts on http://localhost:3000 (or the next available port)
```

### 7. Open the app

Navigate to `http://localhost:3000` (or whichever port Vite prints).

The red tide dashboard loads at `/`. The hurricane dashboard is at `/hurricanes`.

---

## Optional Features

Most of the app works without any API keys. The following features require additional configuration:

| Feature | Required key | Behavior without it |
|---|---|---|
| Animated radar overlay | Xweather credentials | Layer toggle shows, tiles return 403 |
| Hurricane news feed | NewsAPI key | News feed unavailable |
| Insurance claims AI | IBM watsonx credentials | Rule-based risk estimate used instead |

---

## Project Structure

```
Aesthetic-Vision/artifacts/
├── tideguard/                        # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx               # Red tide dashboard
│   │   │   └── HurricaneDashboard.tsx      # Hurricane dashboard
│   │   ├── components/
│   │   │   ├── TideMap.tsx                 # Bloom sample map
│   │   │   ├── HurricaneMap.tsx            # Storm + radar + overlay map
│   │   │   ├── AnalysisSidebar.tsx         # Threat analysis + AI chat
│   │   │   ├── HurricaneSidebar.tsx        # Hurricane intel + AI chat
│   │   │   ├── WeatherWidget.tsx           # Current conditions card
│   │   │   └── MobileBottomNav.tsx         # Mobile tab bar (Map / Intel / Chat)
│   │   ├── lib/
│   │   │   ├── fwc-api.ts                  # FWC GIS fetch + abundance classification
│   │   │   ├── hurricane-api.ts            # NOAA NHC parsing + demo fallback
│   │   │   ├── wind-api.ts                 # Open-Meteo + onshore/offshore logic
│   │   │   ├── analysis.ts                 # Threat scoring
│   │   │   └── red-tide-knowledge-base.ts  # Red tide knowledge base + ML summary
│   │   └── App.tsx
│   └── vite.config.ts
└── api-server/                       # Express backend
    └── src/routes/
        ├── hurricane.ts              # NOAA NHC proxy
        ├── news.ts                   # Red tide news endpoint
        ├── hurricane-news.ts         # NewsAPI hurricane news
        ├── road-conditions.ts        # Xweather road weather proxy
        ├── watsonx-claims.ts         # IBM watsonx insurance claims
        └── flood-zones.ts            # Hardcoded FEMA flood zone data
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/news` | Red tide news articles |
| GET | `/api/hurricane-news` | Hurricane articles via NewsAPI |
| GET | `/api/hurricane/storms` | NOAA NHC active storms |
| GET | `/api/road-conditions` | Xweather road conditions (6 SWFL roads) |
| POST | `/api/watsonx-claims` | IBM watsonx insurance claim assessment |

---

## Built At

EagleHacks 2026
