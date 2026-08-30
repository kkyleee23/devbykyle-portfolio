const base = (u) => (u || "").replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Use GET." });
  }

  const url = base(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(200).json({ items: [] });

  try {
    const r = await fetch(
      `${url}/rest/v1/recommendations?select=name,role,body,created_at&approved=eq.true&order=created_at.desc&limit=12`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!r.ok) {
      console.error("supabase select", r.status);
      return res.status(200).json({ items: [] });
    }
    const items = await r.json();
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    return res.status(200).json({ items: Array.isArray(items) ? items : [] });
  } catch (err) {
    console.error("recommendations", err);
    return res.status(200).json({ items: [] });
  }
}
