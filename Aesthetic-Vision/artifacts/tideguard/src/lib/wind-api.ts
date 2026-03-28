export interface WindData {
  speed: number;
  direction: number;
  unit: string;
  isOnshore: boolean;
  directionLabel: string;
  timestamp: string;
}

export function getWindDirectionLabel(degrees: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(degrees / 22.5) % 16];
}

export function isOnshoreWind(directionDegrees: number): boolean {
  return directionDegrees >= 180 && directionDegrees <= 360;
}

export async function fetchWindData(lat: number, lng: number): Promise<WindData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Wind API error: ${res.status}`);
  const json = await res.json() as {
    current_weather: { windspeed: number; winddirection: number; time: string };
  };
  const { windspeed, winddirection, time } = json.current_weather;
  return {
    speed: windspeed,
    direction: winddirection,
    unit: "km/h",
    isOnshore: isOnshoreWind(winddirection),
    directionLabel: getWindDirectionLabel(winddirection),
    timestamp: time,
  };
}
