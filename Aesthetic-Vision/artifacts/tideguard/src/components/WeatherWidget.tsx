import { useEffect, useState } from "react";
import { Cloud, Droplets, Wind } from "lucide-react";
import type { WeatherData } from "@/lib/weather-api";
import { fetchWeatherData, getWeatherDescription } from "@/lib/weather-api";

interface WeatherWidgetProps {
  lat: number;
  lng: number;
}

export default function WeatherWidget({ lat, lng }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await fetchWeatherData(lat, lng);
        setWeather(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
    const interval = setInterval(loadWeather, 600000); // Update every 10 minutes
    return () => clearInterval(interval);
  }, [lat, lng]);

  if (!weather && !loading) return null;

  const weatherDesc = weather ? getWeatherDescription(weather.weatherCode) : null;

  return (
    <div
      className="absolute bottom-6 right-6 z-[999] rounded-xl p-4 backdrop-blur-xl transition-all duration-300"
      style={{
        background: "rgba(6, 12, 22, 0.85)",
        border: "1px solid rgba(0, 196, 228, 0.15)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        width: 280,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: "rgba(0, 196, 228, 0.12)",
              border: "1px solid rgba(0, 196, 228, 0.25)",
            }}
          >
            <Cloud size={13} style={{ color: "hsl(191 90% 46%)" }} />
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Weather
          </div>
        </div>
        <div
          className="text-[8px] font-mono px-1.5 py-0.5 rounded"
          style={{
            background: "rgba(0, 196, 228, 0.1)",
            border: "1px solid rgba(0, 196, 228, 0.2)",
            color: "hsl(191 90% 46%)",
          }}
        >
          LIVE
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-6 rounded bg-white/5 animate-pulse w-2/3" />
          <div className="h-3 rounded bg-white/5 animate-pulse w-1/2" />
        </div>
      ) : error ? (
        <div className="text-[11px] text-orange-400">Unable to load weather</div>
      ) : weather && weatherDesc ? (
        <>
          {/* Temperature & Condition */}
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{weatherDesc.icon}</div>
            <div>
              <div className="text-2xl font-bold text-white">{weather.temperature}°F</div>
              <div className="text-xs text-muted-foreground">{weatherDesc.description}</div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Humidity */}
            <div
              className="rounded-lg p-2.5"
              style={{
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.15)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Droplets size={11} style={{ color: "#3b82f6" }} />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Humidity</span>
              </div>
              <div className="text-sm font-semibold text-white">{weather.humidity}%</div>
            </div>

            {/* Precip Probability */}
            <div
              className="rounded-lg p-2.5"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Droplets size={11} style={{ color: "#ef4444" }} />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Rain</span>
              </div>
              <div className="text-sm font-semibold text-white">{weather.precipitationProbability}%</div>
            </div>

            {/* Wind Speed */}
            <div
              className="rounded-lg p-2.5 col-span-2"
              style={{
                background: "rgba(0, 196, 228, 0.08)",
                border: "1px solid rgba(0, 196, 228, 0.15)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Wind size={11} style={{ color: "hsl(191 90% 46%)" }} />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Wind</span>
              </div>
              <div className="text-sm font-semibold text-white">{weather.windSpeed} mph</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-white/5">
            <div className="text-[9px] text-muted-foreground text-center">
              Open-Meteo • {Math.abs(lat).toFixed(2)}°, {Math.abs(lng).toFixed(2)}°
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
