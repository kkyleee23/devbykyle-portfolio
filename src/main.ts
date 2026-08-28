import "./style.css";

/* ------------------------------------------------------------------
   Scroll reveal. Fires once per element, then stops observing.
   ------------------------------------------------------------------ */

function reveal() {
  const items = document.querySelectorAll<HTMLElement>(".rise");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).classList.add("in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 4) * 50}ms`;
    io.observe(el);
  });
}

/* ------------------------------------------------------------------
   Active nav link, driven by which section is on screen.
   ------------------------------------------------------------------ */

function activeNav() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>(".nav-links a")];
  const map = new Map<Element, HTMLAnchorElement>();
  for (const a of links) {
    const id = a.getAttribute("href")?.slice(1);
    const el = id && document.getElementById(id);
    if (el) map.set(el, a);
  }
  if (!map.size || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const a = map.get(e.target);
        if (!a) continue;
        if (e.isIntersecting) {
          links.forEach((l) => l.removeAttribute("aria-current"));
          a.setAttribute("aria-current", "true");
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  map.forEach((_, el) => io.observe(el));
}

/* ------------------------------------------------------------------
   Live repositories. Real data beats a decorative graph — and if the
   API is unreachable the panel says so rather than rendering nothing.
   ------------------------------------------------------------------ */

type Repo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  fork: boolean;
  homepage: string | null;
};

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));

async function repos() {
  const host = document.getElementById("repos");
  const handle = host?.dataset.handle;
  if (!host || !handle) return;

  try {
    const res = await fetch(
      `https://api.github.com/users/${handle}/repos?per_page=100&sort=pushed`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) throw new Error(String(res.status));

    const list: Repo[] = await res.json();
    const shown = list
      .filter((r) => !r.fork && r.name.toLowerCase() !== handle.toLowerCase())
      .slice(0, 6);

    if (!shown.length) throw new Error("empty");

    host.innerHTML = shown
      .map(
        (r) => `<article class="repo">
  <a class="repo-name" href="${esc(r.html_url)}">${esc(r.name)}</a>${
    r.homepage
      ? ` <a class="repo-meta" style="display:inline" href="${esc(r.homepage)}">live &#8599;</a>`
      : ""
  }
  ${r.description ? `<p>${esc(r.description)}</p>` : ""}
  <span class="repo-meta">${esc(r.language ?? "—")} · updated ${when(r.pushed_at)}</span>
</article>`,
      )
      .join("");
  } catch {
    host.innerHTML = `<p class="repo repo-meta">Could not reach the GitHub API just now — <a href="https://github.com/${esc(
      handle,
    )}" style="border-bottom:1px solid var(--line-3)">browse the repos directly</a>.</p>`;
  }
}

reveal();
activeNav();
void repos();
