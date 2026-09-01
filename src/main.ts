import "./style.css";

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function mdToHtml(src: string): string {
  const lines = src.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  let para: string[] = [];
  const flush = () => {
    if (para.length) {
      out.push(`<p>${para.map(inline).join("<br>")}</p>`);
      para = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    const ul = line.match(/^[-*]\s+(.*)$/);
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (h) {
      flush();
      closeList();
      out.push(`<p class="chat-h">${inline(h[2]!)}</p>`);
    } else if (ul) {
      flush();
      if (list !== "ul") {
        closeList();
        out.push("<ul>");
        list = "ul";
      }
      out.push(`<li>${inline(ul[1]!)}</li>`);
    } else if (ol) {
      flush();
      if (list !== "ol") {
        closeList();
        out.push("<ol>");
        list = "ol";
      }
      out.push(`<li>${inline(ol[1]!)}</li>`);
    } else if (line === "") {
      flush();
      closeList();
    } else {
      if (list) closeList();
      para.push(line);
    }
  }
  flush();
  closeList();
  return out.join("");
}

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
  host.addEventListener("pointerenter", stop);
  host.addEventListener("pointerleave", start);
  host.addEventListener("focusin", stop);
  host.addEventListener("focusout", start);
}

let ctx: AudioContext | null = null;
let sfxOn = false;

function ensureCtx(): AudioContext | null {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function click(base: number, gain: number) {
  if (!sfxOn) return;
  const ac = ensureCtx();
  if (!ac) return;
  try {
    const t = Math.max(ac.currentTime, 0) + 0.005;
    const out = ac.createGain();
    out.gain.value = gain;
    out.connect(ac.destination);

    const n = Math.floor(ac.sampleRate * 0.014);
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2.2;
    const noise = ac.createBufferSource();
    noise.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = base * 3.2;
    bp.Q.value = 0.9;
    const ng = ac.createGain();
    ng.gain.value = 0.7;
    noise.connect(bp).connect(ng).connect(out);
    noise.start(t);

    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 0.55, t + 0.06);
    const og = ac.createGain();
    og.gain.setValueAtTime(0, t);
    og.gain.linearRampToValueAtTime(1, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(og).connect(out);
    osc.start(t);
    osc.stop(t + 0.11);
  } catch {
  }
}

const sfx = {
  tap: () => click(200, 0.16),
  open: () => click(270, 0.19),
  close: () => click(150, 0.15),
  send: () => click(330, 0.19),
  reply: () => click(240, 0.16),
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
    }
    if (sfxOn) {
      ensureCtx();
      sfx.open();
    }
  });

  document.addEventListener("pointerdown", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("a, button") && !t.closest("[data-sfx]")) sfx.tap();
  });
}

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
        "Not in a public repo yet. This one is still on the learning pile.";
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

function navGlide() {
  const wrap = document.querySelector<HTMLElement>(".dock .nav-links");
  if (!wrap) return;

  const glide = document.createElement("span");
  glide.className = "nav-glide";
  wrap.prepend(glide);

  const sync = () => {
    const active = wrap.querySelector<HTMLElement>("a[aria-current]");
    if (!active) {
      glide.classList.remove("on");
      return;
    }
    glide.classList.add("on");
    glide.style.width = `${active.offsetWidth}px`;
    glide.style.transform = `translateX(${active.offsetLeft}px)`;
  };

  new MutationObserver(sync).observe(wrap, {
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-current"],
  });
  window.addEventListener("resize", sync);

  const dock = wrap.closest(".dock");
  if (dock) {
    dock.addEventListener("transitionend", (e) => {
      if ((e as TransitionEvent).propertyName !== "opacity") sync();
    });
    new MutationObserver(sync).observe(dock, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }
  if ("ResizeObserver" in window) new ResizeObserver(sync).observe(wrap);
  if (document.fonts?.ready) void document.fonts.ready.then(sync);
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

type Repo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  fork: boolean;
  homepage: string | null;
};


const GH_TTL = 30 * 60 * 1000;

async function gh<T>(url: string, key: string): Promise<T | null> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const hit = JSON.parse(raw);
      if (Date.now() - hit.t < GH_TTL) return hit.v as T;
    }
  } catch {}
  try {
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (res.status === 403 || res.status === 429) {
      try {
        const stale = localStorage.getItem(key);
        if (stale) return JSON.parse(stale).v as T;
      } catch {}
      return null;
    }
    if (!res.ok) return null;
    const v = (await res.json()) as T;
    try {
      localStorage.setItem(key, JSON.stringify({ t: Date.now(), v }));
    } catch {}
    return v;
  } catch {
    return null;
  }
}

type Commit = { repo: string; msg: string; date: string; url: string };

type GhPayload = { repos: Repo[]; commits: Commit[] };

let ghOnce: Promise<GhPayload | null> | null = null;

async function ghData(): Promise<GhPayload | null> {
  if (ghOnce) return ghOnce;
  ghOnce = (async () => {
    const cached = readCache<GhPayload>("gh:all");
    if (cached) return cached;
    try {
      const res = await fetch("/api/github");
      if (res.ok) {
        const v = (await res.json()) as GhPayload;
        writeCache("gh:all", v);
        return v;
      }
    } catch {}
    return directGh();
  })();
  return ghOnce;
}

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const hit = JSON.parse(raw);
    if (Date.now() - hit.t < GH_TTL) return hit.v as T;
    return null;
  } catch {
    return null;
  }
}

function writeCache(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v }));
  } catch {}
}

async function directGh(): Promise<GhPayload | null> {
  const user = "kkyleee23";
  const names = ["Studs", "Planora-Official", "PrintScreen"];
  const [repos, ...lists] = await Promise.all([
    gh<Repo[]>(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, "gh:repos"),
    ...names.map((r) =>
      gh<any[]>(`https://api.github.com/repos/${user}/${r}/commits?per_page=20`, `gh:c:${r}`),
    ),
  ]);
  const commits: Commit[] = [];
  lists.forEach((j, i) => {
    if (!Array.isArray(j)) return;
    for (const c of j) {
      commits.push({
        repo: names[i]!,
        msg: String(c.commit?.message ?? "").split(String.fromCharCode(10))[0] ?? "",
        date: String(c.commit?.author?.date ?? ""),
        url: String(c.html_url ?? ""),
      });
    }
  });
  commits.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  if (!Array.isArray(repos) && !commits.length) return null;
  return {
    repos: Array.isArray(repos)
      ? repos.filter((r) => !r.fork && r.name.toLowerCase() !== user.toLowerCase()).slice(0, 6)
      : [],
    commits,
  };
}



async function activity() {
  const host = document.querySelector<HTMLElement>("[data-activity]");
  const grid = document.querySelector<HTMLElement>("[data-act-grid]");
  const list = document.querySelector<HTMLElement>("[data-act-list]");
  if (!host || !grid || !list) return;

  const user = host.dataset.user ?? "";
  const repos = (host.dataset.repos ?? "").split(",").filter(Boolean);
  if (!user || !repos.length) return;

  const data = await ghData();
  const all = (data?.commits ?? []).filter((c) => c.date && c.msg);
  if (!all.length) {
    list.innerHTML = `<li class="act-load">Could not reach GitHub. <a href="https://github.com/${esc(user)}" style="border-bottom:1px solid var(--line-3)">See the repos</a></li>`;
    return;
  }
  all.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const byDay = new Map<string, number>();
  for (const c of all) {
    const k = c.date.slice(0, 10);
    byDay.set(k, (byDay.get(k) ?? 0) + 1);
  }

  const WEEKS = 18;
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const cells: string[] = [];
  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const n = byDay.get(d.toISOString().slice(0, 10)) ?? 0;
    const lvl = n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4;
    cells.push(`<span class="act-cell l${lvl}"></span>`);
  }
  grid.innerHTML = cells.join("");
  grid.style.gridTemplateColumns = `repeat(${WEEKS}, 1fr)`;

  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Manila",
  });
  list.innerHTML = all
    .slice(0, 5)
    .map(
      (c) => `<li>
  <span class="act-msg">${esc(c.msg)}</span>
  <span class="act-meta"><a href="${esc(c.url)}">${esc(c.repo)}</a> · ${esc(fmt.format(new Date(c.date)))}</span>
</li>`,
    )
    .join("");
}

function caseStudies() {
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-study]")) {
    const panel = document.getElementById(`study-${btn.dataset.study}`);
    if (!panel) continue;
    btn.addEventListener("click", () => {
      const open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      const label = btn.querySelector("[data-study-label]");
      if (label) label.textContent = open ? "Hide the write-up" : "Read the write-up";
      open ? sfx.open() : sfx.close();
    });
  }
}



type Rec = {
  name: string;
  role: string | null;
  body: string;
  rating: number | null;
  created_at: string;
};

const STAR_PATH =
  "M12 2.6l2.7 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.3 20l1.4-6.3-4.8-4.3 6.4-.6z";

function monogram(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase() ||
    "?";
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `<span class="rec-av" data-variant="${h % 3}" aria-hidden="true">${esc(initials)}</span>`;
}

function starsRow(rating: number) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  let out = `<span class="rec-stars" aria-label="${r} out of 5">`;
  for (let i = 1; i <= 5; i++) {
    out += `<svg viewBox="0 0 24 24"${i <= r ? ' class="on"' : ""} aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
  }
  return out + "</span>";
}

function recommendations() {
  const list = document.querySelector<HTMLElement>("[data-rec-list]");
  const form = document.querySelector<HTMLFormElement>("[data-rec-form]");
  const note = document.querySelector<HTMLElement>("[data-rec-note]");
  const send = document.querySelector<HTMLButtonElement>("[data-rec-send]");
  if (!list || !form || !note || !send) return;

  const when = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

  const render = (items: Rec[]) => {
    if (!items.length) {
      list.innerHTML =
        '<li class="rec-empty">No recommendations yet. If we have worked together, yours would be the first.</li>';
      return;
    }
    list.innerHTML = items
      .map(
        (r) => `<li class="rec">
  <div class="rec-top">
    ${monogram(r.name)}
    <div class="rec-who"><b>${esc(r.name)}</b>${r.role ? `<span class="rec-role">${esc(r.role)}</span>` : ""}</div>
    ${r.rating ? starsRow(r.rating) : ""}
  </div>
  <blockquote>${esc(r.body)}</blockquote>
  <time class="rec-when">${esc(when.format(new Date(r.created_at)))}</time>
</li>`,
      )
      .join("");
  };

  const load = async () => {
    try {
      const res = await fetch("/api/recommendations");
      if (!res.ok) throw new Error();
      const data = await res.json();
      render(Array.isArray(data.items) ? data.items : []);
    } catch {
      list.innerHTML = '<li class="rec-empty">Recommendations are not loading right now.</li>';
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (send.disabled) return;
    const fd = new FormData(form);
    const rating = Number(fd.get("rating") ?? 0);
    const payload = {
      name: String(fd.get("name") ?? ""),
      role: String(fd.get("role") ?? ""),
      body: String(fd.get("body") ?? ""),
      contact: String(fd.get("contact") ?? ""),
      website: String(fd.get("website") ?? ""),
      rating,
    };
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      note.textContent = "Pick a star rating first.";
      note.dataset.state = "err";
      return;
    }
    if (payload.body.trim().length < 20) {
      note.textContent = "A little more detail would help. Twenty characters minimum.";
      note.dataset.state = "err";
      return;
    }
    send.disabled = true;
    note.dataset.state = "";
    note.textContent = "Sending";
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}) as Record<string, string>);
      if (!res.ok) throw new Error(data.error || "Could not send that.");
      form.reset();
      note.dataset.state = "ok";
      note.textContent = "Thank you. It will appear here once Kyle has read it.";
      sfx.reply();
    } catch (err) {
      note.dataset.state = "err";
      note.textContent = err instanceof Error ? err.message : "Could not send that.";
    } finally {
      send.disabled = false;
    }
  });

  void load();
}

function kitWidget() {
  const fab = document.querySelector<HTMLButtonElement>("[data-kit-toggle]");
  const panel = document.getElementById("kit-panel");
  const close = document.querySelector<HTMLButtonElement>("[data-kit-close]");
  if (!fab || !panel) return;

  const set = (open: boolean) => {
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    if (open) {
      document.querySelector<HTMLInputElement>("[data-input]")?.focus();
      sfx.open();
    } else sfx.close();
  };

  fab.addEventListener("click", () => set(panel.hidden));
  close?.addEventListener("click", () => set(false));
  for (const b of document.querySelectorAll<HTMLElement>("[data-kit-open]")) {
    b.addEventListener("click", () => set(true));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      set(false);
      fab.focus();
    }
  });
}

function dockShrink() {
  const dock = document.querySelector<HTMLElement>(".dock");
  const hero = document.getElementById("top");
  if (!dock || !hero) return;
  new IntersectionObserver(
    ([e]) => dock.classList.toggle("tight", !!e && !e.isIntersecting),
    { rootMargin: "-120px 0px 0px 0px", threshold: 0 },
  ).observe(hero);
}

function scrollProgress() {
  const bar = document.querySelector<HTMLElement>("[data-progress]");
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.transform = `scaleX(${p})`;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

function palette() {
  const root = document.querySelector<HTMLElement>("[data-pal]");
  const input = document.querySelector<HTMLInputElement>("[data-pal-input]");
  const list = document.querySelector<HTMLElement>("[data-pal-list]");
  if (!root || !input || !list) return;

  const items = [
    ...[...document.querySelectorAll<HTMLElement>("section[id], header[id]")].map((s) => ({
      label:
        s.id === "top"
          ? "Home"
          : (s.querySelector(":scope > .shell > .marker")?.textContent?.replace(/[<>/]/g, "").trim() ?? s.id),
      kind: "section",
      go: () => s.scrollIntoView({ behavior: "smooth", block: "start" }),
    })),
    {
      label: "Email Kyle",
      kind: "action",
      go: () => (window.location.href = `mailto:${document.querySelector<HTMLAnchorElement>("[data-copy]")?.dataset.copy ?? ""}`),
    },
    {
      label: "Open GitHub",
      kind: "action",
      go: () => window.open("https://github.com/kkyleee23", "_blank"),
    },
    {
      label: "Open terminal",
      kind: "action",
      go: () => document.dispatchEvent(new Event("term:open")),
    },
  ];

  let shown = items;
  let sel = 0;

  const render = () => {
    list.innerHTML = shown
      .map(
        (it, i) =>
          `<li role="option" aria-selected="${i === sel}" data-i="${i}">${esc(it.label)}<span class="pal-kind">${esc(it.kind)}</span></li>`,
      )
      .join("");
  };
  const open = () => {
    root.hidden = false;
    input.value = "";
    shown = items;
    sel = 0;
    render();
    input.focus();
    sfx.open();
  };
  const close = () => {
    root.hidden = true;
    sfx.close();
  };
  const run = () => {
    const it = shown[sel];
    if (!it) {
      const q = input.value.trim();
      if (q) {
        close();
        document.querySelector<HTMLButtonElement>("[data-kit-toggle]")?.click();
        const box = document.querySelector<HTMLInputElement>("[data-input]");
        if (box) {
          box.value = q;
          box.focus();
        }
      }
      return;
    }
    close();
    it.go();
  };

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      root.hidden ? open() : close();
      return;
    }
    if (root.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      sel = Math.min(sel + 1, shown.length - 1);
      render();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      sel = Math.max(sel - 1, 0);
      render();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      run();
    }
  });

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    shown = q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;
    sel = 0;
    render();
  });
  list.addEventListener("click", (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>("li");
    if (!li) return;
    sel = Number(li.dataset.i);
    run();
  });
  root.addEventListener("click", (e) => {
    if (e.target === root) close();
  });
  render();
}

type Turn = { role: "user" | "assistant"; content: string };

function chat() {
  const root = document.querySelector<HTMLElement>("[data-chat]");
  if (!root) return;
  const log = root.querySelector<HTMLElement>("[data-log]");
  const form = root.querySelector<HTMLFormElement>("[data-form]");
  const input = root.querySelector<HTMLInputElement>("[data-input]");
  const send = root.querySelector<HTMLButtonElement>("[data-send]");
  const note = root.querySelector<HTMLElement>(".chat-note");
  if (!log || !form || !input || !send) return;

  const noteDefault = note?.textContent ?? "";
  const hint = (msg: string) => {
    if (!note) return;
    note.textContent = msg;
    window.setTimeout(() => {
      note.textContent = noteDefault;
    }, 2500);
  };

  const history: Turn[] = [];
  let busy = false;
  let lastSent = 0;
  const COOLDOWN = 3500;

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
    const wait = COOLDOWN - (Date.now() - lastSent);
    if (wait > 0) {
      hint(`Give Kit a moment, ${Math.ceil(wait / 1000)}s.`);
      return;
    }
    lastSent = Date.now();
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
      thinking.innerHTML = mdToHtml(reply);
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

function greet() {
  console.log(
    "%cdevByKyle",
    "font:600 15px ui-monospace,monospace;color:#0a0a0b;background:#fafafa;padding:4px 8px;border-radius:4px",
  );
  console.log(
    [
      "%cNo framework. A few kB of JavaScript, and you are reading most of it.",
      "Press ` for a terminal. If you are hiring: junizkylesarmiento@gmail.com",
    ].join("\n"),
    "font:13px ui-monospace,monospace;color:#b2b2b9",
  );
}

function galleries() {
  const frames = [...document.querySelectorAll<HTMLElement>("[data-gallery]")];
  for (const frame of frames) {
    const slides = [...frame.querySelectorAll<HTMLElement>(".shot-slide")];
    const dots = [...frame.querySelectorAll<HTMLButtonElement>("[data-dot]")];
    const count = frame.querySelector<HTMLElement>("[data-count]");
    const prev = frame.querySelector<HTMLButtonElement>("[data-prev]");
    const next = frame.querySelector<HTMLButtonElement>("[data-next]");
    if (slides.length < 2) continue;

    let i = 0;
    const go = (n: number) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("on", k === i));
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
      if (count) count.textContent = `${i + 1} / ${slides.length}`;
    };

    prev?.addEventListener("click", () => go(i - 1));
    next?.addEventListener("click", () => go(i + 1));
    dots.forEach((d, k) => d.addEventListener("click", () => go(k)));

    frame.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(i - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(i + 1);
      }
    });

    let x0: number | null = null;
    const stage = frame.querySelector<HTMLElement>(".shot-stage") ?? frame;
    stage.addEventListener(
      "touchstart",
      (e) => {
        x0 = e.touches[0]?.clientX ?? null;
      },
      { passive: true },
    );
    stage.addEventListener("touchend", (e) => {
      const end = e.changedTouches[0]?.clientX;
      if (x0 === null || end === undefined) return;
      const dx = end - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    });
  }
}

function lightbox() {
  const wrap = document.querySelector<HTMLElement>("[data-lightbox]");
  const img = document.querySelector<HTMLImageElement>("[data-lb-img]");
  const count = document.querySelector<HTMLElement>("[data-lb-count]");
  const prev = document.querySelector<HTMLButtonElement>("[data-lb-prev]");
  const next = document.querySelector<HTMLButtonElement>("[data-lb-next]");
  const closeBtn = document.querySelector<HTMLButtonElement>("[data-lb-close]");
  const inner = wrap?.querySelector<HTMLElement>(".lb-inner");
  if (!wrap || !img || !count || !prev || !next) return;

  type Shot = { src: string; alt: string };
  let shots: Shot[] = [];
  let idx = 0;
  let source: HTMLImageElement | null = null;

  const vt = (fn: () => void) => {
    const start = (document as unknown as {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    }).startViewTransition?.bind(document);
    if (!start || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fn();
      return { finished: Promise.resolve() };
    }
    return start(fn);
  };

  const render = () => {
    const s = shots[idx];
    if (!s) return;
    img.src = s.src;
    img.alt = s.alt;
    const multi = shots.length > 1;
    prev.hidden = !multi;
    next.hidden = !multi;
    count.hidden = !multi;
    if (multi) count.textContent = `${idx + 1} / ${shots.length}`;
  };

  const open = (list: Shot[], i: number, src: HTMLImageElement) => {
    shots = list;
    idx = i;
    source = src;
    render();
    src.style.viewTransitionName = "lb-shot";
    vt(() => {
      wrap.hidden = false;
      src.style.viewTransitionName = "";
      img.style.viewTransitionName = "lb-shot";
    }).finished.finally(() => {
      img.style.viewTransitionName = "";
    });
    sfx.open();
  };

  const close = () => {
    if (wrap.hidden) return;
    const back = source;
    img.style.viewTransitionName = "lb-shot";
    vt(() => {
      wrap.hidden = true;
      img.style.viewTransitionName = "";
      if (back) back.style.viewTransitionName = "lb-shot";
    }).finished.finally(() => {
      if (back) back.style.viewTransitionName = "";
    });
    source = null;
    sfx.close();
  };

  const step = (d: number) => {
    if (shots.length < 2) return;
    idx = (idx + d + shots.length) % shots.length;
    render();
  };

  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  closeBtn?.addEventListener("click", close);
  wrap.addEventListener("mousedown", (e) => {
    if (!inner || !inner.contains(e.target as Node)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (wrap.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  for (const frame of document.querySelectorAll<HTMLElement>(".shotframe")) {
    const imgs = [...frame.querySelectorAll<HTMLImageElement>(".shot-slide img")];
    const list = imgs.map((im) => ({ src: im.currentSrc || im.src, alt: im.alt }));
    imgs.forEach((im, i) => im.addEventListener("click", () => open(list, i, im)));
  }
}

function theme() {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!btn) return;
  const root = document.documentElement;
  const current = (): "light" | "dark" => (root.dataset.theme === "light" ? "light" : "dark");

  const sync = () => {
    const light = current() === "light";
    btn.setAttribute("aria-pressed", String(light));
    btn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  };
  sync();

  const apply = (next: "light" | "dark") => {
    if (next === "light") root.dataset.theme = "light";
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem("theme", next);
    } catch {
    }
    sync();
  };

  btn.addEventListener("click", (e) => {
    const next = current() === "light" ? "dark" : "light";
    const start = (document as unknown as {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    }).startViewTransition?.bind(document);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!start || reduce) {
      apply(next);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${r}px`);
    root.dataset.vt = "theme";
    start(() => apply(next)).finished.finally(() => {
      delete root.dataset.vt;
    });
  });
}

function term() {
  const wrap = document.querySelector<HTMLElement>("[data-term]");
  const bodyEl = document.querySelector<HTMLElement>("[data-term-body]");
  const out = document.querySelector<HTMLElement>("[data-term-out]");
  const form = document.querySelector<HTMLFormElement>("[data-term-form]");
  const input = document.querySelector<HTMLInputElement>("[data-term-in]");
  const closeBtn = document.querySelector<HTMLButtonElement>("[data-term-close]");
  if (!wrap || !bodyEl || !out || !form || !input) return;

  const box = wrap.querySelector<HTMLElement>(".term-box");
  const botIcon = document.querySelector("[data-kit-toggle] svg")?.outerHTML ?? "";
  const COLORS: Record<string, string> = {
    green: "#5fd88f", amber: "#ffc558", cyan: "#63d9dc",
    blue: "#7aa8ff", pink: "#ef86d0", red: "#ff8a8a",
  };
  const applyColor = (name: string) => {
    if (box) box.dataset.termColor = name;
    try {
      localStorage.setItem("term-color", name);
    } catch {
    }
  };
  const clearColor = () => {
    if (box) delete box.dataset.termColor;
    try {
      localStorage.removeItem("term-color");
    } catch {
    }
  };
  try {
    const saved = localStorage.getItem("term-color");
    if (saved && COLORS[saved]) applyColor(saved);
  } catch {
  }

  const past: string[] = [];
  let hIdx = -1;
  let seeded = false;
  let pendingAsk: string | null = null;
  let kitBusy = false;
  const kitHistory: { role: string; content: string }[] = [];

  const scroll = () => (bodyEl.scrollTop = bodyEl.scrollHeight);
  const print = (html: string, cls = "") => {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.innerHTML = html;
    out.appendChild(p);
    scroll();
  };

  const sections: Record<string, string> = {
    home: "top", top: "top", about: "about", me: "about",
    work: "work", projects: "work", services: "services", hire: "services",
    stack: "stack", tech: "stack", skills: "stack", tools: "tools",
    now: "now", building: "now",
    recommend: "recommend", reviews: "recommend", recommendations: "recommend",
  };
  const txt = (el: Element | null, sel: string) => el?.querySelector(sel)?.textContent?.trim() ?? "";
  const projects = () =>
    [...document.querySelectorAll<HTMLElement>(".proj")].map((el) => {
      const links = [...el.querySelectorAll<HTMLAnchorElement>(".proj-links a")];
      return {
        name: txt(el, "h3"),
        status: txt(el, ".badge"),
        live: links.find((a) => !/github\.com/.test(a.href))?.href,
        el,
      };
    });
  const tools = () =>
    [...document.querySelectorAll<HTMLElement>("#tools .tool")].map((el) => ({
      name: txt(el, "h3"),
      tag: txt(el, ".tool-tag"),
      status: txt(el, ".badge"),
    }));
  const svcs = () =>
    [...document.querySelectorAll<HTMLElement>("#services .svc-card")].map((el) => ({
      title: txt(el, "h3"),
      fit: txt(el, ".svc-fit"),
    }));
  const nowItems = () =>
    [...document.querySelectorAll<HTMLElement>("#now .card")].map((el) => ({
      title: txt(el, "h3"),
      status: txt(el, ".badge"),
      when: txt(el, ".card-when"),
    }));
  const jump = (el: Element | null) => {
    if (!el) return false;
    close();
    (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  };

  const printKit = (reply: string) => {
    const lines = reply.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) {
      print("Kit had nothing to add. Try rephrasing, or email Kyle.", "t-dim");
      return;
    }
    print(`<span class="t-kit-tag">${botIcon}Kit</span>`, "t-kit t-kit-head");
    lines.forEach((line) => {
      const bullet = line.match(/^[-*]\s+(.*)$/);
      if (bullet) {
        print(`<span class="t-bul">&#9656;</span>${inline(bullet[1] ?? "")}`, "t-kit t-kit-li");
        return;
      }
      print(inline(line), "t-kit");
    });
  };

  const askKit = async (raw: string) => {
    const q = raw.trim();
    if (!q) return print("usage: ask <question> — for example, ask what is he strongest at", "t-err");
    if (kitBusy) return print("Kit is still thinking — one at a time.", "t-dim");
    kitBusy = true;
    input.disabled = true;
    const thinking = document.createElement("p");
    thinking.className = "t-dim";
    thinking.textContent = "kit is thinking…";
    out.appendChild(thinking);
    scroll();
    kitHistory.push({ role: "user", content: q });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: kitHistory.slice(-8) }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Kit could not answer that.");
      const reply = String(data.reply ?? "").trim();
      kitHistory.push({ role: "assistant", content: reply });
      thinking.remove();
      printKit(reply);
      sfx.reply();
    } catch (err) {
      thinking.remove();
      kitHistory.pop();
      const why = err instanceof Error ? err.message : "Kit could not answer that.";
      print(`${esc(why)} <span class="t-dim">Email <a href="mailto:junizkylesarmiento@gmail.com">Kyle</a> instead.</span>`, "t-err");
    } finally {
      kitBusy = false;
      input.disabled = false;
      input.focus();
      scroll();
    }
  };

  const commands: Record<string, (arg: string, raw: string) => void> = {
    help() {
      print("available commands", "t-head");
      const rows: [string, string][] = [
        ["ask <question>", "ask Kit anything about Kyle"],
        ["whoami", "who is behind this"],
        ["about", "the short version"],
        ["projects", "what I have shipped"],
        ["open <name>", "jump to a project, tool or section"],
        ["stack / tools", "the tech and the CLI tools"],
        ["services / now", "what I offer, what I'm building"],
        ["email", "reach me (and copy the address)"],
        ["github · resume", "the links"],
        ["theme [dark|light]", "switch the look"],
        ["color <name>", "recolor the terminal text"],
        ["sound [on|off]", "toggle the clicks"],
        ["date · echo · clear", "the usual"],
        ["exit", "close this (or press esc)"],
      ];
      for (const [c, d] of rows)
        print(`<span class="t-row"><span class="t-key">${c.padEnd(20, " ")}</span><span class="t-dim">${d}</span></span>`);
    },
    whoami() {
      const name = document.querySelector("h1")?.textContent?.trim() ?? "Juniz Kyle Sarmiento";
      const handle = document.querySelector(".handle")?.textContent?.trim() ?? "";
      print(`${esc(name)} ${handle ? `<span class="t-dim">${esc(handle)}</span>` : ""}`);
      print("Backend-focused full-stack · Grade 12 · Apalit, Pampanga, PH (GMT+8)", "t-dim");
    },
    about() {
      print("I build small tools that solve a real problem — web and mobile, backend first.");
      print("Vanilla by default; a framework only when it earns its weight.", "t-dim");
      print('Try <span class="t-key">projects</span>, <span class="t-key">stack</span> or <span class="t-key">email</span>.');
    },
    projects() {
      const list = projects();
      if (!list.length) return print("no projects on this page.", "t-dim");
      list.forEach((p, i) => {
        const url = p.live ? p.live.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";
        print(
          `<span class="t-row"><span class="t-key">${String(i + 1).padStart(2, "0")}</span>  ${esc(p.name)}  <span class="t-dim">[${esc(p.status)}]</span>${p.live ? `  <a href="${esc(p.live)}" target="_blank" rel="noopener">${esc(url)}</a>` : ""}</span>`,
        );
      });
      print(`Type <span class="t-key">open ${esc((list[0]?.name ?? "").toLowerCase())}</span> to jump to one.`, "t-dim");
    },
    open(arg) {
      if (!arg) return print("usage: open &lt;project|section&gt;", "t-err");
      const t = arg.toLowerCase();
      const pj = projects().find((p) => p.name.toLowerCase().includes(t));
      if (pj) {
        print(`opening ${esc(pj.name)}…`, "t-dim");
        if (pj.live) print(`live: <a href="${esc(pj.live)}" target="_blank" rel="noopener">${esc(pj.live)}</a>`);
        jump(pj.el);
        return;
      }
      const tl = tools().find((x) => x.name.toLowerCase().includes(t));
      if (tl) {
        print(`opening ${esc(tl.name)} <span class="t-dim">— ${esc(tl.tag)}</span>`, "t-dim");
        jump(document.getElementById("tools"));
        return;
      }
      const id = sections[t];
      if (id && jump(document.getElementById(id))) return print(`opening ${esc(t)}…`, "t-dim");
      print(`open: no match for '${esc(arg)}'. try 'projects', 'tools' or 'help'.`, "t-err");
    },
    stack() {
      const n = document.querySelectorAll("#stack .chip").length;
      print(`${n} tools across languages, frontend, backend, data and tooling.`);
      print('Run <span class="t-key">open stack</span> to see the section, or <span class="t-key">ask</span> Kit what he uses.', "t-dim");
    },
    tools() {
      const list = tools();
      if (!list.length) return print("no terminal tools on this page.", "t-dim");
      print("command-line tools", "t-head");
      list.forEach((x) =>
        print(`<span class="t-row"><span class="t-key">${esc(x.name)}</span>  <span class="t-dim">${esc(x.tag)}</span>  [${esc(x.status)}]</span>`),
      );
      print(`Run <span class="t-key">open ${esc((list[0]?.name ?? "").toLowerCase())}</span> to jump there. Both are for authorised use only.`, "t-dim");
    },
    services() {
      const list = svcs();
      if (!list.length) return print("no services listed on this page.", "t-dim");
      print("what Kyle can build for you", "t-head");
      list.forEach((s) => {
        print(`<span class="t-key">${esc(s.title)}</span>`);
        if (s.fit) print(esc(s.fit), "t-sub");
      });
      print('One capstone at a time — <span class="t-key">ask</span> if a slot is open, or run <span class="t-key">email</span>.', "t-dim");
    },
    now() {
      const list = nowItems();
      if (!list.length) return print("nothing listed under currently-building.", "t-dim");
      print("currently building", "t-head");
      list.forEach((c) =>
        print(`<span class="t-row"><span class="t-key">${esc(c.title)}</span>  <span class="t-dim">[${esc(c.status)}] · ${esc(c.when)}</span></span>`),
      );
      print('Run <span class="t-key">open now</span> to see the cards.', "t-dim");
    },
    email() {
      const em = document.querySelector<HTMLElement>("[data-copy]")?.dataset.copy ?? "";
      if (!em) return print("no email on this page.", "t-err");
      navigator.clipboard?.writeText(em).catch(() => {});
      print(`<a href="mailto:${esc(em)}">${esc(em)}</a> <span class="t-dim">— copied to clipboard.</span>`);
    },
    github() {
      print('opening <a href="https://github.com/kkyleee23" target="_blank" rel="noopener">github.com/kkyleee23</a>…');
      window.open("https://github.com/kkyleee23", "_blank", "noopener");
    },
    ask(arg) {
      void askKit(arg);
    },
    resume() {
      const rz = [...document.querySelectorAll<HTMLAnchorElement>(".hero-cta a")].find((a) =>
        /resume|cv/i.test(a.textContent ?? ""),
      );
      if (rz) {
        print("opening resume…", "t-dim");
        window.open(rz.href, "_blank", "noopener");
      } else {
        print("resume isn't up yet — it's next on the list. run 'email' and I'll send it.", "t-dim");
      }
    },
    theme(arg) {
      const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
      const cur = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      let target = arg ? arg.toLowerCase() : cur === "light" ? "dark" : "light";
      if (target === "toggle") target = cur === "light" ? "dark" : "light";
      if (target !== "light" && target !== "dark") return print("usage: theme [dark|light]", "t-err");
      if (target !== cur) btn?.click();
      print(`theme → ${target}`, "t-dim");
    },
    sound(arg) {
      const btn = document.querySelector<HTMLButtonElement>("[data-sfx]");
      const on = btn?.getAttribute("aria-pressed") === "true";
      let target = arg ? arg.toLowerCase() : on ? "off" : "on";
      if (target === "toggle") target = on ? "off" : "on";
      if (target !== "on" && target !== "off") return print("usage: sound [on|off]", "t-err");
      if ((target === "on") !== on) btn?.click();
      print(`sound → ${target}`, "t-dim");
    },
    date() {
      print(
        new Intl.DateTimeFormat("en-GB", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Asia/Manila",
        }).format(new Date()) + " — Kyle's local time",
      );
    },
    color(arg) {
      const name = arg.trim().toLowerCase();
      const swatch = (c: string) => `<span class="term-sw" style="background:${c}"></span>`;
      if (!name || name === "list") {
        print("terminal text colors", "t-head");
        for (const [c, hex] of Object.entries(COLORS))
          print(`${swatch(hex)}<span class="t-key">${c}</span>`);
        print('Run <span class="t-key">color green</span>, or <span class="t-key">color reset</span> for the site default.', "t-dim");
        return;
      }
      if (["reset", "default", "mono", "off"].includes(name)) {
        clearColor();
        return print("terminal text reset to the site theme.", "t-dim");
      }
      const hex = COLORS[name];
      if (!hex) return print(`no color '${esc(name)}'. run <span class="t-key">color list</span>.`, "t-err");
      applyColor(name);
      print(`${swatch(hex)}terminal text set to <span class="t-key">${esc(name)}</span>. it sticks next time too.`, "t-dim");
    },
    echo(arg) {
      print(esc(arg));
    },
    clear() {
      out.innerHTML = "";
    },
    sudo(arg) {
      if (/hire/.test(arg)) return print("excellent taste. run `email`. no sudo required.", "t-dim");
      print("we're all visitors here — no root for you. but it's all client-side, so help yourself.", "t-dim");
    },
  };
  const alias: Record<string, string> = {
    ls: "projects", cls: "clear", tech: "stack", skills: "stack",
    contact: "email", mail: "email", cv: "resume", time: "date",
    quit: "exit", close: "exit", man: "help", "?": "help", kit: "ask",
    hire: "services", building: "now", colour: "color",
  };

  const run = (raw: string) => {
    const line = raw.trim();
    pendingAsk = null;
    print(esc(line), "t-cmd");
    if (!line) return;
    if (/^rm\s+-rf/.test(line)) return print("nice try. nothing to delete — this whole site rebuilds from a few data files.", "t-dim");
    const parts = line.split(/\s+/);
    const word = (parts[0] ?? "").toLowerCase();
    const key = alias[word] ?? word;
    const arg = parts.slice(1).join(" ");
    if (key === "exit") return close();
    const fn = commands[key];
    if (fn) return fn(arg, line);
    if (/\s/.test(line) || line.endsWith("?")) {
      pendingAsk = line;
      print(`not a command. ask Kit? <span class="t-dim">press enter &crarr; (or keep typing)</span>`, "t-dim");
      return;
    }
    print(`command not found: ${esc(word)} — type <span class="t-key">help</span> or <span class="t-key">ask</span>.`, "t-err");
  };

  const seed = () => {
    if (seeded) return;
    seeded = true;
    print('devByKyle <span class="t-dim">// a small shell. this whole site is a few kB of JS.</span>', "t-banner");
    print('Type <span class="t-key">help</span> for commands, or <span class="t-key">ask</span> Kit a question. <span class="t-dim">esc to leave.</span>');
  };
  const open = () => {
    const pal = document.querySelector<HTMLElement>("[data-pal]");
    if (pal) pal.hidden = true;
    wrap.hidden = false;
    seed();
    input.focus();
    sfx.open();
  };
  const close = () => {
    if (wrap.hidden) return;
    wrap.hidden = true;
    sfx.close();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value;
    input.value = "";
    if (!raw.trim()) {
      if (pendingAsk) {
        const q = pendingAsk;
        pendingAsk = null;
        void askKit(q);
      }
      return;
    }
    past.push(raw.trim());
    hIdx = past.length;
    run(raw);
  });
  const names = [...new Set([...Object.keys(commands), ...Object.keys(alias)])].sort();
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!past.length) return;
      hIdx = Math.max(0, hIdx - 1);
      input.value = past[hIdx] ?? "";
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx >= past.length) return;
      hIdx = Math.min(past.length, hIdx + 1);
      input.value = past[hIdx] ?? "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      const val = input.value;
      if (/\s/.test(val.trim())) return;
      const frag = val.trim().toLowerCase();
      if (!frag) return;
      const hits = names.filter((n) => n.startsWith(frag));
      if (!hits.length) return;
      if (hits.length === 1) {
        input.value = `${hits[0]} `;
      } else {
        let prefix = hits[0] ?? "";
        for (const h of hits) {
          while (!h.startsWith(prefix)) prefix = prefix.slice(0, -1);
        }
        input.value = prefix;
        print(esc(val.trim()), "t-cmd");
        print(hits.join("   "), "t-dim");
      }
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });
  bodyEl.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).tagName !== "A") input.focus();
  });
  closeBtn?.addEventListener("click", close);
  wrap.addEventListener("mousedown", (e) => {
    if (e.target === wrap) close();
  });
  document.addEventListener("term:open", open);
  document.addEventListener("keydown", (e) => {
    const el = document.activeElement as HTMLElement | null;
    const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    if (e.key === "`" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      wrap.hidden ? open() : close();
    } else if (e.key === "Escape" && !wrap.hidden) {
      close();
    }
  });
}

soundToggle();
theme();
term();
toolDetail();
caseStudies();
palette();
kitWidget();
recommendations();
scrollProgress();
dockShrink();
void activity();
navGlide();
ripple();
clock();
rotator();
reveal();
activeNav();
chat();
copyEmail();
greet();
galleries();
lightbox();
