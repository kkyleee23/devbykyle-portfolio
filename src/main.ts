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



type Rec = { name: string; role: string | null; body: string; created_at: string };

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
  <blockquote>${esc(r.body)}</blockquote>
  <p class="rec-by"><b>${esc(r.name)}</b>${r.role ? `<span>${esc(r.role)}</span>` : ""}<time>${esc(when.format(new Date(r.created_at)))}</time></p>
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
    const payload = {
      name: String(fd.get("name") ?? ""),
      role: String(fd.get("role") ?? ""),
      body: String(fd.get("body") ?? ""),
      contact: String(fd.get("contact") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
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
      "If you are hiring: junizkylesarmiento@gmail.com",
    ].join("\n"),
    "font:13px ui-monospace,monospace;color:#b2b2b9",
  );
}

soundToggle();
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
