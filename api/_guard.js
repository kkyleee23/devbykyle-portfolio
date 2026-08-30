const ALLOWED = [
  "https://devbykyle.vercel.app",
  "https://devbykyle-portfolio.vercel.app",
];

export function clientIp(req) {
  return (
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export function sameOrigin(req) {
  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";
  if (!origin && !referer) return true;
  const dev = process.env.VERCEL_ENV !== "production";
  const ok = (u) =>
    ALLOWED.some((a) => u === a || u.startsWith(a + "/")) ||
    (dev && /^https?:\/\/localhost(:\d+)?/.test(u)) ||
    /\.vercel\.app/.test(u);
  if (origin) return ok(origin);
  return ok(referer);
}

const buckets = new Map();

export function tooFast(key, max, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
    }
  }
  return false;
}
