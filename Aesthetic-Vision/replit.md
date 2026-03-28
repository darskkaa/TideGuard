# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, routes at /api)
│   └── tideguard/          # TideGuard React + Vite frontend (port 23162, path /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── .env.example            # Environment variable template
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TideGuard App

**TideGuard** is an AI-powered Red Tide mapping and business risk dashboard for Southwest Florida Gulf Coast beachfront businesses.

### Features
- Full-screen interactive Leaflet map (CARTO Dark Matter tiles)
- Live FWC HAB data — Karenia brevis bloom monitoring with color-coded markers
- Real-time wind data from Open-Meteo API
- wxO / Symplistic ContentIQ AI analysis sidebar
- NewsAPI live intel feed (mock data fallback)
- ElevenLabs TTS audio briefing
- Business risk recommendations based on bloom level + wind direction

### Map Center
- Lat: 26.9436, Lng: -82.1539 (SW Florida Gulf Coast midpoint)
- Zoom: 9 (shows Sarasota to Fort Myers)

### API Routes
- `GET /api/news` — NewsAPI proxy (mock fallback when key not set)
- `POST /api/tts` — ElevenLabs TTS proxy
- `GET /api/healthz` — Health check

### Environment Variables
See `.env.example` for required variables:
- `NEWS_API_KEY` — NewsAPI.org
- `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` — Text-to-speech
- `SYMPLISTIC_USERNAME` + `SYMPLISTIC_PASSWORD` — IBM watsonx

### Frontend Files
- `src/lib/fwc-api.ts` — FWC GeoJSON fetching + abundance parsing
- `src/lib/wind-api.ts` — Open-Meteo wind data
- `src/lib/news-api.ts` — News API client
- `src/lib/analysis.ts` — AI threat analysis logic
- `src/components/TideMap.tsx` — Leaflet map with markers + wind compass
- `src/components/AnalysisSidebar.tsx` — Right panel with news + ContentIQ analysis
- `src/pages/Dashboard.tsx` — Main layout orchestrator

## API Server

Express 5 API server. Routes live in `src/routes/`.

- `src/routes/health.ts` — GET /api/healthz
- `src/routes/news.ts` — GET /api/news (NewsAPI proxy)
- `src/routes/tts.ts` — POST /api/tts (ElevenLabs TTS proxy)
- Depends on: `@workspace/db`, `@workspace/api-zod`
