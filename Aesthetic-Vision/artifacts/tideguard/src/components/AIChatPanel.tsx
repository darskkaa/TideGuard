import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { Send, Square, Copy, Check, RotateCcw, Trash2 } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string; error?: boolean }

const FOLLOWUP_RE = /\[\[followups:([\s\S]*?)\]\]/i;

function splitReply(raw: string): { text: string; followups: string[] } {
  const m = raw.match(FOLLOWUP_RE);
  if (m) {
    return {
      text: raw.replace(FOLLOWUP_RE, "").trim(),
      followups: m[1].split("|").map((q) => q.trim()).filter(Boolean).slice(0, 3),
    };
  }
  const open = raw.indexOf("[[");
  return { text: (open >= 0 ? raw.slice(0, open) : raw).trim(), followups: [] };
}

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  let last = 0;
  let i = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={key} className="px-1 rounded text-[0.85em]" style={{ background: "rgba(255,255,255,0.08)" }}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[")) {
      const [, label, href] = tok.match(/^\[([^\]]+)\]\((.+)\)$/) ?? [];
      out.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "inherit" }}>{label}</a>);
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) blocks.push(<p key={`p${blocks.length}`} className="mb-2 last:mb-0">{inline(para.join(" "), `p${blocks.length}`)}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    const k = `l${blocks.length}`;
    blocks.push(
      <Tag key={k} className={`mb-2 last:mb-0 pl-5 ${list.ordered ? "list-decimal" : "list-disc"}`}>
        {list.items.map((it, j) => <li key={j} className="mb-0.5">{inline(it, `${k}-${j}`)}</li>)}
      </Tag>,
    );
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const num = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || num) {
      flushPara();
      const ordered = !!num;
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] }; }
      list.items.push((bullet ?? num)![1]);
    } else if (!line) {
      flushPara(); flushList();
    } else {
      flushList();
      para.push(line.replace(/^#{1,4}\s+/, ""));
    }
  }
  flushPara(); flushList();
  return <>{blocks}</>;
}

export default function AIChatPanel({
  mode, accent, buildContext, questions,
}: {
  mode: "redtide" | "hurricane";
  accent: string;
  buildContext: () => string;
  questions: string[];
}) {
  const storeKey = `tg-chat-${mode}`;
  const [messages, setMessages] = useState<Msg[]>(() => {
    try { return JSON.parse(sessionStorage.getItem(storeKey) ?? "[]") as Msg[]; } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try { sessionStorage.setItem(storeKey, JSON.stringify(messages.filter((m) => !m.error))); } catch { /* storage unavailable */ }
  }, [messages, storeKey]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(async (history: Msg[]) => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStreaming(true);
    setMessages([...history, { role: "assistant", content: "" }]);
    const setLast = (patch: Partial<Msg>) =>
      setMessages((cur) => cur.map((m, i) => (i === cur.length - 1 ? { ...m, ...patch } : m)));
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), context: buildContext(), mode }),
        signal: ctrl.signal,
      });
      if (!r.ok || !r.body) {
        const err = await r.json().catch(() => null) as { error?: string } | null;
        setLast({ content: err?.error ?? "Something went wrong. Please try again.", error: true });
        return;
      }
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setLast({ content: acc });
      }
      if (!acc.trim()) setLast({ content: "The model returned no answer. Please try again.", error: true });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setLast({ content: "Couldn't reach the AI service. Check your connection and try again.", error: true });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [buildContext, mode]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || streaming) return;
    setInput("");
    void ask([...messages.filter((m) => !m.error), { role: "user", content: q }]);
  };

  const retry = () => {
    const base = messages.filter((m) => !m.error);
    if (base.length && base[base.length - 1].role === "user") void ask(base);
  };

  const stop = () => abortRef.current?.abort();
  const clear = () => { abortRef.current?.abort(); setMessages([]); };

  const copy = (idx: number) => {
    navigator.clipboard.writeText(splitReply(messages[idx].content).text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  const last = messages[messages.length - 1];
  const suggestions = Array.from(new Set(questions));
  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const modelFollowups = last && last.role === "assistant" && !streaming && !last.error ? splitReply(last.content).followups : [];
  const lastFollowups = modelFollowups.length || !last || last.role !== "assistant" || streaming || last.error
    ? modelFollowups
    : suggestions.filter((q) => !asked.has(q)).slice(0, 3);
  const chipStyle = { border: `1px solid ${accent}40`, color: accent };

  return (
    <div className="flex flex-col h-full" style={{ gap: 8 }}>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col" style={{ gap: 12 }} role="log" aria-live="polite" aria-label="Chat conversation">
        {messages.length === 0 ? (
          <div className="m-auto w-full max-w-xl text-center" style={{ padding: "8px 0" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "hsl(210 20% 92%)" }}>Ask about conditions right now</p>
            <p className="text-xs mb-4" style={{ color: "hsl(210 18% 62%)" }}>Answers use the live data on screen plus a curated knowledge base.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((q) => (
                <button key={q} onClick={() => send(q)} className="px-3 py-2 rounded-full text-xs font-medium hover:bg-white/10 active:scale-95 cursor-pointer transition-colors" style={chipStyle}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isUser = m.role === "user";
            const { text } = isUser ? { text: m.content } : splitReply(m.content);
            const pending = !isUser && !m.error && streaming && i === messages.length - 1;
            return (
              <div key={i} className="flex flex-col" style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "90%" }}>
                <div
                  className="text-sm rounded-2xl px-3.5 py-2.5"
                  style={{
                    background: isUser ? `${accent}26` : m.error ? "rgba(239,68,68,0.10)" : "rgba(255,255,255,0.06)",
                    border: m.error ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent",
                    color: "hsl(210 20% 92%)",
                    lineHeight: 1.55,
                  }}
                >
                  {isUser ? <span className="whitespace-pre-wrap">{text}</span> : text ? <Markdown text={text} /> : null}
                  {pending && (
                    <span className="inline-flex gap-1 align-middle" aria-label="Thinking">
                      {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent, animationDelay: `${d * 150}ms` }} />)}
                    </span>
                  )}
                </div>
                {!isUser && !pending && (
                  <div className="flex items-center gap-1 mt-1">
                    {m.error ? (
                      <button onClick={retry} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded hover:bg-white/10 cursor-pointer" style={{ color: accent }}>
                        <RotateCcw size={11} /> Retry
                      </button>
                    ) : (
                      <button onClick={() => copy(i)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded hover:bg-white/10 cursor-pointer" style={{ color: "hsl(210 18% 62%)" }} aria-label="Copy answer">
                        {copiedIdx === i ? <Check size={11} /> : <Copy size={11} />} {copiedIdx === i ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        {lastFollowups.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {lastFollowups.map((q) => (
              <button key={q} onClick={() => send(q)} className="px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 active:scale-95 cursor-pointer transition-colors" style={chipStyle}>
                {q}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center justify-between flex-shrink-0 px-1">
        <span className="text-[10px]" style={{ color: "hsl(210 18% 52%)" }}>AI can make mistakes. Verify with official sources.</span>
        {messages.length > 0 && (
          <button onClick={clear} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded hover:bg-white/10 cursor-pointer" style={{ color: "hsl(210 18% 62%)" }}>
            <Trash2 size={11} /> New chat
          </button>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 flex-shrink-0">
        <label htmlFor={`chat-input-${mode}`} className="sr-only">Ask a question</label>
        <input
          id={`chat-input-${mode}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          autoComplete="off"
          placeholder="Ask about current conditions…"
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-transparent outline-none focus-visible:ring-2"
          style={{ border: "1px solid rgba(255,255,255,0.15)", color: "hsl(210 20% 92%)", minHeight: 44 }}
        />
        {streaming ? (
          <button type="button" onClick={stop} aria-label="Stop generating" className="rounded-lg flex items-center justify-center cursor-pointer" style={{ background: "rgba(255,255,255,0.12)", color: "hsl(210 20% 92%)", width: 44, height: 44 }}>
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()} aria-label="Send" className="rounded-lg flex items-center justify-center disabled:opacity-40 cursor-pointer" style={{ background: accent, color: "#07101c", width: 44, height: 44 }}>
            <Send size={16} />
          </button>
        )}
      </form>
    </div>
  );
}
