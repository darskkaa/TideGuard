import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const KEY = "tg-notice";

export default function PrivacyNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (["/legal", "/privacy", "/terms"].includes(window.location.pathname)) return;
    try { setShow(localStorage.getItem(KEY) !== "1"); } catch { setShow(true); }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* storage unavailable, notice returns next visit */ }
    setShow(false);
  };

  return (
    <div
      role="region"
      aria-label="Privacy notice"
      className="fixed left-3 right-3 sm:left-4 sm:right-auto sm:max-w-sm bottom-20 sm:bottom-4 rounded-xl p-3.5 flex gap-3 items-start"
      style={{
        zIndex: 9997,
        background: "rgba(8,14,26,0.96)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" style={{ color: "hsl(191 90% 56%)" }} aria-hidden="true" />
      <div className="flex-1 text-xs leading-relaxed" style={{ color: "hsl(210 20% 86%)" }}>
        <p>
          <strong>No cookies, no trackers.</strong> Chat messages are saved only in this tab and sent to an AI service to get answers. Not official safety advice.{" "}
          <a href="/legal#privacy" className="underline" style={{ color: "hsl(191 90% 62%)" }}>Privacy &amp; terms</a>
        </p>
        <button
          onClick={dismiss}
          className="mt-2.5 px-3 rounded-lg text-xs font-semibold cursor-pointer"
          style={{ minHeight: 44, background: "hsl(191 90% 46%)", color: "#04121a" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
