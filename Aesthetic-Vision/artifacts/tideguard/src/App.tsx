import "leaflet/dist/leaflet.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Link, useLocation } from "wouter";
import Dashboard from "@/pages/Dashboard";
import HurricaneDashboard from "@/pages/HurricaneDashboard";

const queryClient = new QueryClient();

function NavBar() {
  const [location] = useLocation();

  const tabs = [
    { href: "/", label: "Red Tide", color: "hsl(191 90% 46%)" },
    { href: "/hurricanes", label: "Hurricanes", color: "#ef4444" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9998,
        display: "flex",
        gap: 4,
        padding: "4px",
        borderRadius: 14,
        background: "rgba(6, 12, 22, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      {tabs.map(({ href, label, color }) => {
        const isActive = href === "/" ? location === "/" : location.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.15s",
              background: isActive ? color + "18" : "transparent",
              color: isActive ? color : "hsl(210 18% 55%)",
              border: isActive ? `1px solid ${color}35` : "1px solid transparent",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isActive ? color : "transparent",
                boxShadow: isActive ? `0 0 6px ${color}` : "none",
                transition: "all 0.15s",
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
      <NavBar />
    </QueryClientProvider>
  );
}
