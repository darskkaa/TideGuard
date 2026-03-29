import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const upstream = await fetch('https://www.nhc.noaa.gov/CurrentStorms.json', {
      headers: {
        'User-Agent': 'TideGuard/1.0 (educational project)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'NHC upstream error', activeStorms: [] });
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ activeStorms: [] });
  }
}
