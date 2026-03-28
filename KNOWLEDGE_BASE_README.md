# Red Tide Knowledge Base for ContentIQ AI Agent

## Overview

The TideGuard app now includes a comprehensive knowledge base designed for integration with IBM watsonx ContentIQ AI agent. This enables users to ask detailed questions about red tide biology, impacts, research, and policy.

## Sources

### Articles (13 Total)

**SCCF (Sanibel-Captiva Conservation Foundation) — 2 articles:**
- sccf-1: Red Tide Biology & Health Impacts
- sccf-2: Human Activity & Bloom Intensification (Research Study)

**WUSF (USF Public Media) — 11 articles:**
- wusf-1 to wusf-11: Covering forecasting, policy, research, respiratory health, fisheries impacts, ocean warming, and monitoring

All articles dated **2026-03-28** (today)

## Access Points

### 1. Frontend News Feed (Sidebar)
- Shows first 3 articles in the Intel Feed
- Click any article to select it
- Context automatically injected into ContentIQ chat widget
- Full article content (not just summary) sent to AI

**File:** `src/components/AnalysisSidebar.tsx`

### 2. API Endpoint (`/api/news`)
- Returns all 13 articles with full content
- Used by Dashboard to populate news feed
- Each article includes: id, title, description, url, source, publishedAt, content

**File:** `artifacts/api-server/src/routes/news.ts`

### 3. Knowledge Base Export
- Pre-formatted for copy/paste into watsonx knowledge base
- Single compiled string with all articles + ML analysis report
- Available as `FULL_KNOWLEDGE_BASE` export

**File:** `src/lib/red-tide-knowledge-base.ts`

## Using the Knowledge Base

### For Developers
```typescript
import { KNOWLEDGE_ARTICLES, FULL_KNOWLEDGE_BASE, ML_ANALYSIS_REPORT } from '@/lib/red-tide-knowledge-base'

// Use individual articles
KNOWLEDGE_ARTICLES.forEach(article => {
  console.log(article.title, article.content)
})

// Or export the full compiled string for integration
const kb = FULL_KNOWLEDGE_BASE
```

### For AI Integration
Copy the `FULL_KNOWLEDGE_BASE` string directly into your watsonx knowledge base configuration. It includes:

1. **13 Article Entries** — Each formatted as:
   ```
   [ARTICLE: id]
   Title: ...
   Source: ...
   Date: ...
   URL: ...
   
   [Full article content]
   ```

2. **ML Predictive Analysis Report** — Includes:
   - Historical data (2007-2023, 139,926 samples)
   - Feature importance (latitude, longitude, day of year)
   - Spatial hotspots (top 5 bloom locations)
   - Temporal hotspots (months 8, 10, 11 are peak season)
   - Agent instructions for contextual analysis

## User Experience

When a user:
1. **Clicks an article** in the Intel Feed (right sidebar)
2. **ContentIQ widget receives context** including:
   - Article title, source, summary
   - Current FWC bloom level
   - Current wind direction/speed (onshore/offshore)
   - Geographic coordinates (Lat: 26.9436, Lng: -82.1539)

3. **Can ask questions** like:
   - "What are the health risks described in this article?"
   - "How does this link to the research on human impacts?"
   - "What should a restaurant do based on this report?"
   - "When is red tide season based on the data?"

The AI agent combines article content with live bloom/wind data to provide contextual, actionable insights.

## File Sizes

- `news.ts`: ~7.5 KB (API articles)
- `red-tide-knowledge-base.ts`: ~13 KB (articles + ML report)
- Total knowledge base: ~20 KB (compressed text)

## Updates

To add more articles:
1. Add entry to `KNOWLEDGE_ARTICLES` in `red-tide-knowledge-base.ts`
2. Add matching article to `CURATED_ARTICLES` in `api-server/src/routes/news.ts`
3. The `FULL_KNOWLEDGE_BASE` string regenerates automatically on export

No code changes needed — both exports are computed from the source arrays.
