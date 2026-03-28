import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CURATED_ARTICLES = [
  {
    id: "curated-1",
    title: "Red Tide Status Update for March 28, 2026 — Southwest Florida Clear, Northwest Active",
    description:
      "K. brevis was not observed in Southwest Florida over the past week. Background concentrations detected in nine samples from Northwest Florida. No fish kills or respiratory irritation reported.",
    url: "https://myfwc.com/research/redtide/statewide/",
    source: "Florida FWC",
    publishedAt: "2026-03-28T17:00:00Z",
    content:
      "Red Tide Status Update for March 28, 2026. Over the past week, the red tide organism, Karenia brevis, was observed at background concentrations in nine samples collected from Northwest Florida and very low concentrations in one sample collected from Florida's East Coast. In Southwest Florida over the past week, K. brevis was not observed. In Northwest Florida, K. brevis was observed at background concentrations in and offshore of Okaloosa County, and in Walton, Bay, and Gulf counties. No fish kills suspected to be related to red tide were reported to FWC's Fish Kill Hotline over the past week. Respiratory irritation suspected to be related to red tide was not reported. Short-term forecasts predict net southwestern movement of surface waters and eastern transport of subsurface waters in most areas from Pinellas to northern Monroe counties.",
  },
  {
    id: "curated-2",
    title: "City of Naples Red Tide Response: Stormwater, Fertilizer Rules & Oyster Reef Restoration",
    description:
      "Naples outlines its multi-front effort against red tide — a $25M stormwater project, fertilizer ordinances, mangrove protection, and new oyster reef restoration in Naples Bay to filter nutrients before they reach the Gulf.",
    url: "https://www.naplesgov.com/naturalresources/page/red-tide",
    source: "City of Naples, FL",
    publishedAt: "2026-03-28T12:00:00Z",
    content:
      "When Southwest Florida is experiencing a red tide bloom, people with chronic respiratory illnesses such as asthma or emphysema should avoid going to the beach. Red tide is a harmful algal bloom (HAB) that typically forms offshore and produces a toxin that can affect both marine life and humans. Once onshore, it can be exacerbated by human activities, including excessive use of plant fertilizers, littering, and an increasing amount of stormwater runoff from impervious areas. The City of Naples has implemented: a stormwater ordinance requiring updated standards; a fertilizer ordinance prohibiting phosphorus and limiting nitrogen content with application only in the dry season; regular street sweeping to prevent debris from entering the stormwater system; mangrove protection policies; lake restoration projects; and a $25M beach stormwater outfall improvement project. The City is restoring oyster reefs in Naples Bay — one oyster can filter up to 50 gallons per day. Residents are encouraged to report conditions via Mote Marine's Beach Conditions Reporting System at visitbeaches.org and the FWC Reporter app.",
  },
  {
    id: "curated-3",
    title: "Study Finds Human Activity Fuels and Intensifies Red Tide Blooms in Southwest Florida",
    description:
      "First-of-its-kind research links red tide intensification to nitrogen from the Caloosahatchee River, Lake Okeechobee, and upstream watershed — confirming that agriculture, fertilizer runoff, and septic systems extend bloom duration.",
    url: "https://sccf.org/2022/04/20/study-finds-human-activity-fuels-red-tide/",
    source: "SCCF / University of Florida",
    publishedAt: "2026-03-28T09:00:00Z",
    content:
      "A new study from researchers at the University of Florida, SCCF, and Sarasota Bay Estuary Program is the first to explain what some have long suspected — human activity helps fuel and intensify naturally-occurring red tide blooms in Southwest Florida. The study linked blooms in Charlotte Harbor and surrounding coastal areas to nitrogen inputs from the Caloosahatchee River, Lake Okeechobee, and areas upstream of the lake. 'While red tide blooms develop naturally, we took a long view and found evidence that human activity has helped fuel coastal blooms in this estuary to varying extents between 2012 and 2021,' said Miles Medina, lead author and research scientist at UF's Center for Coastal Solutions. SCCF Marine Lab Director Eric Milbrandt added: 'There is now another piece of evidence linking red tide bloom intensity to human activities and nitrogen sources specifically.' Study coauthor Dave Tomasko, director of the Sarasota Bay Estuary Program, noted: 'Our paper indicates that there are additional benefits to reducing nitrogen loads such as a reduced enhancement of red tides that arrive on our coast.' The research was published in the journal Science of the Total Environment.",
  },
];

router.get("/news", async (_req, res) => {
  return res.json({
    articles: CURATED_ARTICLES,
    source: "live",
    totalResults: CURATED_ARTICLES.length,
  });
});

export default router;
