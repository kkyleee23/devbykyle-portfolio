// Builds index.html from src/data. Run via `npm run gen` (or automatically on build).
// Section order follows the reference layout: a dense hero info-panel, then
// labelled bands. The page is static HTML; the shipped JS only handles the
// clock, the reveal, the live GitHub fetch and the assistant.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  site, about, timeline, currentFocus, whatIBuild, howIWork, quickFacts, colophon,
} from "../src/data/site.js";
import { projects, nowCards } from "../src/data/projects.js";
import { stack } from "../src/data/stack.js";
import { icons, linkKinds } from "../src/data/icons.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Keep in step with --bg in style.css. */
const BG = "#0a0a0b";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The section marker motif: TECH-STACK rendered inside angle brackets. */
const marker = (label) =>
  `<h2 class="marker"><span aria-hidden="true">&lt;</span>${esc(label)}<span aria-hidden="true">/&gt;</span></h2>`;

const tags = (items) =>
  items.length
    ? `<ul class="tags" role="list">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
    : "";

const spec = (items) =>
  items.length
    ? `<ul class="spec" role="list">${items.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`
    : "";

const badge = (label, status) =>
  `<span class="badge${status === "live" ? " badge-live" : ""}">${esc(label)}</span>`;

const plink = (l, project) => {
  const k = linkKinds[l.kind];
  return `<a class="btn ${k.strong ? "btn-solid" : "btn-ghost"}" href="${esc(l.href)}">${icons[k.icon]}${esc(k.label)}<span class="sr-only"> &mdash; ${esc(project)}</span></a>`;
};

/* ---------------- nav ---------------- */

const nav = `
<nav class="nav" aria-label="Primary">
  <div class="dock">
    <a class="mark" href="#top"><span>dev</span>ByKyle</a>
    <div class="nav-links">
      <a href="#top">Home</a>
      <a href="#about">About</a>
      <a href="#work">Projects</a>
      <a href="#stack">Tech</a>
      <a href="#github">GitHub</a>
      <a href="#ask">Ask AI</a>
    </div>
    <button type="button" class="sfx-toggle" data-sfx aria-pressed="false" aria-label="Sound effects" title="Sound effects">${icons.soundOff}${icons.soundOn}</button>
    <a class="btn btn-solid nav-cta" href="mailto:${esc(site.email)}">${icons.mail}<span class="btn-label">Get in touch</span></a>
  </div>
</nav>`;

/* ---------------- hero ---------------- */

const hero = `
<header class="hero" id="top">
  <div class="shell">
    <p class="kicker">${esc(site.kicker)}</p>

    <div class="id-row">
      <div class="avatar" data-avatar tabindex="0">
        <img src="/img/kyle-formal.webp" width="520" height="520" alt="${esc(site.name)}" fetchpriority="high">
        <span class="av-ring" aria-hidden="true"></span>
      </div>
      <div class="id-text">
        ${site.openToWork ? `<p class="status"><span class="pip" aria-hidden="true"></span> Available for work</p>` : ""}
        <h1>${esc(site.name)}</h1>
        <p class="handle">${esc(site.handle)}</p>
      </div>
    </div>

    <p class="id-meta">
      <span>${esc(site.location)}</span>
      <span class="sep" aria-hidden="true">&bull;</span>
      <span>${esc(site.timezone)}</span>
      <span class="clock" data-tz="${esc(site.tz)}" aria-label="Local time in the Philippines">&middot; --:--</span>
    </p>
    <p class="id-meta">
      <span>${esc(site.school)} <span class="dim">@</span> ${esc(site.schoolShort)}</span>
      <span class="sep" aria-hidden="true">&bull;</span>
      <span>${esc(site.role)}</span>
    </p>

    <div class="hero-cta">
      <a class="btn btn-solid" href="mailto:${esc(site.email)}">${icons.mail}Send Email</a>
      <a class="btn btn-ghost" href="${esc(site.github)}">${icons.github}GitHub</a>
      <a class="btn btn-ghost" href="#ask">${icons.spark}Ask about me</a>
      ${site.resume ? `<a class="btn btn-ghost" href="${esc(site.resume)}">Resume</a>` : ""}
    </div>

    <div class="panels">
      <section class="panel">
        ${marker("CURRENT-FOCUS")}
        <p class="panel-body">${esc(currentFocus.body)}</p>
        <p class="motto">${esc(currentFocus.motto)}</p>
      </section>

      <section class="panel">
        ${marker("WHAT-I-BUILD")}
        <div class="rotator" data-rotate>
          ${whatIBuild
            .map(
              (b, i) => `<div class="rot-item${i === 0 ? " on" : ""}">
            <p class="rot-title">${esc(b.title)}</p>
            <p class="rot-note">${esc(b.note)}</p>
          </div>`,
            )
            .join("")}
        </div>
        <p class="panel-foot"><span>capability</span> <span data-rot-count>01 / 0${whatIBuild.length}</span></p>
      </section>

      <section class="panel">
        ${marker("HOW-I-WORK")}
        <ul class="principles" role="list">
          ${howIWork.map((h) => `<li><span aria-hidden="true">&rsaquo;</span> ${esc(h)}</li>`).join("")}
        </ul>
        <p class="panel-foot"><span>principles</span> <span>0${howIWork.length} focus</span></p>
      </section>

      <section class="panel panel-wide">
        ${marker("QUICK-FACTS")}
        <dl class="facts">
          ${quickFacts.map((f) => `<div><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join("")}
        </dl>
      </section>
    </div>
  </div>
</header>`;

/* ---------------- about ---------------- */

const aboutSection = `
<section class="band" id="about">
  <div class="shell">
    ${marker("ABOUT")}
    <div class="about-prose">
      ${about.map((p) => `<p>${esc(p)}</p>`).join("")}
    </div>
  </div>
</section>`;

/* ---------------- currently building ---------------- */

const building = `
<section class="band" id="now">
  <div class="shell">
    ${marker("CURRENTLY-BUILDING")}
    <div class="cards">
      ${nowCards
        .map(
          (c) => `<article class="card rise">
        <div class="card-top">
          <span class="card-when">${esc(c.foot)}</span>
          ${badge(c.badge, c.status)}
        </div>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.body)}</p>
        ${tags(c.tags)}
      </article>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

/* ---------------- projects ---------------- */

function media(p) {
  if (p.kind === "web" && p.shots.length) {
    const s = p.shots[0];
    return `<div class="web"><div class="chrome" aria-hidden="true"><span></span><span></span><span></span></div>
      <img src="${esc(s.src)}" width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" loading="lazy" decoding="async"></div>`;
  }
  return `<div class="noshot">${esc(p.name)} &mdash; screenshot to come</div>`;
}

const work = `
<section class="band" id="work">
  <div class="shell">
    ${marker("SELECTED-PROJECTS")}
    <div class="work">
      ${projects
        .map(
          (p, i) => `<article class="proj rise">
        <div class="proj-media">${media(p)}</div>
        <div class="proj-body">
          <div class="proj-head">
            <span class="proj-idx" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
            ${badge(p.statusLabel, p.status)}
          </div>
          <h3>${esc(p.name)}</h3>
          <p class="desc">${esc(p.summary)}</p>
          ${spec(p.spec)}
          ${tags(p.tags)}
          <div class="proj-links">${p.links.map((l) => plink(l, p.name)).join("")}</div>
        </div>
      </article>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

/* ---------------- tech stack ---------------- */

const stackSection = `
<section class="band" id="stack">
  <div class="shell">
    ${marker("TECH-STACK")}
    <p class="legend"><span class="dot"></span> Used in shipped, public code &mdash; the rest I am still building fluency in</p>
    <div class="tool-detail" id="tool-detail" data-detail hidden>
      <span class="td-icon" data-td-icon aria-hidden="true"></span>
      <div class="td-in">
        <p class="td-name" data-td-name></p>
        <p class="td-note" data-td-note></p>
        <p class="td-used" data-td-used></p>
      </div>
      <button type="button" class="td-close" data-td-close aria-label="Close">&times;</button>
    </div>
    <div class="stack">
      ${stack
        .map(
          (g, i) => `<div class="cat">
        <div class="cat-head">
          <span class="cat-n">${String(i + 1).padStart(2, "0")}</span>
          <h3>${esc(g.label)}</h3>
          <span class="cat-count">${g.tools.length} tools</span>
        </div>
        <ul class="chips" role="list">
          ${g.tools
            .map(
              (t) =>
                `<li><button type="button" class="chip${t.shipped ? " shipped" : ""}" style="--bc:${t.darkColor ?? t.color}" data-tool="${esc(t.name)}" data-used="${esc((t.usedIn ?? []).join(","))}" data-note="${esc(t.note ?? "")}" aria-expanded="false"><svg viewBox="${t.box}" aria-hidden="true">${t.svg}</svg>${esc(t.name)}${t.shipped ? '<span class="dot" aria-hidden="true"></span>' : ""}</button></li>`,
            )
            .join("")}
        </ul>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

/* ---------------- github ---------------- */

const github = `
<section class="band" id="github">
  <div class="shell">
    ${marker("GITHUB")}
    <div class="gh">
      <div class="gh-top">
        <a href="${esc(site.github)}">github.com/${esc(site.githubHandle)}</a>
        <span>live from the API</span>
      </div>
      <div id="repos" data-handle="${esc(site.githubHandle)}">
        <p class="repo repo-meta">Loading repositories&hellip;</p>
      </div>
    </div>
  </div>
</section>`;

/* ---------------- ask AI ---------------- */

const askChips = [
  "What has he actually shipped?",
  "Is he free for an internship?",
  "What is he strongest at?",
];

const ask = `
<section class="band" id="ask">
  <div class="shell">
    ${marker("ASK-AI")}
    <p class="sub">Meet <strong>Kit</strong> &mdash; it answers from the same facts on this page,
      so it cannot invent experience I do not have.</p>
    <div class="chat" data-chat>
      <div class="chat-log" data-log role="log" aria-live="polite" aria-label="Conversation">
        <div class="msg msg-bot"><p>I&rsquo;m Kit. I can answer questions about Kyle&rsquo;s work &mdash; what he has shipped, what he uses, when he is free. Try one of these, or ask your own.</p></div>
      </div>
      <div class="chat-chips">
        ${askChips.map((q) => `<button type="button" class="ask-chip" data-q="${esc(q)}">${esc(q)}</button>`).join("")}
      </div>
      <form class="chat-form" data-form>
        <label class="sr-only" for="ask-input">Ask a question about Kyle</label>
        <input id="ask-input" type="text" autocomplete="off" maxlength="300" placeholder="Ask Kit something&hellip;" data-input>
        <button class="btn btn-solid" type="submit" data-send>${icons.spark}Ask</button>
      </form>
      <p class="chat-note">Answers are generated and can be wrong. Nothing you type is stored.</p>
    </div>
  </div>
</section>`;

/* ---------------- timeline ---------------- */

const timelineSection = `
<section class="band" id="timeline">
  <div class="shell">
    ${marker("EXPERIENCE-TIMELINE")}
    <div class="tl">
      ${timeline
        .map(
          (t) => `<div class="tl-row rise">
        <div class="tl-when"><span>${esc(t.when)}</span><span class="tl-tag">${esc(t.tag)}</span></div>
        <div class="tl-what">
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.body)}</p>
          ${tags(t.tags)}
        </div>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

/* ---------------- footer ---------------- */

const footer = `
<footer class="foot-band">
  <div class="shell foot-grid">
    <div>
      ${marker("DIRECT-CONTACT")}
      <a class="mailto" href="mailto:${esc(site.email)}" data-copy="${esc(site.email)}">
        <span>${esc(site.email)}</span>
        <span class="copy-hint" aria-hidden="true">click to copy</span>
      </a>
      <p class="foot-note">Replies within a day. ${esc(site.availability)}.</p>
      <p class="foot-note">Good things to send: a backend that needs building, a capstone
        that needs finishing, an internal tool nobody has time for.</p>
    </div>
    <div>
      ${marker("COLOPHON")}
      <dl class="colophon">
        ${colophon.map((c) => `<div><dt>${esc(c.k)}</dt><dd>${esc(c.v)}</dd></div>`).join("")}
      </dl>
    </div>
    <div>
      ${marker("ELSEWHERE")}
      <ul class="foot-links" role="list">
        <li><a href="${esc(site.github)}">${icons.github}GitHub</a></li>
        ${site.linkedin ? `<li><a href="${esc(site.linkedin)}">LinkedIn</a></li>` : ""}
        <li><a href="mailto:${esc(site.email)}">${icons.mail}Email</a></li>
      </ul>
      <p class="foot-note">${esc(site.location)} · ${esc(site.timezone)}</p>
    </div>
  </div>
  <div class="shell foot-end">
    <p>© ${new Date().getFullYear()} ${esc(site.name)}</p>
    <p>Last updated ${new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date())}</p>
  </div>
</footer>`;

/* ---------------- document ---------------- */

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add("js")</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.name)} &mdash; ${esc(site.role)}</title>
<meta name="description" content="${esc(site.headline + " " + site.lede)}">
<meta name="theme-color" content="${BG}">
<link rel="canonical" href="${esc(site.url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(site.name)} &mdash; ${esc(site.role)}">
<meta property="og:description" content="${esc(site.headline)}">
<meta property="og:url" content="${esc(site.url)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/fonts/instrument-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/bricolage-latin.woff2" as="font" type="font/woff2" crossorigin>
<script type="module" src="/src/main.ts"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${nav}
<main id="main">
${hero}
${aboutSection}
${building}
${work}
${stackSection}
${github}
${ask}
${timelineSection}
</main>
${footer}
<div class="page-fade" aria-hidden="true"></div>
</body>
</html>
`;

writeFileSync(join(root, "index.html"), html, "utf8");
console.log(
  `index.html - ${(html.length / 1024).toFixed(0)}KB | ${projects.length} projects | ${stack.reduce((a, g) => a + g.tools.length, 0)} tools`,
);
