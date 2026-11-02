import type { SceneLook } from "../sky";

export function WeatherLayer({ look }: { look: SceneLook }) {
  const { weather } = look;
  const storm = weather === "thunderstorm";
  const rain = storm || weather === "rain" || weather === "drizzle";
  if (!rain && weather !== "fog") return null;
  return (
    <div aria-hidden="true" className="weather-layer" data-weather={weather}>
      {rain && <div className="weather-rain" data-dense={storm ? "" : undefined} />}
      {weather === "fog" && <div className="weather-fog" />}
      {storm && <div className="weather-storm" />}
      {storm && <div className="weather-flash" />}
    </div>
  );
}
