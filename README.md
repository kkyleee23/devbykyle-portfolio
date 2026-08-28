# devByKyle — portfolio

Personal site for Juniz Kyle Sarmiento. Next.js 16 App Router, React 19, Tailwind v4, TypeScript.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the build
```

## How it is put together

```
src/
  app/
    layout.tsx      fonts, metadata, the no-flash theme script
    globals.css     design tokens (Tailwind v4 @theme) + grain + motion
    page.tsx        section order
  components/
    Band.tsx        the section shell — sticky index rail + content
    Nav.tsx  Hero.tsx  Now.tsx  Work.tsx  Stack.tsx
    GithubPanel.tsx live repo data from the GitHub API
    About.tsx  Contact.tsx  Footer.tsx
    ThemeToggle.tsx light / dark / system
    ui.tsx          Badge, Tag, Spec strip
  data/
    site.ts         name, contact, about copy, education timeline
    projects.ts     projects and the "right now" cards
    stack.ts        generated — 40 tools with inline brand SVGs
public/img/         screenshots and portrait
design-system/      the locked design decisions
```

Content lives in `src/data`. Editing those three files changes the whole site; the
components never hardcode copy.

## Design decisions

Locked in [`design-system/devbykyle/MASTER.md`](design-system/devbykyle/MASTER.md).

- **Type** — Bricolage Grotesque (display, using its `wdth` axis at 84), Instrument
  Sans (body), DM Mono (labels only, never negative tracking, 11px floor).
- **Colour** — warm-neutral monochrome with one Swiss red. Red means exactly one
  thing: live or clickable.
- **Structure** — every section shares a sticky left index rail. Padding varies by
  importance: Work is the loudest band, Stack the quietest.
- **Spec strips** — each project states its real constraints. Verifiable numbers
  beat adjectives.
- **Grain** — a fine SVG noise overlay. Flat surfaces read as generated.

The file also carries a hard-ban list: no neon accents, no gradient heroes, no
glassmorphism, no looping animation, no percentage skill bars, no emoji icons.

## Data notes

- The GitHub panel fetches `api.github.com` on the server and revalidates hourly,
  so the page cannot drift out of date with the repos.
- Stack icons come from `simple-icons`, with `devicon` covering Java, C# and
  VS Code — those were removed upstream for trademark reasons.
- Tools marked with a red dot appear in a public repo. That claim is checkable,
  which is the point.

## Still to do

- LinkedIn URL and a résumé PDF (`src/data/site.ts`)
- Screenshots for Studs and Agos
- Agos project row, once the repo is public
- Contact form (route handler + Resend) if the mailto link is not enough
