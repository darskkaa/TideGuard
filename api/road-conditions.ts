import type { VercelRequest, VercelResponse } from '@vercel/node';

const ROAD_POINTS = [
  { id: 'us41-fortmyers', name: 'US-41 · Fort Myers', lat: 26.634, lng: -81.874 },
  { id: 'us41-naples', name: 'US-41 · Naples', lat: 26.142, lng: -81.800 },
  { id: 'i75-leeco', name: 'I-75 · Lee County', lat: 26.628, lng: -81.828 },
  { id: 'sr951-marco', name: 'SR-951 · Marco Island', lat: 25.971, lng: -81.712 },
  { id: 'us41-punta', name: 'US-41 · Punta Gorda', lat: 26.931, lng: -82.038 },
  { id: 'us41-sarasota', name: 'US-41 · Sarasota', lat: 27.221, lng: -82.518 },
];

interface OpenMeteoCurrent {
  temperature_2m?: number;
  precipitation?: number;
  snowfall?: number;
  weather_code?: number;
}

async function fetchPoint(lat: number, lng: number): Promise<OpenMeteoCurrent | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,snowfall,weather_code&temperature_unit=fahrenheit`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!resp.ok) return null;
  const data = await resp.json() as { current?: OpenMeteoCurrent };
  return data.current ?? null;
}

function classify(c: OpenMeteoCurrent | null): { status: string; phrase: string; surface: string; surfacePhrase: string } {
  if (!c) return { status: 'unknown', phrase: 'Unknown', surface: 'unknown', surfacePhrase: 'Unknown' };
  const code = c.weather_code ?? 0;
  const precip = c.precipitation ?? 0;
  if ((c.snowfall ?? 0) > 0 || (code >= 71 && code <= 77)) return { status: 'snow', phrase: 'Snow', surface: 'snow', surfacePhrase: 'Snow covered' };
  if (code >= 95 || precip >= 7.5) return { status: 'severe', phrase: 'Severe weather', surface: 'wet', surfacePhrase: 'Standing water possible' };
  if (precip > 0 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { status: 'wet', phrase: 'Wet', surface: 'wet', surfacePhrase: 'Wet' };
  if (code === 45 || code === 48) return { status: 'fog', phrase: 'Fog', surface: 'dry', surfacePhrase: 'Dry' };
  return { status: 'dry', phrase: 'Dry', surface: 'dry', surfacePhrase: 'Dry' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    type RoadResult = { id: string; name: string; lat: number; lng: number; status: string; statusPhrase: string; surface: string; surfacePhrase: string; tempF: number | null; summary: string | null };

    const settled = await Promise.allSettled(
      ROAD_POINTS.map(async (pt): Promise<RoadResult> => {
        const current = await fetchPoint(pt.lat, pt.lng);
        const k = classify(current);
        return {
          id: pt.id, name: pt.name, lat: pt.lat, lng: pt.lng,
          status: k.status, statusPhrase: k.phrase,
          surface: k.surface, surfacePhrase: k.surfacePhrase,
          tempF: current?.temperature_2m ?? null,
          summary: null,
        };
      })
    );

    const points = settled
      .filter((r): r is PromiseFulfilledResult<RoadResult> => r.status === 'fulfilled')
      .map((r) => r.value);

    res.setHeader('Cache-Control', 'public, max-age=900');
    return res.status(200).json({ points });
  } catch {
    return res.status(500).json({ error: 'Road conditions unavailable' });
  }
}
