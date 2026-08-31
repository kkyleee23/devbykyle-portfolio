import { createHash } from "node:crypto";
import { clientIp, sameOrigin, tooFast } from "./_guard.js";

const LIMITS = { name: [2, 60], role: [0, 80], body: [20, 600], contact: [0, 120] };
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

const base = (u) => (u || "").replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

const clean = (v, max) =>
  String(v ?? "")
    .replace(/[ -]/g, " ")
    .trim()
    .slice(0, max);

const fail = (res, code, error) => res.status(code).json({ error });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return fail(res, 405, "Use POST.");
  }

  if (!sameOrigin(req)) return fail(res, 403, "Not allowed from here.");
  if (tooFast(`rec:${clientIp(req)}`, 1, 5000)) {
    return fail(res, 429, "One moment between submissions.");
  }

  const url = base(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return fail(res, 503, "Recommendations are not set up yet.");

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return fail(res, 400, "Bad request.");
    }
  }

  if (clean(body?.website, 40)) return res.status(200).json({ ok: true });

  const name = clean(body?.name, LIMITS.name[1]);
  const role = clean(body?.role, LIMITS.role[1]);
  const text = clean(body?.body, LIMITS.body[1]);
  const contact = clean(body?.contact, LIMITS.contact[1]);
  const rating = Math.trunc(Number(body?.rating));

  if (name.length < LIMITS.name[0]) return fail(res, 400, "Please give your name.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return fail(res, 400, "Please include a star rating from 1 to 5.");
  if (text.length < LIMITS.body[0])
    return fail(res, 400, "A recommendation needs at least 20 characters.");
  if (contact && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact))
    return fail(res, 400, "That email address does not look right.");

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  const ipHash = createHash("sha256")
    .update(ip + (process.env.IP_SALT || "devbykyle"))
    .digest("hex")
    .slice(0, 32);

  const rest = `${url}/rest/v1/recommendations`;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const recent = await fetch(
      `${rest}?select=id&ip_hash=eq.${ipHash}&created_at=gte.${since}`,
      { headers },
    );
    if (recent.ok) {
      const rows = await recent.json();
      if (Array.isArray(rows) && rows.length >= MAX_PER_WINDOW)
        return fail(res, 429, "That is a few already. Try again later.");
    }

    const row = {
      name,
      role: role || null,
      body: text,
      contact: contact || null,
      rating,
      ip_hash: ipHash,
    };
    const save = (payload) =>
      fetch(rest, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify(payload),
      });

    let insert = await save(row);
    if (!insert.ok) {
      const detail = (await insert.text()).slice(0, 200);
      if (/rating/i.test(detail)) {
        const { rating: _rating, ...withoutRating } = row;
        insert = await save(withoutRating);
      }
      if (!insert.ok) {
        console.error("supabase insert", insert.status, detail);
        return fail(res, 502, "Could not save that. Try again in a moment.");
      }
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("recommend", err);
    return fail(res, 502, "Could not save that. Try again in a moment.");
  }
}
