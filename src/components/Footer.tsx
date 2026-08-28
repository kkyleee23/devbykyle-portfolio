import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1200px] flex-wrap justify-between gap-4 px-5 py-9 pb-14 sm:px-8 lg:px-9">
      <p className="font-mono text-[11px] tracking-[0.06em] text-ink-3">
        © {new Date().getFullYear()} {site.name} · Apalit, Pampanga
      </p>
      <nav className="flex gap-5 font-mono text-[11px] tracking-[0.06em] text-ink-3">
        <a href={site.github} className="transition-colors hover:text-accent">
          GitHub
        </a>
        <a href={`mailto:${site.email}`} className="transition-colors hover:text-accent">
          Email
        </a>
        {site.linkedin && (
          <a href={site.linkedin} className="transition-colors hover:text-accent">
            LinkedIn
          </a>
        )}
      </nav>
    </footer>
  );
}
