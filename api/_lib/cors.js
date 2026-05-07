const ALLOWED_ORIGINS = new Set([
  "https://dreambible.app",
  "https://dream-bible.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

export function setCors(res, req) {
  const origin = req?.headers?.origin ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://dreambible.app";
  res.setHeader("Access-Control-Allow-Origin", allowed);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
