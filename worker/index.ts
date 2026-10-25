import news from '../api/news';
import hurricaneNews from '../api/hurricane-news';
import roadConditions from '../api/road-conditions';
import storms from '../api/hurricane/storms';
import { chat } from './chat';

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

export default {
  async fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/chat') return chat(request, env);
    const handler = routes[pathname];
    if (!handler) return env.ASSETS ? (env.ASSETS as Fetcher).fetch(request) : new Response('Not found', { status: 404 });
    return run(handler, request);
  },
};
