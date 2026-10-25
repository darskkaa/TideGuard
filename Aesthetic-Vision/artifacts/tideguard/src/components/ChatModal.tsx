import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function ChatModal({
  title, accent, onClose, actions, children,
}: {
  title: string;
  accent: string;
  onClose: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    cardRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return createPortal(
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeRef.current(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(3, 7, 14, 0.72)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "max(0px, env(safe-area-inset-top)) 0 0 0",
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="flex flex-col outline-none w-full sm:w-[min(760px,94vw)] h-[100dvh] sm:h-[min(820px,90vh)] sm:rounded-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(10,17,30,0.98), rgba(7,12,22,0.98))",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: `0 24px 80px rgba(0,0,0,0.65), 0 0 0 1px ${accent}14`,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
            <span className="text-sm font-bold tracking-wide" style={{ color: accent }}>{title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "hsl(210 18% 62%)" }}>FREE AI</span>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <button
              onClick={onClose}
              aria-label="Close chat"
              className="flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              style={{ width: 44, height: 44 }}
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
