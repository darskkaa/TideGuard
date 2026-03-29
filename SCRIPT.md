# TideGuard — Demo Script
## EagleHacks 2026 | 2 Minutes

---

### SETUP BEFORE YOU WALK UP
- Site open on **Red Tide dashboard** — ALL CLEAR showing, 167 samples, 08:57 AM timestamp visible
- Weather widget visible — 70°F, 87% humidity, 23 mph wind
- Sidebar on **AI Chat tab**, red tide agent loaded
- Hurricane dashboard ready to switch to — have **Florida insurance question** response ready to show
- Phone in pocket for mobile moment

---

## THE SCRIPT

---

**[0:00–0:15] HOOK**

"Southwest Florida gets hit twice. Red tide — Karenia brevis, a toxic algal bloom that kills fish, closes beaches, and sends people to the ER with respiratory problems. And hurricanes. Ian was 2022. Milton was 2024. Most people find out what's happening from a news alert or a neighbor. We built something better."

---

**[0:15–0:25] WHAT IT IS**

"TideGuard is a live coastal intelligence dashboard. Two threats, one screen, fully usable on your phone."

*[Gesture at the screen — Red Tide dashboard]*

---

**[0:25–0:55] RED TIDE DEMO**

"Right now we're pulling 167 live Karenia brevis sample locations from the Florida Fish and Wildlife Conservation Commission's GIS API — color coded by bloom intensity. Today we're sitting at All Clear across Southwest Florida."

*[Point to the weather widget]*

"Weather is live from Open-Meteo — 70 degrees, overcast, 87% humidity, wind at 23 miles per hour. Wind matters here. Onshore wind pushes airborne toxins toward populated beaches. Offshore disperses the bloom."

*[Click the Chat tab — AI chat is already loaded]*

"The AI chat runs on IBM watsonx through Symplistic's ContentIQ platform — one of the sponsor tools here today. But it's not a generic chatbot. Every session, we inject the current bloom level, wind vector, and live news context directly into the model."

*[Click the chip: "Will red tide come toward shore?"]*

"Watch this answer — it's grounded in today's wind, not a general FAQ."

*[Let the response appear — it will say something about offshore wind dispersing the bloom since it's All Clear / offshore conditions]*

"That's the difference. It knows the wind is offshore right now. It's answering about today."

---

**[0:55–1:05] SWITCH TO HURRICANE**

"Now the hurricane dashboard."

*[Click the nav toggle to switch to Hurricane dashboard]*

---

**[1:05–1:45] HURRICANE DEMO**

"This is pulling active storm data from NOAA's National Hurricane Center. We're showing a current storm track — category, wind speed, pressure, movement vector, forecast track forward in time."

*[Click the Live Radar toggle]*

"Live radar — a 2-hour Xweather animated tile overlay. Five frames, 1.8 seconds each. You can actually watch precipitation moving across the Gulf."

*[Hit Play — let it run for a few seconds]*

*[Click Evacuation Zones toggle]*

"Evacuation zones for Lee, Collier, Charlotte, and Sarasota counties — pulled from FEMA's National Flood Hazard Layer API."

*[Click the AI Chat tab in the hurricane sidebar — show the Florida insurance question response already loaded]*

"Here's a business use case. A property manager in Lee County asks: what are the major Florida insurance changes for 2026?"

*[Point to the answer on screen — read one line]*

"Hurricane deductibles moved from 2 to 5 percent of dwelling value. Citizens Property Insurance now requires flood coverage for homes between 400 and 500 thousand dollars starting January 2026. That's a real decision someone needs to make before storm season. The AI surfaces it with citations, grounded in current conditions and news context."

---

**[1:45–1:55] MOBILE**

*[Pull out phone or switch to mobile view]*

"Full screen map on mobile. Swipe up for intel. Full screen chat. Because the person who needs this is standing on a beach or sitting in a car, not at a desk."

---

**[1:55–2:00] CLOSE**

"Five live APIs, two dashboards, AI that knows what's happening right now. The data to make better coastal decisions already existed — it just wasn't in one place. That's TideGuard."

---

## EXACT AI CHAT INPUTS TO USE

| Dashboard | Click or Type | Why It Works |
|---|---|---|
| Red Tide | Click chip: **"Will red tide come toward shore?"** | Wind is currently offshore (All Clear day) — AI will correctly say bloom is dispersing, not moving in. Sounds smart and specific. |
| Hurricane | Show pre-loaded response to: **"What are major Florida insurance changes for 2026?"** | Concrete business metric — deductible % change, Citizens flood mandate, lawsuit reform stats. Judges see real-world utility. |

---

## IF A JUDGE ASKS

**"How does the AI know about today's conditions?"**
"We build the system prompt dynamically on every session open — current bloom level, wind speed and direction, onshore or offshore classification, and recent news headlines. The model gets that context before the user types anything."

**"What APIs are you using?"**
"FWC GIS MapServer for Karenia brevis samples, Open-Meteo for wind and weather, NOAA NHC for storm tracks and weather alerts, Xweather for the animated radar tiles, NewsAPI for hurricane news, and IBM watsonx through Symplistic's ContentIQ for the AI layer."

**"Why does wind matter for red tide?"**
"Karenia brevis produces aerosolized brevetoxins when it's near the surface. Onshore wind carries those particles to the beach — you can have respiratory symptoms 50 meters from the water. Offshore wind pushes the bloom out and disperses it. That's why we show wind direction as a primary signal, not just bloom concentration."

**"Hardest technical problem?"**
"Mobile map layout. Leaflet initializes at whatever size the container is on first render. Our responsive layout caused the map to initialize at zero width, leaving half the screen black. We solved it with a component that calls invalidateSize after layout settles. The other one was radar animation — we pre-render all five time frames simultaneously and crossfade between them with a CSS opacity transition so there's no flash between frames."

**"How would you scale this?"**
"The FWC API covers the full Florida coast. Expanding statewide is a configuration change. The FEMA flood zone and evacuation data follows the same format for every county in Florida. County emergency management is the natural institutional customer — they already maintain this data, they just don't have a front end built for residents on mobile."

---

## SPONSOR TIE-INS TO DROP NATURALLY

- **Symplistic.ai** — "We're using ContentIQ, which is Symplistic's platform, for the AI chat layer. The insurance Q&A you just saw is running through that."
- **Eightpoint** — "The core idea maps directly to your challenge — raw sensor feeds, GIS coordinates, advisory text — all unstructured — turned into one specific, grounded answer."

---

## TIMING GUIDE

| Time | Action |
|---|---|
| 0:00 | Start talking — no clicking yet |
| 0:15 | Gesture at Red Tide dashboard |
| 0:25 | Point to bloom markers, then weather widget |
| 0:40 | Click Chat tab, click "Will red tide come toward shore?" chip |
| 0:55 | Click nav toggle → Hurricane dashboard |
| 1:05 | Click Live Radar → hit Play |
| 1:20 | Click Evacuation Zones |
| 1:30 | Click Chat tab → show insurance answer |
| 1:45 | Show phone / mobile view |
| 1:55 | Stop clicking, look at judges, deliver close |
| 2:00 | Done |
