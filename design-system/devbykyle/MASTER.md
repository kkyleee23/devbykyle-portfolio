# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** devbykyle
**Generated:** 2026-08-28 09:00:48
**Category:** Portfolio/Personal
**Design Dials:** Variance 3/10 (Centered / Minimal) | Motion 2/10 (Subtle) | Density 4/10 (Standard)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#18181B` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#3F3F46` | `--color-secondary` |
| On Secondary | `#FFFFFF` | `--color-on-secondary` |
| Accent/CTA | `#B22A22` | `--color-accent` |
| On Accent/CTA | `#FFFFFF` | `--color-on-accent` |
| Accent (dark mode) | `#F0736A` | `--color-accent` |
| Background | `#FAFAFA` | `--color-background` |
| Foreground | `#09090B` | `--color-foreground` |
| Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#09090B` | `--color-card-foreground` |
| Muted | `#E8ECF0` | `--color-muted` |
| Muted Foreground | `#475569` | `--color-muted-foreground` |
| Border | `#E4E4E7` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Ring | `#18181B` | `--color-ring` |

**Color Notes:** Monochrome ground + a single Swiss red accent.

> **Accent overridden manually.** The generator returned `#2563EB` — the default blue that ships with every AI-generated interface. Replaced with a restrained Swiss red, which is historically native to the International Typographic Style the generator itself selected (Müller-Brockmann's monochrome grid plus one red). Contrast on `#FAFAFA` is ~5.5:1, passing AA for text.

**Accent discipline — this is the whole colour strategy:** the page is monochrome. Red appears on active nav state, links on hover, one hero detail, and status badges. Nothing else. If a second accent hue ever feels necessary, the layout is doing too little work.

### Typography

> **Overridden manually.** The generator returned Caveat / Quicksand (handwritten, "friendly, casual, charming") — wrong register for a hiring-facing engineering portfolio. The `--domain typography` searches returned Inter (an AI-default tell) or all-mono Brutalist. Decision below is a triple stack derived from the DB's "Developer Mono" (IBM Plex Sans) and "News Editorial" (Newsreader) results.

- **Display Font:** Newsreader — editorial serif, carries the human voice. Headlines and section headings only.
- **Body / UI Font:** IBM Plex Sans — engineered grotesque. All running text, nav, buttons, labels.
- **Utility Font:** IBM Plex Mono — section eyebrows, tags, dates, status badges, metadata.
- **Mood:** professional, editorial, engineered, restrained, credible

**Why this stack:** the serif carries warmth and voice; the Plex grotesque carries technical credibility; the mono carries the structural section-labelling motif. Three faces, three distinct jobs — never decoration.

**Banned faces on this project:** Inter, Space Grotesk, Playfair Display, Poppins, Montserrat, Caveat, Quicksand. Each is either an AI-generated-design tell or the wrong register.

**Google Fonts:** [Newsreader + IBM Plex Sans + IBM Plex Mono](https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap');
```

**Type roles:**
| Role | Face | Notes |
|------|------|-------|
| Hero headline | Newsreader 500 | `text-wrap: balance`, tight leading |
| Section heading | Newsreader 500 | |
| Body / long-form | IBM Plex Sans 400 | ~65ch measure, 1.6 line-height |
| Nav, buttons, labels | IBM Plex Sans 500/600 | |
| Eyebrows, tags, status | IBM Plex Mono 500 | uppercase, `letter-spacing: .1em` |

### Spacing Variables

*Density: 4/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #2563EB;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #18181B;
  border: 2px solid #18181B;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FAFAFA;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #18181B;
  outline: none;
  box-shadow: 0 0 0 3px #18181B20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Minimalism & Swiss Style

**Keywords:** Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential

**Best For:** Enterprise apps, dashboards, documentation sites, SaaS platforms, professional tools

**Key Effects:** Subtle hover (200-250ms), smooth transitions, sharp shadows if any, clear type hierarchy, fast loading

### Page Pattern

**Pattern Name:** Scroll-Triggered Storytelling

- **Conversion Strategy:** Keep the narrative understandable without scroll-driven effects. Use progress indicator. Mobile: simplify animations. Keep DOM reading order complete; disable parallax and scroll-scrub under reduced motion. Pause scroll animation when offscreen or hidden and render each chapter in its final readable state under reduced motion.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Section Order:** Intro hook > Chapter 1 (problem) > Chapter 2 (journey) > Chapter 3 (solution) > Climax CTA

---

## Motion

**Scroll Reveal** (Subtle) — Trigger: scroll (viewport enter) | Duration: 300-400ms | Easing: `power1.out`

```js
gsap.from(el, { opacity: 0, y: 12, duration: 0.35, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
```

**Framework notes:** Requires the ScrollTrigger plugin registered once via gsap.registerPlugin(ScrollTrigger); Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately

- ✅ Keep the y offset small (8-16px) so it reads as a fade, not a slide
- ❌ Don't reveal below-the-fold content needed for SEO/crawlers as invisible-by-default without a no-JS fallback
- ⚡ toggleActions 'play none none reverse' avoids re-triggering on every scroll direction change

---

## The Brief

**Structure from Naphier** (`naphiernode.vercel.app`) — multi-page architecture, tag-style section labels, project status badges, a "Currently Building" block, experience timeline.

**Essence from Rey** (`devbyrey.me`) — sharp niche positioning instead of a generic job title, outcome-led project blurbs with real numbers, a human first-person voice in the About, skills grouped by category.

Naphier's skeleton, Rey's soul. Neither site's visual language — that is ours.

---

## Anti-Patterns (Do NOT Use)

- ❌ Corporate templates
- ❌ Generic layouts

### AI-Generated-Design Tells — hard bans on this project

These are the reason the project exists in this form. Violating any of them is a rebuild, not a tweak.

- ❌ **Neon / electric accents** — no `#22C55E`, no cyan, no acid green, no glow effects
- ❌ **Purple-to-blue gradient heroes** — no gradient hero backgrounds of any kind
- ❌ **Blinking, pulsing, or looping ambient animation** — motion fires once on reveal, then stops
- ❌ **Glassmorphism / blurred translucent cards** — flat surfaces, real borders
- ❌ **Everything centered** — Swiss means a grid with deliberate asymmetry
- ❌ **`rounded-lg` on everything** — radii are 0–4px on this project, applied consistently
- ❌ **Accent bars/rails on rounded cards** — the single most recognisable AI-portfolio tell
- ❌ **Emoji as section markers or icons** — SVG only (Lucide or Simple Icons for brand marks)
- ❌ **Percentage skill bars** ("React 85%") — skills group by category, never by invented number
- ❌ **Typewriter / text-scramble hero effects**
- ❌ **Floating particle or animated-mesh backgrounds**
- ❌ **Dark mode as the only mode** — both themes get equal care

### Copy Anti-Patterns

- ❌ **"Passionate developer crafting elegant solutions"** and every variant of it
- ❌ **Rule-of-three everywhere** ("fast, accessible, and beautiful")
- ❌ **Em-dash-heavy AI cadence** in body copy
- ❌ **Claims without evidence** — every capability statement points at a project that proves it
- ❌ **Empty sections with a call-to-action** — if there is no content yet, the section does not ship

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
