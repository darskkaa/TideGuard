import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Storm {
  id: string;
  name: string;
  classification: string;
  intensity: string;
  pressure: string;
  latitudeNumeric: number;
  longitudeNumeric: number;
  movement: string;
  lastUpdate: string;
  basin: string;
}

const NHC_BASINS: Record<string, string> = { al: 'Atlantic', ep: 'East Pacific', cp: 'Central Pacific' };

function basinFor(lat: number, lng: number): string {
  const l = lng < 0 ? lng + 360 : lng;
  if (lat >= 0) {
    if (l >= 100 && l <= 180) return 'West Pacific';
    if (l >= 40 && l < 100) return 'North Indian';
    if (l > 180 && l < 260) return 'Central Pacific';
    if (l >= 260 && l < 360) return lng > -100 ? 'Atlantic' : 'East Pacific';
    return 'Other';
  }
  if (l >= 30 && l < 135) return 'South Indian';
  if (l >= 135 && l < 290) return 'South Pacific';
  return 'South Atlantic';
}

function classFor(mph: number): string {
  if (mph >= 74) return 'HU';
  if (mph >= 39) return 'TS';
  return 'TD';
}

async function fromNhc(): Promise<Storm[]> {
  const r = await fetch('https://www.nhc.noaa.gov/CurrentStorms.json', {
    headers: { 'User-Agent': 'TideGuard/1.0 (educational project)', Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`NHC ${r.status}`);
  const data = await r.json() as { activeStorms?: Array<Record<string, any>> };
  return (data.activeStorms ?? []).map((s) => ({
    id: String(s.id ?? s.binNumber ?? s.name),
    name: String(s.name ?? 'Unknown'),
    classification: String(s.classification ?? 'TS'),
    intensity: String(s.intensity ?? 0),
    pressure: String(s.pressure ?? 1013),
    latitudeNumeric: Number(s.latitudeNumeric),
    longitudeNumeric: Number(s.longitudeNumeric),
    movement: s.movementSpeed != null ? `${s.movementDir ?? ''}° at ${s.movementSpeed} mph` : 'Unknown',
    lastUpdate: String(s.lastUpdate ?? new Date().toISOString()),
    basin: NHC_BASINS[String(s.id ?? '').slice(0, 2).toLowerCase()] ?? basinFor(Number(s.latitudeNumeric), Number(s.longitudeNumeric)),
  }));
}

async function fromGdacs(): Promise<Storm[]> {
  const to = new Date();
  const from = new Date(to.getTime() - 5 * 86400000);
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const r = await fetch(`https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=TC&alertlevel=Green;Orange;Red&fromDate=${day(from)}&toDate=${day(to)}`, {
    headers: { 'User-Agent': 'TideGuard/1.0 (educational project)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`GDACS ${r.status}`);
  const data = await r.json() as { features?: Array<{ geometry: { coordinates: [number, number] }; properties: Record<string, any> }> };
  const cutoff = Date.now() - 36 * 3600000;
  return (data.features ?? [])
    .filter((f) => String(f.properties.iscurrent) === 'true' && Date.parse(f.properties.datemodified + 'Z') >= cutoff)
    .map((f) => {
      const p = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      const mph = Math.round((Number(p.severitydata?.severity) || 0) * 0.621371);
      const name = String(p.eventname ?? p.name).replace(/-\d{2}$/, '').toLowerCase().replace(/(^|[\s-])\w/g, (c) => c.toUpperCase());
      return {
        id: `gdacs-${p.eventid}`,
        name,
        classification: classFor(mph),
        intensity: String(mph),
        pressure: '1013',
        latitudeNumeric: lat,
        longitudeNumeric: lng,
        movement: 'Unknown',
        lastUpdate: String(p.datemodified) + 'Z',
        basin: basinFor(lat, lng),
      };
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const [nhc, gdacs] = await Promise.allSettled([fromNhc(), fromGdacs()]);
  if (nhc.status === 'rejected' && gdacs.status === 'rejected') return res.status(200).json({ activeStorms: [], error: 'Storm feeds unavailable' });

  const storms = nhc.status === 'fulfilled' ? [...nhc.value] : [];
  const seen = new Set(storms.map((s) => s.name.toLowerCase()));
  if (gdacs.status === 'fulfilled') {
    for (const g of gdacs.value) {
      const nearExisting = storms.some((s) => Math.abs(s.latitudeNumeric - g.latitudeNumeric) < 2 && Math.abs(s.longitudeNumeric - g.longitudeNumeric) < 2);
      if (!seen.has(g.name.toLowerCase()) && !nearExisting) { storms.push(g); seen.add(g.name.toLowerCase()); }
    }
  }
  storms.sort((a, b) => (a.basin === 'Atlantic' ? 0 : 1) - (b.basin === 'Atlantic' ? 0 : 1) || Number(b.intensity) - Number(a.intensity));

  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({ activeStorms: storms, sources: { nhc: nhc.status, gdacs: gdacs.status } });
}
