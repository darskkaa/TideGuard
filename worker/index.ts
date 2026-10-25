import news from '../api/news';
import hurricaneNews from '../api/hurricane-news';
import roadConditions from '../api/road-conditions';
import storms from '../api/hurricane/storms';

type Handler = (req: any, res: any) => unknown;

const routes: Record<string, Handler> = {
  '/api/news': news,
  '/api/hurricane-news': hurricaneNews,
  '/api/road-conditions': roadConditions,
  '/api/hurricane/storms': storms,
};

async function run(handler: Handler, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const headers = new Headers({ 'Content-Type': 'application/json' });
  let status = 200;
  let body = '';
  const res = {
    setHeader(k: string, v: string) { headers.set(k, v); return res; },
    status(code: number) { status = code; return res; },
    json(data: unknown) { body = JSON.stringify(data); return res; },
  };
  const req = { method: request.method, url: url.pathname + url.search, query: Object.fromEntries(url.searchParams), headers: Object.fromEntries(request.headers) };
  await handler(req, res);
  return new Response(body, { status, headers });
}

const SYSTEM_PROMPTS: Record<string, string> = {
  redtide: 'You are TideGuard AI, an assistant for Southwest Florida red tide (Karenia brevis) conditions. Answer concisely and practically using the live context provided. Cover beach safety, respiratory risk, shellfish and pets. For medical concerns point to the Florida Poison Hotline at 800-222-1222. If the context does not answer something, say so rather than guessing.',
  hurricane: 'You are StormGuard AI, an assistant for Atlantic hurricane preparedness in Southwest Florida. Answer concisely and practically using the live storm, alert and news context provided. For evacuation orders defer to county emergency management and the National Hurricane Center. If the context does not answer something, say so rather than guessing.',
};

async function chat(request: Request, env: Record<string, unknown>): Promise<Response> {
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const key = env.OPENROUTER_API_KEY as string | undefined;
  if (!key) return json({ error: 'Chat is not configured' }, 503);

  let payload: { messages?: { role: string; content: string }[]; context?: string; mode?: string };
  try { payload = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const history = (payload.messages ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!history.length) return json({ error: 'No messages' }, 400);

  const system = `${SYSTEM_PROMPTS[payload.mode ?? ''] ?? SYSTEM_PROMPTS.redtide}

Live context:
${(payload.context ?? '').slice(0, 4000)}`;

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'TideGuard' },
    body: JSON.stringify({ models: ['nvidia/nemotron-3.5-lightning:free', 'poolside/laguna-xs-2.1:free', 'openrouter/free'], reasoning: { enabled: false }, max_tokens: 450, messages: [{ role: 'system', content: system }, ...history] }),
    signal: AbortSignal.timeout(25000),
  }).catch(() => null);
  if (!upstream?.ok) return json({ error: 'AI service unavailable, try again shortly' }, 502);

  const data = await upstream.json() as { choices?: { message?: { content?: string } }[] };
  const reply = data.choices?.[0]?.message?.content?.trim();
  return reply ? json({ reply }) : json({ error: 'Empty response from model' }, 502);
}

export default {
  async fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/chat') return chat(request, env);
    const handler = routes[pathname];
    if (!handler) return env.ASSETS ? (env.ASSETS as Fetcher).fetch(request) : new Response('Not found', { status: 404 });
    return run(handler, request);
  },
};
