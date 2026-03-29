import "leaflet/dist/leaflet.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Link, useLocation } from "wouter";
import { Droplets, CloudLightning } from "lucide-react";
import Dashboard from "@/pages/Dashboard";
import HurricaneDashboard from "@/pages/HurricaneDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient();

function NavToggle() {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const tabs = [
    { href: "/", label: "Red Tide", color: "hsl(191 90% 46%)", Icon: Droplets },
    { href: "/hurricanes", label: "Hurricanes", color: "#ef4444", Icon: CloudLightning },
  ];

  // Mobile: compact single icon button (shows the OTHER dashboard)
  if (isMobile) {
    const currentIdx = location === "/" ? 0 : 1;
    const other = tabs[1 - currentIdx];
    return (
      <Link
        href={other.href}
        style={{
          position: "fixed",
          top: 10,
          right: 56,
          zIndex: 9998,
          width: 40,
          height: 40,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          background: "rgba(6, 12, 22, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <other.Icon size={16} style={{ color: other.color }} />
      </Link>
    );
  }

  // Desktop: vertical pill with both tabs
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: 16,
        transform: "translateY(-50%)",
        flexDirection: "column",
        zIndex: 9998,
        display: "flex",
        gap: 6,
        padding: "5px",
        borderRadius: 14,
        background: "rgba(6, 12, 22, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      {tabs.map(({ href, label, color, Icon }) => {
        const isActive = href === "/" ? location === "/" : location.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s",
              background: isActive ? color + "1a" : "transparent",
              color: isActive ? color : "hsl(210 18% 50%)",
              border: isActive ? `1px solid ${color}40` : "1px solid transparent",
              boxShadow: isActive ? `0 0 16px ${color}15` : "none",
            }}
          >
            <Icon
              size={14}
              style={{
                opacity: isActive ? 1 : 0.5,
                filter: isActive ? `drop-shadow(0 0 4px ${color})` : "none",
              }}
            />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/hurricanes" component={HurricaneDashboard} />
      </Switch>
      <NavToggle />
    </QueryClientProvider>
  );
}
