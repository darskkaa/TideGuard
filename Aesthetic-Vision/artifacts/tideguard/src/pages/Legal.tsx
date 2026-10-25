import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const UPDATED = "October 25, 2026";

const SOURCES: { name: string; use: string; url: string }[] = [
  { name: "Florida Fish and Wildlife Conservation Commission (FWC)", use: "Red tide sample data", url: "https://myfwc.com/research/redtide/" },
  { name: "NOAA National Hurricane Center and National Weather Service", use: "Storm tracks and weather alerts", url: "https://www.nhc.noaa.gov/" },
  { name: "GDACS (UN / European Commission)", use: "Tropical cyclones outside NHC coverage", url: "https://www.gdacs.org/" },
  { name: "Open-Meteo (CC BY 4.0)", use: "Weather, wind and road conditions", url: "https://open-meteo.com/" },
  { name: "RainViewer", use: "Weather radar tiles", url: "https://www.rainviewer.com/" },
  { name: "Esri", use: "Base map tiles", url: "https://www.esri.com/" },
  { name: "GDELT Project", use: "News headlines (linked to the original publishers)", url: "https://www.gdeltproject.org/" },
  { name: "OpenRouter and Cloudflare Workers AI", use: "AI chat responses", url: "https://openrouter.ai/" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-6">
      <h2 className="text-lg font-bold mb-3" style={{ color: "hsl(210 20% 94%)" }}>{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "hsl(210 18% 72%)" }}>{children}</div>
    </section>
  );
}

export default function Legal() {
  useEffect(() => {
    document.title = "Privacy, Terms and Sources | TideGuard";
    const el = document.getElementById(window.location.hash.slice(1));
    el?.scrollIntoView();
    return () => { document.title = "TideGuard"; };
  }, []);

  return (
    <main className="min-h-screen overflow-y-auto" style={{ background: "hsl(215 40% 6%)", position: "fixed", inset: 0 }}>
      <div className="mx-auto px-4 py-8" style={{ maxWidth: 720 }}>
        <a href="/" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline" style={{ color: "hsl(191 90% 56%)", minHeight: 44 }}>
          <ArrowLeft size={16} /> Back to the map
        </a>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(210 20% 96%)" }}>Privacy, Terms and Sources</h1>
        <p className="text-xs mb-8" style={{ color: "hsl(210 18% 55%)" }}>Last updated {UPDATED}</p>

        <Section id="disclaimer" title="Safety disclaimer">
          <p><strong>TideGuard and StormGuard are informational tools, not official warnings.</strong> Data can be delayed, incomplete or wrong. Do not use this site to decide whether to evacuate, shelter, drive, swim or seek medical care.</p>
          <p>For emergencies call 911. Follow the instructions of your county emergency management office, the <a className="underline" href="https://www.nhc.noaa.gov/" target="_blank" rel="noopener noreferrer">National Hurricane Center</a> and the <a className="underline" href="https://myfwc.com/research/redtide/statewide/" target="_blank" rel="noopener noreferrer">FWC red tide status page</a>. For poisoning or health questions call the Florida Poison Information Center at 800-222-1222.</p>
          <p>Impact figures such as damage and power-outage ranges are rough estimates, not predictions. The AI assistant can make mistakes. Verify anything important with an official source.</p>
        </Section>

        <Section id="privacy" title="Privacy">
          <p><strong>We do not use cookies, advertising, analytics or tracking pixels, and we do not ask for an account, your location or notification permission.</strong> We do not sell or share personal information, so there is nothing to opt out of (this includes Global Privacy Control signals). Because nothing needs consent, there is no cookie banner.</p>
          <p><strong>What stays in your browser.</strong> Your chat history is kept in session storage in your own browser so a refresh does not wipe it. It is deleted when you close the tab or press "New chat". If you dismiss the privacy notice, a single flag (<code>tg-notice</code>) is kept in local storage so the notice does not return. Neither is used to identify you or sent to us.</p>
          <p><strong>What our server receives.</strong> This site runs on Cloudflare. Cloudflare processes requests, including your IP address, to deliver the site and protect it from abuse, and may keep short-lived technical logs. We do not build profiles or sell data.</p>
          <p><strong>AI chat.</strong> The chat is an AI system, not a person, and answers are generated automatically. When you send a message, the text of your question, your recent messages in that chat and the dashboard data currently on screen are sent to an AI provider (OpenRouter and the free models it routes to, or Cloudflare Workers AI) to generate a reply. Free models may log prompts and may use them to improve their service under their own policies. <strong>Do not type personal, medical or other sensitive information into the chat.</strong></p>
          <p><strong>Third-party requests from your browser.</strong> To draw the map and data, your browser contacts these services directly, and each can see your IP address and browser details: Esri (map tiles), RainViewer (radar), Open-Meteo (weather), the Florida Fish and Wildlife Conservation Commission (bloom data), the National Weather Service (alerts) and, if you click an article, the publisher of that article. Fonts are served from this site, not from Google.</p>
          <p><strong>Your rights.</strong> Because we do not keep personal profiles, there is usually nothing to access or delete. If you are in a place with privacy laws such as the GDPR or CCPA and want to ask, contact the site owner through the project's GitHub page. We do not knowingly collect information from children.</p>
        </Section>

        <Section id="terms" title="Terms of use">
          <p>The site is provided "as is" and "as available", without warranties of any kind, express or implied, including accuracy, availability and fitness for a particular purpose. To the fullest extent the law allows, the operators are not liable for any loss or damage arising from use of, or reliance on, the site or its AI replies.</p>
          <p>Do not scrape the API at high volume, attempt to disrupt the service, or use it to build a competing product without permission. We may change or remove the site at any time. This is a non-commercial student and hackathon project and is not affiliated with NOAA, FWC, FEMA or any government agency.</p>
          <p>It relies on free data services whose terms limit use to personal, educational or non-commercial purposes (for example RainViewer radar and the free Open-Meteo tier). Commercial use of this site would require paid plans with those providers.</p>
          <p>Names, logos and data belong to their owners and are used for identification and attribution.</p>
        </Section>

        <Section id="accessibility" title="Accessibility">
          <p>We aim to meet WCAG 2.2 level AA. The site supports keyboard navigation, visible focus indicators, screen-reader labels, text resizing and zoom, and respects your reduced-motion setting. The AI chat window can be closed with the Escape key.</p>
          <p>Known limits: the interactive map and radar are visual and cannot be fully operated from a keyboard, so the same information is also listed as text in the side panel (storms, wind, alerts, beach conditions). If you hit a barrier, tell us through the project's GitHub page and we will try to fix it or give you the information another way.</p>
        </Section>

        <Section id="sources" title="Data sources and attribution">
          <ul className="space-y-2">
            {SOURCES.map((s) => (
              <li key={s.name}>
                <a className="underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
                <span> — {s.use}</span>
              </li>
            ))}
          </ul>
          <p>Map data and imagery are subject to the providers' terms. Weather data by <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo.com</a>, licensed CC BY 4.0.</p>
        </Section>
      </div>
    </main>
  );
}
