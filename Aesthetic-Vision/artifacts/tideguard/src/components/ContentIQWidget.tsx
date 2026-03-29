import { useEffect, useRef } from "react";

interface ContentIQWidgetProps {
  agentId: string;
  token: string;
  backend?: string;
  className?: string;
  style?: React.CSSProperties;
}

const WIDGET_SCRIPT_URL = "https://contentiq-widget.pages.dev/widget.js";

function loadWidgetScript(agentId: string, token: string, backend: string) {
  // Avoid loading multiple times per agent
  const existing = document.querySelector(`script[data-agent="${agentId}"]`);
  if (existing) return;

  const script = document.createElement("script");
  script.src = WIDGET_SCRIPT_URL;
  script.defer = true;
  script.setAttribute("data-agent", agentId);
  script.setAttribute("data-token", token);
  script.setAttribute("data-backend", backend);
  document.body.appendChild(script);
}

// Use our own backend proxy to avoid CORS issues on deployed domain
function getProxyBackend() {
  return `${window.location.origin}/api/ciq`;
}

export default function ContentIQWidget({
  agentId,
  token,
  backend,
  className,
  style,
}: ContentIQWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedBackend = backend ?? getProxyBackend();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create the embed div that the widget script looks for
    const embedDiv = document.createElement("div");
    embedDiv.className = "contentiq_symplisticai_chat";
    embedDiv.setAttribute("data-agent", agentId);
    container.appendChild(embedDiv);

    // Load the widget script — routes through our proxy to avoid CORS
    loadWidgetScript(agentId, token, resolvedBackend);

    return () => {
      if (container.contains(embedDiv)) {
        container.removeChild(embedDiv);
      }
    };
  }, [agentId, token, resolvedBackend]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        ...style,
      }}
    />
  );
}
