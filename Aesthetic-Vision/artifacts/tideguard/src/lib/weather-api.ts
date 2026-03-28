export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  timestamp: string;
}

export interface WeatherDescription {
  icon: string;
  description: string;
}

export function getWeatherDescription(code: number): WeatherDescription {
  const descriptions: Record<number, WeatherDescription> = {
    0: { icon: "☀️", description: "Clear sky" },
    1: { icon: "🌤️", description: "Mainly clear" },
    2: { icon: "⛅", description: "Partly cloudy" },
    3: { icon: "☁️", description: "Overcast" },
    45: { icon: "🌫️", description: "Foggy" },
    48: { icon: "🌫️", description: "Fog & frost" },
    51: { icon: "🌧️", description: "Light drizzle" },
    53: { icon: "🌧️", description: "Moderate drizzle" },
    55: { icon: "🌧️", description: "Dense drizzle" },
    61: { icon: "🌧️", description: "Slight rain" },
    63: { icon: "🌧️", description: "Moderate rain" },
    65: { icon: "⛈️", description: "Heavy rain" },
    71: { icon: "❄️", description: "Slight snow" },
    73: { icon: "❄️", description: "Moderate snow" },
    75: { icon: "❄️", description: "Heavy snow" },
    80: { icon: "🌦️", description: "Slight showers" },
    81: { icon: "🌦️", description: "Moderate showers" },
    82: { icon: "⛈️", description: "Violent showers" },
    95: { icon: "⛈️", description: "Thunderstorm" },
    96: { icon: "⛈️", description: "Hail" },
    99: { icon: "⛈️", description: "Heavy hail" },
  };

  return descriptions[code] || { icon: "🌡️", description: "Unknown" };
}

export async function fetchWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lng}&` +
    `current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m&` +
    `temperature_unit=fahrenheit`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const json = await res.json() as {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      precipitation_probability: number;
      weather_code: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
      time: string;
    };
  };

  const { temperature_2m, relative_humidity_2m, precipitation_probability, weather_code, wind_speed_10m, wind_direction_10m, time } = json.current;

  return {
    temperature: Math.round(temperature_2m),
    humidity: relative_humidity_2m,
    precipitationProbability: precipitation_probability,
    weatherCode: weather_code,
    windSpeed: Math.round(wind_speed_10m),
    windDirection: wind_direction_10m,
    timestamp: time,
  };
}
