import "./style.css";
import { link as linkIcon } from "./data/icons.js";

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/* ------------------------------------------------------------------
   Local clock. Shows what time it actually is where Kyle is, so a
   recruiter in another timezone knows whether they are messaging at 3am.
   ------------------------------------------------------------------ */

function clock() {
  const el = document.querySelector<HTMLElement>(".clock");
  const tz = el?.dataset.tz;
  if (!el || !tz) return;
  const fmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
  const tick = () => {
    el.textContent = `· ${fmt.format(new Date())} local`;
  };
  tick();
  setInterval(tick, 30_000);
}

/* ------------------------------------------------------------------
   Capability rotator. Pauses when off-screen or when the tab is hidden.
   ------------------------------------------------------------------ */

function rotator() {
  const host = document.querySelector<HTMLElement>("[data-rotate]");
  const count = document.querySelector<HTMLElement>("[data-rot-count]");
  if (!host) return;
  const items = [...host.querySelectorAll<HTMLElement>(".rot-item")];
  if (items.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let i = 0;
  let timer = 0;
  const show = () => {
    items.forEach((el, n) => el.classList.toggle("on", n === i));
    if (count) count.textContent = `0${i + 1} / 0${items.length}`;
  };
  const start = () => {
    if (timer) return;
    timer = window.setInterval(() => {
      i = (i + 1) % items.length;
      show();
    }, 3800);
  };
  const stop = () => {
    clearInterval(timer);
    timer = 0;
  };

  new IntersectionObserver(
    ([e]) => (e && e.isIntersecting ? start() : stop()),
    { threshold: 0.2 },
  ).observe(host);
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );
}


/* ------------------------------------------------------------------
   Sound. Synthesised with Web Audio rather than shipping audio files —
   a click is a short filtered blip, which costs nothing to download.
   Off until asked for, and the choice persists.
   ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;
let sfxOn = false;

/* A click is two things: a short noise transient for the "tick", and a low
   sine body for weight. One oscillator alone reads as a beep, which is what
   the first version sounded like. */
function click(base: number, gain: number) {
  if (!sfxOn) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = gain;
    out.connect(ctx.destination);

    // transient: filtered noise burst, ~14ms
    const n = Math.floor(ctx.sampleRate * 0.014);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2.2;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = base * 3.2;
    bp.Q.value = 0.9;
    const ng = ctx.createGain();
    ng.gain.value = 0.55;
    noise.connect(bp).connect(ng).connect(out);
    noise.start(t);

    // body: quick sine thump
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 0.55, t + 0.055);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0, t);
    og.gain.linearRampToValueAtTime(1, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(og).connect(out);
    osc.start(t);
    osc.stop(t + 0.09);
  } catch {
    /* audio unavailable */
  }
}

const sfx = {
  tap: () => click(190, 0.055),
  open: () => click(260, 0.06),
  close: () => click(140, 0.05),
  send: () => click(320, 0.06),
  reply: () => click(230, 0.05),
};

function soundToggle() {
  const btn = document.querySelector<HTMLButtonElement>("[data-sfx]");
  if (!btn) return;
  try {
    sfxOn = localStorage.getItem("sfx") === "on";
  } catch {
    sfxOn = false;
  }
  btn.setAttribute("aria-pressed", String(sfxOn));
  btn.addEventListener("click", () => {
    sfxOn = !sfxOn;
    btn.setAttribute("aria-pressed", String(sfxOn));
    try {
      localStorage.setItem("sfx", sfxOn ? "on" : "off");
    } catch {
      /* private mode */
    }
    if (sfxOn) sfx.open();
  });

  // every control on the page shares one click sound
  document.addEventListener("pointerdown", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("a, button") && !t.closest("[data-sfx]")) sfx.tap();
  });
}

/* ------------------------------------------------------------------
   Stack chips. Clicking one shows where that tool is actually used.
   ------------------------------------------------------------------ */

function toolDetail() {
  const panel = document.querySelector<HTMLElement>("[data-detail]");
  const nameEl = document.querySelector<HTMLElement>("[data-td-name]");
  const noteEl = document.querySelector<HTMLElement>("[data-td-note]");
  const usedEl = document.querySelector<HTMLElement>("[data-td-used]");
  const iconEl = document.querySelector<HTMLElement>("[data-td-icon]");
  const closeEl = document.querySelector<HTMLButtonElement>("[data-td-close]");
  if (!panel || !nameEl || !noteEl || !usedEl || !closeEl) return;

  const chips = [...document.querySelectorAll<HTMLButtonElement>(".chip")];
  let open: HTMLButtonElement | null = null;

  const close = () => {
    panel.hidden = true;
    open?.setAttribute("aria-expanded", "false");
    open = null;
  };

  for (const chip of chips) {
    chip.setAttribute("aria-controls", "tool-detail");
    chip.addEventListener("click", () => {
      if (open === chip) {
        sfx.close();
        close();
        return;
      }
      open?.setAttribute("aria-expanded", "false");
      open = chip;
      chip.setAttribute("aria-expanded", "true");

      const used = (chip.dataset.used ?? "").split(",").filter(Boolean);
      const mark = chip.querySelector("svg");
      if (iconEl) {
        iconEl.innerHTML = mark ? mark.outerHTML : "";
        iconEl.style.setProperty("--bc", chip.style.getPropertyValue("--bc"));
      }
      nameEl.textContent = chip.dataset.tool ?? "";
      noteEl.textContent =
        chip.dataset.note ||
        "Not in a public repo yet — this one is still on the learning pile.";
      usedEl.innerHTML = used.length
        ? `Used in ${used.map((u) => `<span class="td-proj">${esc(u)}</span>`).join("")}`
        : "No shipped project uses it yet";
      panel.hidden = false;
      sfx.open();
      panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  closeEl.addEventListener("click", () => {
    sfx.close();
    close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) {
      close();
      open?.focus();
    }
  });
}

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
  for (const el of items) {
    const peers = [...(el.parentElement?.children ?? [])].filter((c) =>
      c.classList.contains("rise"),
    );
    el.style.transitionDelay = `${Math.min(peers.indexOf(el), 4) * 50}ms`;
    io.observe(el);
  }
}

/* ------------------------------------------------------------------
   Active nav link.
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
        if (a && e.isIntersecting) {
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
   Nav: a pill that slides to whichever section you are in, plus a tap
   ripple on press. Both are decoration, so both sit behind a guard.
   ------------------------------------------------------------------ */

function navGlide() {
  const wrap = document.querySelector<HTMLElement>(".dock .nav-links");
  if (!wrap) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const glide = document.createElement("span");
  glide.className = "nav-glide";
  wrap.prepend(glide);

  const move = (to: HTMLElement | null) => {
    if (!to) {
      glide.classList.remove("on");
      return;
    }
    glide.classList.add("on");
    glide.style.width = `${to.offsetWidth}px`;
    glide.style.transform = `translateX(${to.offsetLeft}px)`;
  };

  const current = () => wrap.querySelector<HTMLElement>("a[aria-current]");
  const sync = () => move(current());

  // follow the pointer, snap back to the active section on leave
  wrap.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
    a.addEventListener("pointerenter", () => !reduce && move(a));
  });
  wrap.addEventListener("pointerleave", sync);
  new MutationObserver(sync).observe(wrap, {
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-current"],
  });
  window.addEventListener("resize", sync);
  requestAnimationFrame(sync);
}

function ripple() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.addEventListener("pointerdown", (e) => {
    const host = (e.target as HTMLElement).closest<HTMLElement>(
      ".dock .nav-links a, .btn, .ask-chip, .chip",
    );
    if (!host) return;
    const r = host.getBoundingClientRect();
    const d = Math.max(r.width, r.height);
    const el = document.createElement("span");
    el.className = "ink";
    el.style.width = el.style.height = `${d}px`;
    el.style.left = `${e.clientX - r.left - d / 2}px`;
    el.style.top = `${e.clientY - r.top - d / 2}px`;
    const pos = getComputedStyle(host).position;
    if (pos === "static") host.style.position = "relative";
    host.append(el);
    el.addEventListener("animationend", () => el.remove());
  });
}

/* ------------------------------------------------------------------
   Live repositories.
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
      ? ` <a class="repo-live" href="${esc(r.homepage)}" aria-label="Open ${esc(r.name)} live" title="Open live site">${linkIcon}</a>`
      : ""
  }
  ${r.description ? `<p>${esc(r.description)}</p>` : ""}
  <span class="repo-meta">${esc(r.language ?? "—")} · updated ${when(r.pushed_at)}</span>
</article>`,
      )
      .join("");
  } catch {
    host.innerHTML = `<p class="repo repo-meta">Could not reach the GitHub API just now — <a href="https://github.com/${esc(handle)}" style="border-bottom:1px solid var(--line-3)">browse the repos directly</a>.</p>`;
  }
}

/* ------------------------------------------------------------------
   Ask AI. Posts to /api/chat, which holds the key server-side.
   ------------------------------------------------------------------ */

type Turn = { role: "user" | "assistant"; content: string };

function chat() {
  const root = document.querySelector<HTMLElement>("[data-chat]");
  if (!root) return;
  const log = root.querySelector<HTMLElement>("[data-log]");
  const form = root.querySelector<HTMLFormElement>("[data-form]");
  const input = root.querySelector<HTMLInputElement>("[data-input]");
  const send = root.querySelector<HTMLButtonElement>("[data-send]");
  if (!log || !form || !input || !send) return;

  const history: Turn[] = [];
  let busy = false;

  const bubble = (cls: string, html: string) => {
    const el = document.createElement("div");
    el.className = `msg ${cls}`;
    el.innerHTML = html;
    log.append(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };

  const ask = async (q: string) => {
    if (busy || !q.trim()) return;
    busy = true;
    send.disabled = true;
    input.value = "";

    sfx.send();
    bubble("msg-user", `<p>${esc(q)}</p>`);
    history.push({ role: "user", content: q });
    const thinking = bubble(
      "msg-bot",
      `<p class="dots" aria-label="Thinking"><span></span><span></span><span></span></p>`,
    );

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}) as Record<string, string>);
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      const reply = String(data.reply ?? "");
      thinking.className = "msg msg-bot";
      thinking.innerHTML = reply
        .split(/\n{2,}/)
        .map((p) => `<p>${esc(p.trim())}</p>`)
        .join("");
      history.push({ role: "assistant", content: reply });
      sfx.reply();
    } catch (err) {
      thinking.className = "msg msg-err";
      const why = err instanceof Error ? err.message : "Something went wrong.";
      thinking.innerHTML = `<p>${esc(why)} You can always email <a href="mailto:junizkylesarmiento@gmail.com" style="border-bottom:1px solid var(--line-3)">Kyle directly</a>.</p>`;
      history.pop();
    } finally {
      busy = false;
      send.disabled = false;
      log.scrollTop = log.scrollHeight;
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void ask(input.value);
  });
  root.querySelectorAll<HTMLButtonElement>(".ask-chip").forEach((b) =>
    b.addEventListener("click", () => void ask(b.dataset.q ?? "")),
  );
}

/* ------------------------------------------------------------------
   Copy the address rather than forcing a mail client open.
   ------------------------------------------------------------------ */

function copyEmail() {
  const el = document.querySelector<HTMLAnchorElement>("[data-copy]");
  if (!el || !navigator.clipboard) return;
  const hint = el.querySelector(".copy-hint");
  el.addEventListener("click", async (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(el.dataset.copy ?? "");
      el.dataset.copied = "true";
      if (hint) hint.textContent = "copied";
      setTimeout(() => {
        delete el.dataset.copied;
        if (hint) hint.textContent = "click to copy";
      }, 2000);
    } catch {
      window.location.href = el.href;
    }
  });
}

/** For whoever opens the console. */
function greet() {
  console.log(
    "%cdevByKyle",
    "font:600 15px ui-monospace,monospace;color:#0a0a0b;background:#fafafa;padding:4px 8px;border-radius:4px",
  );
  console.log(
    [
      "%cNo framework. A few kB of JavaScript, and you are reading most of it.",
      "If you are hiring: junizkylesarmiento@gmail.com",
    ].join("\n"),
    "font:13px ui-monospace,monospace;color:#b2b2b9",
  );
}

soundToggle();
toolDetail();
navGlide();
ripple();
clock();
rotator();
reveal();
activeNav();
chat();
copyEmail();
greet();
void repos();
