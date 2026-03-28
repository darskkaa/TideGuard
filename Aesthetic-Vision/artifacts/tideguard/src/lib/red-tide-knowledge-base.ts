/**
 * Red Tide Knowledge Base
 * Comprehensive knowledge source for IBM watsonx ContentIQ AI agent
 * Includes all curated articles and ML predictive analysis
 */

export interface KnowledgeArticle {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  content: string;
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "sccf-1",
    title: "What is Red Tide? Karenia brevis Resources for Southwest Florida",
    source: "SCCF",
    date: "2026-03-28",
    url: "https://sccf.org/red-tide-resources/",
    content: `Karenia brevis is a single-celled organism belonging to a group of algae called dinoflagellates. Large concentrations of this organism, called blooms or 'red tides,' can discolor water red to brown, giving it its name. Karenia brevis occurs in marine and estuarine waters of Florida and typically blooms in the late summer or early fall.

Blooms develop offshore and are brought inshore by currents and winds, usually in bottom waters. Karenia brevis produces neurotoxins called brevetoxins that can sicken or kill fish, seabirds, turtles, and marine mammals. Toxins can also affect humans, causing respiratory irritation if aerosolized toxins are inhaled, skin and/or eye irritation by contact, or shellfish poisoning if shellfish contaminated with toxins are consumed.

For health concerns related to red tide exposure, call the Florida Department of Health Poison Hotline at 800-222-1222. Medical professionals should use ICD-10 codes T65.82 (general HAB exposure), T65.84A (initial HAB exposure), or Z77.121 (after-the-fact exposure) to help CDC and Florida Department of Health track public health impacts.`,
  },
  {
    id: "sccf-2",
    title: "Study Finds Human Activity Fuels and Intensifies Red Tide Blooms",
    source: "SCCF / University of Florida",
    date: "2026-03-28",
    url: "https://sccf.org/2022/04/20/study-finds-human-activity-fuels-red-tide/",
    content: `A landmark study from researchers at the University of Florida, SCCF, and Sarasota Bay Estuary Program is the first to demonstrate that human activity directly helps fuel and intensify naturally-occurring red tide blooms in Southwest Florida. Conducted over a decade-long analysis (2012-2021), the study found that while a combination of factors contributes to red tide blooms, human activity has played a consistent and measurable role in intensifying them.

The researchers linked blooms in Charlotte Harbor and surrounding coastal areas to nitrogen inputs from the Caloosahatchee River, Lake Okeechobee, and areas upstream of the lake. 'While red tide blooms develop naturally, we took a long view and found evidence that human activity has helped fuel coastal blooms in this estuary to varying extents between 2012 and 2021,' said Miles Medina, lead author and research scientist at UF's Center for Coastal Solutions. SCCF Marine Lab Director Eric Milbrandt explained: 'There is now another piece of evidence linking red tide bloom intensity to human activities and nitrogen sources specifically. The new approach uses complex environmental data and non-linear statistical models to establish the connection.'

Study coauthor Dave Tomasko, director of the Sarasota Bay Estuary Program, emphasized the policy implications: 'Our paper indicates that there are additional benefits to reducing nitrogen loads such as a reduced enhancement of red tides that arrive on our coast. Basically, if we do the things that the state has already determined need to be done, we would not only benefit oxygen and water clarity and seagrass meadows in this estuary, but also likely help to reduce the impacts of future red tides.' The research was published in the journal Science of the Total Environment.`,
  },
  {
    id: "wusf-1",
    title: "Fish kill in Buccaneer Lagoon confirmed as isolated oxygen depletion event, not red tide",
    source: "WUSF / WGCU",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/environment/2026-03-19/fish-kill-buccaneer-lagoon-isolated-event",
    content: `Sampling conducted by FGCU Water School researchers and SCCF marine scientist has ruled out Karenia brevis as the cause of a recent fish kill in Buccaneer Lagoon. Preliminary testing confirmed the event was an isolated oxygen depletion episode rather than a red tide-related mortality event.

The Town of Sanibel reminded residents of existing fertilizer restrictions in the wake of the incident. The use of nitrogen-rich fertilizers is a known contributor to nutrient loading that can exacerbate harmful algal blooms and aquatic hypoxia (low oxygen) events. Residents are urged to follow local fertilizer application windows (dry season only) and to report any unusual fish mortalities or water discoloration to the SCCF Marine Lab or FWC.`,
  },
  {
    id: "wusf-2",
    title: "Hundreds of volunteers needed on Sanibel for study on red tide's respiratory effects",
    source: "WUSF",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/health-news-florida/2026-01-08/volunteers-sanibel-red-tide-respiratory-study",
    content: `The Roskamp Institute is seeking 400 volunteers from the Sanibel community to participate in a groundbreaking study on red tide's respiratory health impacts. The research aims to understand why some individuals exposed to aerosolized red tide toxins experience respiratory distress while others remain unaffected.

The study will take place at the Sanibel-Captiva Conservation Foundation and will involve health assessments, respiratory testing, and longitudinal follow-up. Participants will help scientists identify individual risk factors—such as underlying asthma, age, baseline lung function, or genetic predisposition—that may influence susceptibility to red tide toxin inhalation injuries. Results will inform public health guidance and individual risk stratification during future blooms.`,
  },
  {
    id: "wusf-3",
    title: "DeSantis pledges $112 million for water projects and fighting red tide",
    source: "WUSF",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/environment/2025-12-04/desantis-112-million-water-projects-red-tide",
    content: `Governor Ron DeSantis announced over $100 million in grants Wednesday to improve drinking water supplies and prevent harmful algal blooms across Florida. The state funding targets spring restoration and nitrogen-load reduction initiatives in sensitive watersheds, with emphasis on areas that feed into red tide bloom zones like Charlotte Harbor and Tampa Bay.

The grants support municipal stormwater treatment upgrades, septic-to-sewer conversions, and agricultural best management practices to reduce nutrient runoff. DeSantis stated that reducing nitrogen and phosphorus in Florida's waterways is critical to both public health and economic recovery in coastal communities dependent on tourism and fishing.`,
  },
  {
    id: "wusf-4",
    title: "Cage fight: Some worry fish farms could be a floating hazard in the storm-lashed Gulf",
    source: "WUSF",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/environment/2025-11-26/fish-farms-gulf-offshore-aquaculture-florida",
    content: `The Trump administration's push for offshore aquaculture competitiveness has sparked concern among marine scientists and Gulf fishing communities about potential environmental consequences. Proposed fish farm locations off Florida's west coast could introduce new nutrient loading pathways and disease transmission vectors that could exacerbate red tide blooms.

Marine scientists and local fishermen argue that open-net cage operations release uneaten feed, feces, and other nutrients into the water column, potentially creating localized eutrophication zones. These zones can trigger harmful algal bloom initiation or intensification, particularly in areas already experiencing high background nitrogen from upstream watershed sources. The debate continues as federal agencies weigh economic benefits against documented environmental risks.`,
  },
  {
    id: "wusf-5",
    title: "'Tis the red tide season: high levels along the Panhandle coast",
    source: "WUSF",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/weather/2025-11-04/red-tide-season-panhandle-coast",
    content: `As fall transitions to winter, red tide season activates along Florida's coast. Elevated levels of Karenia brevis were reported in multiple samples from the Florida Panhandle, with concentrations building in offshore waters from Destin to the Big Bend region.

The season typically begins in early fall and can persist for months, driven by optimal water temperatures, nutrient availability, and coastal circulation patterns. While Southwest Florida and central Gulf areas remain free of active blooms at present, continued monitoring is critical. Atmospheric and water conditions are conducive to bloom transport and inshore movement, particularly if westerly winds and Gulf currents redirect subsurface water masses toward the coast.`,
  },
  {
    id: "wusf-6",
    title: "Everglades Foundation develops early-warning system for red tide",
    source: "WUSF",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/environment/2025-10-04/everglades-foundation-early-warning-red-tide",
    content: `The Everglades Foundation has unveiled a new early-warning forecasting system for red tide blooms in Southwest Florida that achieves up to 84% accuracy in predicting dangerous Karenia brevis outbreaks. The system integrates real-time water quality data, oceanographic circulation models, nutrient loading estimates, and meteorological forecasts to provide a unified risk assessment.

The predictive tool can issue warnings 5-10 days in advance of bloom intensification, providing critical lead time for public health agencies, coastal businesses, and recreational water users to implement protective measures. The Foundation is working with NOAA, FWC, and state health departments to integrate the early-warning system into official beach advisory protocols.`,
  },
  {
    id: "wusf-7",
    title: "Environmental educators prepare for Florida's red tide season",
    source: "WUSF",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/environment/2025-05-21/environmental-educators-florida-red-tide-season",
    content: `As blooms of blue-green algae and Karenia brevis begin to form in Southwest and Central Florida, environmental educators are ramping up outreach programs to inform tourists, residents, and school children about the biology, health risks, and economic impacts of harmful algal blooms.

Educational initiatives include beach cleanup days emphasizing nutrient reduction, interpretive signs at public access points explaining bloom causes, and classroom curricula on phytoplankton ecology and water quality. The goal is to build public understanding of the human activities (agriculture, fertilizer use, stormwater runoff) that intensify blooms and to empower communities to advocate for nutrient-reduction policies and best management practices.`,
  },
  {
    id: "wusf-8",
    title: "NOAA cuts could harm Southwest Florida fishing economy, threaten red tide research",
    source: "WUSF / Suncoast Searchlight",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/environment/2025-05-19/noaa-cuts-fishing-economy-red-tide-research",
    content: `Proposed federal budget cuts to NOAA programs could substantially harm Southwest Florida's fishing economy and threaten ongoing red tide monitoring and forecasting research. In Florida, commercial and recreational fishing supported $24.6 billion in economic activity in 2022 alone, with coastal communities heavily dependent on stable fish stocks and market access.

NOAA programs targeted for reduction include the National Centers for Coastal Ocean Science (which operates the NCCOS red tide forecasting tool), the NOAA Fisheries Statistics Division, and regional oceanographic research centers. Loss of these programs would eliminate real-time oceanographic monitoring, reduce forecast accuracy, and curtail long-term studies of bloom drivers and ecosystem impacts. Stakeholders warn that red tide research gaps will delay mitigation strategies and leave communities vulnerable to unexpected blooms.`,
  },
  {
    id: "wusf-9",
    title: "Viruses that supercharge red tide are identified by USF researchers",
    source: "WUSF",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/environment/2025-03-21/viruses-supercharge-red-tide-usf-researchers",
    content: `Researchers at the University of South Florida have identified novel viral particles that appear to supercharge Karenia brevis growth and toxin production during bloom events. The viruses, known as KbV (Karenia brevis viruses), may act as cofactors that increase cellular replication rates and elevate intracellular brevetoxin concentrations.

The discovery opens new research avenues into bloom intensity prediction and potential biocontrol strategies. USF scientists hope the findings will eventually enable forecasters to predict not just *when* blooms will occur, but *how severe* they will become based on viral abundance and metabolic activity. This enhanced predictive capacity could allow targeted public health responses and beach closure decisions with greater precision.`,
  },
  {
    id: "wusf-10",
    title: "Beach advisories cancelled as red tide from Tampa Bay to Key West fades",
    source: "WUSF",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/environment/2025-03-16/beach-advisories-cancelled-red-tide-fades",
    content: `The Florida Department of Health in Lee County lifted nearly a dozen health alerts and beach advisories as the recent red tide bloom that stretched from Tampa Bay to Key West began to disperse and fade. All sampling sites where Gulf waters were tested for red tide during the past ten days returned grey (negative) results, indicating Karenia brevis concentrations had fallen below detection thresholds.

The bloom, which persisted for approximately 8 weeks, caused significant economic impact to coastal tourism and hospitality businesses, as well as documented respiratory health effects in vulnerable populations. Preliminary post-bloom analysis suggests that a combination of unfavorable wind patterns (shifting offshore), cooler water temperatures, and possible nutrient depletion contributed to bloom senescence and offshore transport.`,
  },
  {
    id: "wusf-11",
    title: "Athletes and artists are rallying fans to save warming oceans",
    source: "WUSF",
    date: "2026-03-28",
    url: "https://wusfnews.wusf.usf.edu/environment/2025-03-10/athletes-artists-warming-oceans",
    content: `Team Ocean, a coalition of professional athletes, artists, and environmental advocates, is launching a multi-year campaign to raise awareness about ocean warming, acidification, and harmful algal blooms through social media, public events, and sponsorships at major sporting events including the World Cup and the 2028 Olympic Games.

The initiative links red tide and other marine biotoxin events to broader climate change and ocean health dynamics. Campaign messaging emphasizes that warming water temperatures are shifting the seasonal timing and geographic range of Karenia brevis blooms, making historical prediction models less reliable. Team Ocean advocates for rapid decarbonization and marine protected areas to stabilize ocean conditions and reduce bloom frequency.`,
  },
];

export const ML_ANALYSIS_REPORT = `
=========================================================
RED TIDE (ALGAE BLOOM) PREDICTIVE ML ANALYSIS REPORT
=========================================================
Data Span: 2007 - 2023
Total Samples Analyzed: 139926

1. PRIMARY DRIVERS OF BLOOM SEVERITY (Feature Importance):
The Machine Learning model identified the following factors as the most predictive of high algae counts (0 to 1 scale):
- LATITUDE: 0.3917
- LONGITUDE: 0.3318
- DayOfYear: 0.2487
- DEPTH: 0.0226
- Month: 0.0053

2. SPATIAL HOTSPOTS (WHERE):
The top 5 locations with the highest average historical bloom concentrations are:
- Location: Lido Key, 2.5 miles WSW of (Lat: 27.3000, Lon: -82.6200) | Avg Count: 186266667
- Location: Shalimar Inn Beach (Lat: 26.4224, Lon: -82.0881) | Avg Count: 150000000
- Location: Tarpon Bay Beach (Lat: 26.4216, Lon: -82.0800) | Avg Count: 87500000
- Location: Keewaydin Island; 20 mi W of (Lat: 26.0220, Lon: -82.1082) | Avg Count: 77295560
- Location: Gasparilla Island; 5.1 mi SW of (Lat: 26.7631, Lon: -82.3493) | Avg Count: 68420000

3. TEMPORAL HOTSPOTS (WHEN/WHY):
The highest severity blooms typically occur during these top 3 months:
- Month 11: Avg Count: 274495
- Month 8: Avg Count: 152930
- Month 10: Avg Count: 108358

4. AGENT INSTRUCTIONS:
As a Red Tide Agent, use the above spatial, temporal, and depth relationships to advise stakeholders. Note that while this data accurately predicts *when* and *where* blooms historically explode based on geography and seasonality, specific chemical causes (like excess nitrogen runoff, water temperature spikes, and salinity) are missing from the raw sample dataset. You should cross-reference these high-risk geographical zones and months with known seasonal agricultural runoff and water temperature trends to explain the *chemical why* to users.
`;

/**
 * Single compiled knowledge base string ready for copy/paste into IBM watsonx
 * Contains all articles formatted with metadata and the ML analysis report
 */
export const FULL_KNOWLEDGE_BASE = `
${KNOWLEDGE_ARTICLES.map(
  (a) =>
    `[ARTICLE: ${a.id}]
Title: ${a.title}
Source: ${a.source}
Date: ${a.date}
URL: ${a.url}

${a.content}`
).join("\n\n==========\n\n")}

==========

${ML_ANALYSIS_REPORT}
`;
