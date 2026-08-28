// Builds index.html from src/data. Run via `npm run gen` (or automatically on build).
// The page is static HTML on purpose — the only JS that ships is the GitHub fetch
// and the scroll reveal.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { site, about, timeline } from "../src/data/site.js";
import { projects, nowCards } from "../src/data/projects.js";
import { stack } from "../src/data/stack.js";
import { icons, linkKinds } from "../src/data/icons.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Keep in step with --bg in style.css. */
const BG = "#0a0a0b";

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const tags = (items) =>
  `<ul class="tags" role="list">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

const spec = (items) =>
  items.length
    ? `<ul class="spec" role="list">${items.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`
    : "";

const badge = (label, status) =>
  `<span class="badge${status === "live" ? " badge-live" : ""}">${esc(label)}</span>`;

const plink = (l, project) => {
  const k = linkKinds[l.kind];
  return `<a class="btn ${k.strong ? "btn-solid" : "btn-ghost"}" href="${esc(l.href)}">${icons[k.icon]}${esc(k.label)}<span class="sr-only"> — ${esc(project)}</span></a>`;
};

/* ---------------- sections ---------------- */

const nav = `
<nav class="nav">
  <div class="shell nav-in">
    <a class="mark" href="#top"><span>dev</span>ByKyle</a>
    <div class="nav-links">
      <a href="#top">Home</a>
      <a href="#work">Projects</a>
      <a href="#stack">Stack</a>
      <a href="#github">GitHub</a>
      <a href="#about">About</a>
    </div>
    ${site.openToWork ? `<p class="status"><span class="dot" aria-hidden="true"></span> Open to work</p>` : ""}
    <a class="btn btn-ghost" href="mailto:${esc(site.email)}">${icons.mail}<span class="btn-label">Get in touch</span></a>
  </div>
</nav>`;

const hero = `
<header class="hero" id="top">
  <div class="shell hero-grid">
    <div>
      <p class="eyebrow rise">${esc(site.name)} — ${esc(site.role)}</p>
      <h1 class="rise">${esc(site.headline)}</h1>
      <p class="lede rise">${esc(site.lede)}</p>
      <div class="hero-meta rise">
        <span>${esc(site.location)} · ${esc(site.timezone)}</span>
        <span>${esc(site.school)}</span>
        <span>${esc(site.availability)}</span>
      </div>
      <div class="hero-cta rise">
        <a class="btn btn-solid" href="mailto:${esc(site.email)}">${icons.mail}Email me</a>
        <a class="btn btn-ghost" href="${esc(site.github)}">${icons.github}GitHub</a>
        ${site.linkedin ? `<a class="btn btn-ghost" href="${esc(site.linkedin)}">LinkedIn</a>` : ""}
      </div>
    </div>
    <div class="portrait rise">
      <img src="/img/kyle.jpg" width="1728" height="1736" alt="${esc(site.name)}, ${esc(site.role)}" fetchpriority="high">
    </div>
  </div>
</header>`;

const now = `
<section class="band" id="now">
  <div class="shell">
    <p class="eyebrow">Right now</p>
    <h2 class="h-sec">What I&rsquo;m building and what I&rsquo;m learning.</h2>
    <div class="cards">
      ${nowCards
        .map(
          (c) => `<article class="card rise">
        <div class="card-top"><h3>${esc(c.title)}</h3>${badge(c.badge, c.status)}</div>
        <p>${esc(c.body)}</p>
        ${tags(c.tags)}
        <p class="card-foot">${esc(c.foot)}</p>
      </article>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

function media(p) {
  if (p.kind === "phone" && p.shots.length) {
    return `<div class="phones">${p.shots
      .slice(0, 3)
      .map(
        (s) =>
          `<figure><img src="${esc(s.src)}" width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" loading="lazy" decoding="async"></figure>`,
      )
      .join("")}</div>`;
  }
  if (p.kind === "web" && p.shots.length) {
    const s = p.shots[0];
    return `<div class="web"><div class="chrome" aria-hidden="true"><span></span><span></span><span></span></div>
      <img src="${esc(s.src)}" width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" loading="lazy" decoding="async"></div>`;
  }
  return `<div class="noshot">${esc(p.name)} — screenshot to come</div>`;
}

const work = `
<section class="band band-loud" id="work">
  <div class="shell">
    <p class="eyebrow">Selected work</p>
    <h2 class="h-sec">Three shipped tools, one problem.</h2>
    <p class="sub">Everything here started as something that annoyed me at school. Each links to the source, and to the live build where there is one.</p>
    <div class="work">
      ${projects
        .map((p, i) => {
          const idx = String(i + 1).padStart(2, "0");
          const head = `
          <div>
            <div class="proj-head">
              <span class="proj-idx" aria-hidden="true">${idx}</span>
              ${badge(p.statusLabel, p.status)}
            </div>
            <h3>${esc(p.name)}</h3>
            <p class="desc">${esc(p.summary)}</p>
            ${spec(p.spec)}
            ${tags(p.tags)}
            <div class="proj-links">
              ${p.links.map((l) => plink(l, p.name)).join("")}
            </div>
          </div>`;
          return `<article class="proj rise${p.feature ? " feature" : ""}">
            ${head}
            <div class="proj-media">${media(p)}</div>
          </article>`;
        })
        .join("")}
    </div>
  </div>
</section>`;

const stackSection = `
<section class="band band-quiet" id="stack">
  <div class="shell">
    <p class="eyebrow">Stack</p>
    <h2 class="h-sec">What I reach for</h2>
    <p class="sub">Everything I work with. The marked ones you can go and read in a public repo today.</p>
    <p class="legend"><span class="dot"></span> Used in shipped, public code</p>
    <div class="stack">
      ${stack
        .map(
          (g) => `<div class="cat">
        <div class="cat-head"><h3>${esc(g.label)}</h3><span>${g.tools.length}</span></div>
        <ul class="chips" role="list">
          ${g.tools
            .map(
              (t) =>
                `<li class="chip${t.shipped ? " shipped" : ""}" style="--bc:${t.darkColor ?? t.color}"><svg viewBox="${t.box}" aria-hidden="true">${t.svg}</svg>${esc(t.name)}${t.shipped ? '<span class="dot" role="img" aria-label="used in shipped public code"></span>' : ""}</li>`,
            )
            .join("")}
        </ul>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

const github = `
<section class="band" id="github">
  <div class="shell">
    <p class="eyebrow">GitHub</p>
    <h2 class="h-sec">Where the work lives</h2>
    <p class="sub">Pulled live from the GitHub API, so this page cannot drift out of date with the code.</p>
    <div class="gh">
      <div class="gh-top">
        <a href="${esc(site.github)}">github.com/${esc(site.githubHandle)}</a>
        <span>Shipped Mar &amp; May 2026</span>
      </div>
      <div id="repos" data-handle="${esc(site.githubHandle)}">
        <p class="repo repo-meta">Loading repositories…</p>
      </div>
    </div>
  </div>
</section>`;

const aboutSection = `
<section class="band" id="about">
  <div class="shell">
    <p class="eyebrow">Background</p>
    <h2 class="h-sec">How I got here</h2>
    <div class="about-prose">${about.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    <div class="tl">
      ${timeline
        .map(
          (t) => `<div class="tl-row rise">
        <p class="tl-when">${esc(t.when)}</p>
        <div><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></div>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

const contact = `
<section class="contact" id="contact">
  <div class="shell">
    <p class="eyebrow">Contact</p>
    <h2>Got something that needs building?</h2>
    <p>Open to internships, junior roles and freelance work — remote, or hybrid around Pampanga and Metro Manila. I&rsquo;m in school on weekdays but free from 2 PM, and all day Sunday. I reply within a day.</p>
    <a class="mailto" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
  </div>
</section>`;

const footer = `
<footer class="shell foot">
  <p>© ${new Date().getFullYear()} ${esc(site.name)} · ${esc(site.location)}</p>
  <nav>
    <a href="${esc(site.github)}">GitHub</a>
    <a href="mailto:${esc(site.email)}">Email</a>
    ${site.linkedin ? `<a href="${esc(site.linkedin)}">LinkedIn</a>` : ""}
  </nav>
</footer>`;

/* ---------------- document ---------------- */

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add("js")</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.name)} — ${esc(site.role)}</title>
<meta name="description" content="${esc(site.headline + " " + site.lede)}">
<meta name="theme-color" content="${BG}">
<link rel="canonical" href="${esc(site.url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(site.name)} — ${esc(site.role)}">
<meta property="og:description" content="${esc(site.headline)}">
<meta property="og:url" content="${esc(site.url)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Instrument+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap">
<script type="module" src="/src/main.ts"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${nav}
<main id="main">
${hero}
${now}
${work}
${stackSection}
${github}
${aboutSection}
${contact}
</main>
${footer}
</body>
</html>
`;

writeFileSync(join(root, "index.html"), html, "utf8");
console.log(
  `index.html — ${(html.length / 1024).toFixed(0)}KB · ${projects.length} projects · ${stack.reduce((a, g) => a + g.tools.length, 0)} tools`,
);
