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

## Still to do

- LinkedIn URL and résumé PDF — `src/data/site.js`
- Screenshots for Studs and Agos
- Agos project row once the repo is public
