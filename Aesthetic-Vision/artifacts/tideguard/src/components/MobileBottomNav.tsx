import { Map, Newspaper, MessageSquare } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: "map" | "intel" | "chat";
  onTabChange: (tab: "map" | "intel" | "chat") => void;
  accentColor: string;
}

const tabs = [
  { id: "map" as const, label: "Map", Icon: Map },
  { id: "intel" as const, label: "Intel", Icon: Newspaper },
  { id: "chat" as const, label: "Chat", Icon: MessageSquare },
];

export default function MobileBottomNav({ activeTab, onTabChange, accentColor }: MobileBottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] flex items-stretch"
      style={{
        height: 56,
        background: "rgba(6, 12, 22, 0.95)",
        backdropFilter: "blur(24px) saturate(1.5)",
        WebkitBackdropFilter: "blur(24px) saturate(1.5)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150"
            style={{
              background: isActive ? accentColor + "12" : "transparent",
              color: isActive ? accentColor : "hsl(210 18% 45%)",
              minHeight: 56,
            }}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span
              className="text-[10px] font-semibold tracking-wide"
              style={{ opacity: isActive ? 1 : 0.7 }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
