const IMMUTABLE = "public, max-age=31536000, immutable";
const DAY = "public, max-age=86400";

export function buildRoutes({ apiOrigin, security }) {
  return [
    {
      src: "^/assets/(.*)$",
      headers: { "Cache-Control": IMMUTABLE },
      continue: true,
    },
    {
      src: "^/(themes|models|runs)/(.*)$",
      headers: { "Cache-Control": DAY },
      continue: true,
    },
    {
      src: "^/(.*)$",
      headers: { ...security, "Strict-Transport-Security": "max-age=63072000; includeSubDomains" },
      continue: true,
    },
    { src: "^/api/(.*)$", dest: `${apiOrigin}/api/$1` },
    { handle: "filesystem" },
    { src: "^/play/?$", dest: "/play/index.html" },
    { src: "^/(assets|themes|models|runs)/(.*)$", status: 404 },
    { src: "^/(.*)$", dest: "/__spa-fallback.html" },
  ];
}
