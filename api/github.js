const USER = "kkyleee23";
const REPOS = ["Studs", "Planora-Official", "PrintScreen", "kkyleee23"];

const headers = () => {
  const h = { Accept: "application/vnd.github+json", "User-Agent": "devbykyle-site" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Use GET." });
  }

  try {
    const [repoRes, ...commitRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
        headers: headers(),
      }),
      ...REPOS.map((r) =>
        fetch(`https://api.github.com/repos/${USER}/${r}/commits?per_page=20`, {
          headers: headers(),
        }),
      ),
    ]);

    const repos = repoRes.ok
      ? (await repoRes.json())
          .filter((r) => !r.fork && r.name.toLowerCase() !== USER.toLowerCase())
          .slice(0, 6)
          .map((r) => ({
            name: r.name,
            html_url: r.html_url,
            description: r.description,
            language: r.language,
            pushed_at: r.pushed_at,
            homepage: r.homepage,
          }))
      : [];

    const commits = [];
    for (let i = 0; i < commitRes.length; i++) {
      const r = commitRes[i];
      if (!r.ok) continue;
      const j = await r.json();
      if (!Array.isArray(j)) continue;
      for (const c of j) {
        commits.push({
          repo: REPOS[i],
          msg: String(c.commit?.message ?? "").split("\n")[0],
          date: String(c.commit?.author?.date ?? ""),
          url: String(c.html_url ?? ""),
        });
      }
    }
    commits.sort((a, b) => +new Date(b.date) - +new Date(a.date));

    if (!repos.length && !commits.length) {
      return res.status(502).json({ error: "GitHub did not answer." });
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=86400",
    );
    return res.status(200).json({ repos, commits: commits.slice(0, 120) });
  } catch {
    return res.status(502).json({ error: "Could not reach GitHub." });
  }
}
