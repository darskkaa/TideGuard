import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string }

export default function AIChatPanel({
  mode, accent, buildContext, questions,
}: {
  mode: "redtide" | "hurricane";
  accent: string;
  buildContext: () => string;
  questions: string[];
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context: buildContext(), mode }),
      });
      const data = await r.json() as { reply?: string; error?: string };
      setMessages([...next, { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Couldn't reach the AI service. Check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ gap: 8 }}>
      <div className="flex gap-1.5 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={loading}
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium hover:bg-white/10 active:scale-95 disabled:opacity-50"
            style={{ border: `1px solid ${accent}40`, color: accent }}
          >
            {q}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col" style={{ gap: 10 }}>
        {messages.length === 0 && (
          <p className="text-xs text-center mt-8" style={{ color: "hsl(210 18% 55%)" }}>
            Ask a question or pick a suggestion. Answers use the live data on screen.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className="text-sm whitespace-pre-wrap rounded-xl px-3 py-2"
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              background: m.role === "user" ? `${accent}26` : "rgba(255,255,255,0.06)",
              color: "hsl(210 20% 92%)",
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="text-xs animate-pulse" style={{ color: accent }}>Thinking…</div>}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2 flex-shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about current conditions…"
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-transparent outline-none"
          style={{ border: "1px solid rgba(255,255,255,0.15)", color: "hsl(210 20% 92%)", minHeight: 44 }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send"
          className="rounded-lg flex items-center justify-center disabled:opacity-40"
          style={{ background: accent, color: "#07101c", width: 44, height: 44 }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
