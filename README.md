# devByKyle — portfolio

Personal site for Juniz Kyle Sarmiento. Hand-written HTML and CSS, a small build
step, and 1.4 kB of JavaScript.

No framework. That is the point: the site argues that I reach for a framework
only when a project earns it, so it would be a poor argument if the site itself
shipped 150 kB of runtime to render seven static sections.

```
index.html   69.8 kB   gzip 28.0 kB   ← mostly the 40 inline brand SVGs
index.css    11.6 kB   gzip  3.1 kB
index.js      2.8 kB   gzip  1.4 kB
```

## Running it

```bash
npm install
npm run dev       # vite dev server
npm run gen       # regenerate index.html from src/data
npm run build     # gen + production build into dist/
npm run preview   # serve the build
npm run check     # tsc --noEmit
```

`index.html` is **generated** — edit the data, not the markup.

## Layout

```
scripts/generate.mjs   builds index.html from src/data
index.html             generated output (committed so the repo is servable as-is)
src/
  main.ts              scroll reveal, active nav link, live GitHub fetch
  style.css            tokens and every rule
  data/
    site.js            name, contact, about copy, education timeline
    projects.js        projects and the "right now" cards
    stack.js           generated — 40 tools with inline brand SVGs
public/img/            screenshots and portrait
design-system/         the locked design decisions
```

Change your bio, add a project, or reorder the stack by editing `src/data/*.js`
and running `npm run gen`. No component touches copy.

## Design

Full record in [`design-system/devbykyle/MASTER.md`](design-system/devbykyle/MASTER.md).

**Dark, monochrome, dense — on purpose.**

- **No colour accent.** Page is near-black, surfaces are zinc, borders are
  hairline `rgb(255 255 255 / 0.07)`. The only colour on the page comes from the
  brand icons in the stack section, which is exactly why that section reads.
- **Dense.** 1080 px shell, 3.5 rem section padding, tight cards. An earlier
  draft used a 1200 px shell with 6 rem padding and read as empty.
- **Type.** Bricolage Grotesque for display, driven at `wdth 84` / `wght 800` so
  it stops looking like a default grotesque. Instrument Sans for body. DM Mono
  for labels only — never negative tracking, 11 px floor.
- **Spec strips.** Each project states real constraints. `Under 5 MB · Works
  offline · No account` is checkable; adjectives are not.
- **Shipped markers.** A dot marks every tool that appears in a public repo.
  11 of 40. Claiming 40 without evidence reads as padding.

Banned outright: neon accents, gradient heroes, glassmorphism, looping
animation, percentage skill bars, emoji icons, typewriter effects.

## Notes

- The GitHub panel fetches `api.github.com` in the browser and degrades to a
  direct link if the request fails.
- Stack icons come from `simple-icons`, with `devicon` covering Java, C# and
  VS Code — removed upstream for trademark reasons.
- Motion is one scroll reveal per element, then the observer disconnects.
  `prefers-reduced-motion` disables it.

## Interactivity

- **Stack chips are buttons.** Clicking one opens a panel saying where that tool
  is actually used and in which projects. Tools with no repo behind them say so
  rather than staying silent — the claim stays checkable.
- **Sound.** Synthesised with Web Audio, not audio files: a click is a short
  filtered blip, so it costs nothing to download. Off by default, toggled from
  the dock, and the choice persists.
- **Floating dock nav** with backdrop blur and an active-section pill.
- Live Manila clock, capability rotator, click-to-copy email, console greeting.

## GitHub data

Both GitHub panels read from `/api/github`, a Vercel function that fetches on the
server and caches at the edge for thirty minutes. One request serves every
visitor, so nobody spends their own rate limit.

GitHub allows sixty unauthenticated requests an hour **per IP**. The page used to
make five per load, which is fine alone and not fine for a recruiter behind an
office NAT sharing one address with two hundred colleagues.

Set `GITHUB_TOKEN` in Vercel to raise the server limit to 5,000/hour. Optional.
Without a deploy the client falls back to calling GitHub directly, so `npm run dev`
still shows real data.

## Source visibility

The deployed site ships built assets only: one minified JS bundle, one CSS file,
the fonts, the images and index.html. No source maps, so the TypeScript and the
component structure are not reconstructable from the browser. The generator, the
data files, the API handlers and the SQL never leave the build.

Anyone can still read the minified bundle, because that is how the web works.
There is no way to run code in a browser and hide it from that browser. What
matters is that nothing sensitive lives in the client: the keys are all server
side in the API routes, and those run on Vercel, not in the page.

## Deploying

```bash
npx vercel
```

Then set these in Vercel, Settings, Environment Variables. Apply each to
Production, Preview and Development, and redeploy after adding them.

| Variable | Needed for | Where to get it |
|---|---|---|
| `GROQ_API_KEY` | Kit, the assistant | console.groq.com, API Keys. Starts `gsk_` |
| `SUPABASE_URL` | Recommendations | Supabase, Project Settings, Data API |
| `SUPABASE_SERVICE_ROLE_KEY` | Writing a recommendation | Same page. **Server only, never ship this to a browser** |
| `SUPABASE_ANON_KEY` | Reading approved ones | Same page. Safe to expose, but this site keeps it server side anyway |
| `IP_SALT` | Rate limiting | Any random string you invent |
| `GITHUB_TOKEN` | Optional | Raises the GitHub limit from 60 to 5,000 an hour |

Every endpoint degrades on its own. Missing `GROQ_API_KEY` and Kit says it is
not configured. Missing the Supabase pair and the recommendations list simply
stays empty. Nothing crashes.

## Recommendations

Visitors submit through the form in `<RECOMMENDATIONS/>`. Nothing appears on the
site until you approve it.

**One-time setup:** open the Supabase SQL editor and run
[`supabase/schema.sql`](supabase/schema.sql). It creates the table, the indexes,
and a row level security policy that lets the public read approved rows only.

**Approving:** Supabase, Table Editor, `recommendations`, flip `approved` to
true. It shows up within five minutes, which is the cache window.

Submissions are guarded four ways: a honeypot field bots fill and humans cannot
see, length limits enforced on the server as well as in the form, an email
format check, and a limit of three per hour per visitor. The visitor's IP is
hashed with `IP_SALT` before storage, so the raw address is never kept.

Emails collected are for you to reply to. They are never returned by the read
endpoint and never rendered.

## The assistant

**Kit** is the assistant. `<ASK-AI/>` posts to `/api/chat`, a Vercel serverless function that proxies to
Groq. The key lives on the server — visitors are never asked for one.

**Setup:** in Vercel → Settings → Environment Variables, add `GROQ_API_KEY`.
Without it the endpoint returns a clear "not configured yet" message rather
than failing silently.

The system prompt is built from `aiContext` in `src/data/site.js`, so the
assistant can only speak from facts that are already on this page. It is told
not to invent experience, to keep answers to a few sentences, and to redirect
anything off-topic to the contact address. Update the facts there, not the
prompt.

`npm run dev` serves the static site only — `/api/chat` needs `vercel dev`
(or a deploy) to run.

## Still to do

- LinkedIn URL and résumé PDF — `src/data/site.js`
- Screenshots for Studs and Agos
- Agos project row once the repo is public
