
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  site, about, timeline, currentFocus, whatIBuild, howIWork, quickFacts, colophon,
} from "../src/data/site.js";
import { projects, nowCards, services, terminalTools, terminalShots } from "../src/data/projects.js";
import { stack } from "../src/data/stack.js";
import { icons, linkKinds } from "../src/data/icons.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const BG = "#0a0a0b";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let markerN = 0;
const marker = (label) => {
  markerN += 1;
  return `<h2 class="marker"><span class="marker-n" aria-hidden="true">${String(markerN).padStart(2, "0")}</span><span aria-hidden="true">&lt;</span>${esc(label)}<span aria-hidden="true">/&gt;</span></h2>`;
};

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

const nav = `
<nav class="nav" aria-label="Primary">
  <div class="dock">
    <span class="dock-progress" data-progress aria-hidden="true"></span>
    <a class="mark" href="#top" aria-label="devByKyle, back to top"><span class="mark-full"><span>dev</span>ByKyle</span><span class="mark-mini" aria-hidden="true">&lt;/&gt;</span></a>
    <div class="nav-links">
      <a href="#top">Home</a>
      <a href="#about">About</a>
      <a href="#work">Projects</a>
      <a href="#services">Hire</a>
      <a href="#stack">Tech</a>
      <a href="#tools">Tools</a>
      <a href="#recommend">Recommend</a>
    </div>
    <button type="button" class="dock-toggle" data-theme-toggle aria-pressed="false" aria-label="Switch to light mode" title="Theme">${icons.moon}${icons.sun}</button>
    <button type="button" class="dock-toggle" data-sfx aria-pressed="false" aria-label="Sound effects" title="Sound effects">${icons.soundOff}${icons.soundOn}</button>
    <a class="btn btn-solid nav-cta" href="mailto:${esc(site.email)}">${icons.mail}<span class="btn-label">Get in touch</span></a>
  </div>
</nav>`;

const hero = `
<header class="hero" id="top">
  <div class="shell">
    <p class="kicker">${esc(site.kicker)}</p>

    <div class="id-row">
      <div class="avatar" data-avatar tabindex="0">
        <img src="/img/kyle-portrait.webp" width="480" height="480" alt="${esc(site.name)}" fetchpriority="high">
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
      <button type="button" class="btn btn-ghost" data-kit-open>${icons.bot}Ask about me</button>
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

const aboutSection = `
<section class="band" id="about">
  <div class="shell">
    ${marker("ABOUT")}
    <div class="about-grid">
      <div class="about-prose">
        ${about.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>
      <aside class="activity" data-activity data-repos="Studs,Planora-Official,PrintScreen,kkyleee23" data-user="${esc(site.githubHandle)}">
        <p class="act-head"><span>Recent commits</span><a href="${esc(site.github)}">on GitHub</a></p>
        <div class="act-grid" data-act-grid aria-hidden="true"></div>
        <ol class="act-list" data-act-list>
          <li class="act-load">Loading activity</li>
        </ol>
      </aside>
    </div>
  </div>
</section>`;

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

function frame(shots, label, single) {
  const multi = shots.length > 1;
  const slides = shots
    .map(
      (s, i) =>
        `<figure class="shot-slide${i === 0 ? " on" : ""}"><img src="${esc(s.src)}" width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" loading="lazy" decoding="async"></figure>`,
    )
    .join("");
  const dots = shots
    .map(
      (_, i) =>
        `<button type="button" class="shot-dot${i === 0 ? " on" : ""}" data-dot="${i}" aria-label="Image ${i + 1} of ${shots.length}"></button>`,
    )
    .join("");
  return `<div class="shotframe${single ? " single" : ""}"${multi ? " data-gallery" : ""}>
    <div class="chrome" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="shot-stage">${slides}</div>
    ${
      multi
        ? `<button type="button" class="shot-nav prev" data-prev aria-label="Previous image">&lsaquo;</button>
    <button type="button" class="shot-nav next" data-next aria-label="Next image">&rsaquo;</button>
    <p class="shot-count" data-count>1 / ${shots.length}</p>
    <div class="shot-dots">${dots}</div>`
        : ""
    }
  </div>`;
}

function media(p) {
  if (p.kind === "web" && p.shots.length) return frame(p.shots, p.name);
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
          <div class="proj-links">${p.links.map((l) => plink(l, p.name)).join("")}${
            p.study
              ? `<button type="button" class="btn btn-ghost" data-study="${esc(p.slug)}" aria-expanded="false" aria-controls="study-${esc(p.slug)}">${icons.spark}<span data-study-label>Read the write-up</span></button>`
              : ""
          }</div>
          ${
            p.study
              ? `<div class="study" id="study-${esc(p.slug)}" hidden>
            <dl>
              <div><dt>The problem</dt><dd>${esc(p.study.problem)}</dd></div>
              <div><dt>What I did</dt><dd>${esc(p.study.approach)}</dd></div>
              <div><dt>What broke</dt><dd>${esc(p.study.broke)}</dd></div>
              <div><dt>What is next</dt><dd>${esc(p.study.next)}</dd></div>
            </dl>
          </div>`
              : ""
          }
        </div>
      </article>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

const stackSection = `
<section class="band" id="stack">
  <div class="shell">
    ${marker("TECH-STACK")}
    <p class="legend"><span class="dot"></span> Used in shipped, public code. The rest I am still building fluency in</p>
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

const servicesSection = `
<section class="band" id="services">
  <div class="shell">
    ${marker("WHAT-I-CAN-BUILD")}
    <p class="sub">Three shapes of work I have already done end to end. If yours looks like
      one of these, the fastest thing is to send a paragraph about it.</p>
    <div class="svc">
      ${services
        .map(
          (s, i) => `<article class="svc-card rise">
        <span class="svc-n">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.body)}</p>
        <p class="svc-fit">${esc(s.fit)}</p>
      </article>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

const tools = `
<section class="band" id="tools">
  <div class="shell">
    ${marker("TERMINAL-TOOLS")}
    <p class="sub">Two command-line tools, one defensive and one not. Both sit outside the
      web work, and neither is on GitHub yet.</p>
    <div class="tool-shot">${frame(terminalShots, "Terminal tools")}</div>
    <div class="tools">
      ${terminalTools
        .map(
          (t) => `<article class="tool rise">
        <div class="tool-top">
          <div>
            <h3>${esc(t.name)}</h3>
            <p class="tool-tag">${esc(t.tagline)}</p>
          </div>
          ${badge(t.statusLabel, t.status)}
        </div>
        <p class="tool-body">${esc(t.body)}</p>
        ${spec(t.spec)}
        ${
          t.features.length
            ? `<ul class="tool-feat" role="list">${t.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`
            : ""
        }
        <p class="tool-note">${esc(t.note)}</p>
        ${t.cta ? `<a class="tool-cta" href="mailto:${esc(site.email)}?subject=${encodeURIComponent(t.name)}">${icons.mail}${esc(t.cta)}</a>` : ""}
      </article>`,
        )
        .join("")}
    </div>
  </div>
</section>`;


const askChips = [
  "What has he actually shipped?",
  "Is he free for an internship?",
  "What is he strongest at?",
];

const kit = `
<div class="kit" data-chat>
  <button type="button" class="kit-fab" data-kit-toggle aria-expanded="false" aria-controls="kit-panel" aria-label="Ask Kit">
    ${icons.bot}
    <span class="kit-pulse" aria-hidden="true"></span>
  </button>
  <div class="kit-panel" id="kit-panel" hidden>
    <div class="kit-head">
      <span class="kit-id">${icons.bot}<span><b>Kit</b><i>answers from this page only</i></span></span>
      <button type="button" class="kit-x" data-kit-close aria-label="Close">&times;</button>
    </div>
    <div class="chat-log" data-log role="log" aria-live="polite" aria-label="Conversation">
      <div class="msg msg-bot"><p>I&rsquo;m Kit. Ask about what Kyle has shipped, what he uses, or when he is free.</p></div>
    </div>
    <div class="chat-chips">
      ${askChips.map((q) => `<button type="button" class="ask-chip" data-q="${esc(q)}">${esc(q)}</button>`).join("")}
    </div>
    <form class="chat-form" data-form>
      <label class="sr-only" for="ask-input">Ask a question about Kyle</label>
      <input id="ask-input" type="text" autocomplete="off" maxlength="300" placeholder="Ask Kit something&hellip;" data-input>
      <button class="btn btn-solid" type="submit" data-send aria-label="Send">${icons.spark}</button>
    </form>
    <p class="chat-note">Answers are generated and can be wrong. Nothing you type is stored.</p>
  </div>
</div>`;
const recommendations = `
<section class="band" id="recommend">
  <div class="shell">
    ${marker("RECOMMENDATIONS")}
    <p class="sub">If we have worked together, or you have used something I built, a short
      note here is worth more than anything I can say about myself.</p>

    <div class="rec-wrap">
      <ol class="rec-list" data-rec-list>
        <li class="rec-empty">Loading</li>
      </ol>

      <form class="rec-form" data-rec-form>
        <p class="rec-head">Leave one</p>
        <label class="sr-only" for="rec-name">Your name</label>
        <input id="rec-name" name="name" type="text" placeholder="Your name" maxlength="60" required autocomplete="name">
        <label class="sr-only" for="rec-role">Your role or company, optional</label>
        <input id="rec-role" name="role" type="text" placeholder="Role or company, optional" maxlength="80" autocomplete="organization">
        <div class="rec-rate" role="radiogroup" aria-label="Your rating" data-rate>
          <span class="rec-rate-label">Rating</span>
          <div class="rec-stars-in">
            ${[5, 4, 3, 2, 1]
              .map(
                (n) =>
                  `<input class="sr-only" type="radio" name="rating" id="rec-star-${n}" value="${n}"><label for="rec-star-${n}" aria-label="${n} star${n > 1 ? "s" : ""}">${icons.star}</label>`,
              )
              .join("")}
          </div>
        </div>
        <label class="sr-only" for="rec-body">Your recommendation</label>
        <textarea id="rec-body" name="body" rows="4" placeholder="What did we work on, and how did it go?" minlength="20" maxlength="600" required></textarea>
        <label class="sr-only" for="rec-contact">Email, optional, never published</label>
        <input id="rec-contact" name="contact" type="email" placeholder="Email, optional. Never published" maxlength="120" autocomplete="email">
        <div class="rec-bot" aria-hidden="true">
          <label for="rec-website">Leave this empty</label>
          <input id="rec-website" name="website" type="text" tabindex="-1" autocomplete="off">
        </div>
        <button class="btn btn-solid" type="submit" data-rec-send>Send it</button>
        <p class="rec-note" data-rec-note>Reviewed before it appears. Your email is never shown.</p>
      </form>
    </div>
  </div>
</section>`;


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

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.name)} &mdash; ${esc(site.role)}</title>
<meta name="description" content="${esc(site.headline + " " + site.lede)}">
<meta name="theme-color" content="${BG}">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${esc(site.url)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/favicon-16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.short)}">
<meta property="og:locale" content="en_PH">
<meta property="og:title" content="${esc(site.name)} &mdash; ${esc(site.role)}">
<meta property="og:description" content="${esc(site.headline + " " + site.lede.split(". ")[0] + ".")}">
<meta property="og:url" content="${esc(site.url)}">
<meta property="og:image" content="${esc(site.url)}/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)}, ${esc(site.role)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(site.name)} &mdash; ${esc(site.role)}">
<meta name="twitter:description" content="${esc(site.headline)}">
<meta name="twitter:image" content="${esc(site.url)}/img/og.png">
<link rel="preload" href="/fonts/instrument-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/bricolage-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/schibsted-latin.woff2" as="font" type="font/woff2" crossorigin>
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
${servicesSection}
${stackSection}
${tools}
${timelineSection}
${recommendations}
</main>
${footer}
${kit}

<div class="pal" data-pal hidden>
  <div class="pal-box" role="dialog" aria-modal="true" aria-label="Jump to a section">
    <input type="text" data-pal-input placeholder="Jump to a section, or type a question for Kit" autocomplete="off">
    <ul class="pal-list" data-pal-list role="listbox"></ul>
    <p class="pal-foot"><kbd>&uarr;</kbd><kbd>&darr;</kbd> move <kbd>&crarr;</kbd> open <kbd>esc</kbd> close</p>
  </div>
</div>
<div class="page-fade" aria-hidden="true"></div>
</body>
</html>
`;

writeFileSync(join(root, "index.html"), html, "utf8");
console.log(
  `index.html - ${(html.length / 1024).toFixed(0)}KB | ${projects.length} projects | ${stack.reduce((a, g) => a + g.tools.length, 0)} tools`,
);
