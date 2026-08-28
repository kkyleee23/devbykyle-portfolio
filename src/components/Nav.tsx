import Link from "next/link";
import { site } from "@/data/site";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "#top", label: "Home" },
  { href: "#work", label: "Projects" },
  { href: "#stack", label: "Stack" },
  { href: "#github", label: "GitHub" },
  { href: "#about", label: "About" },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-rule bg-paper/90 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[1fr_auto] items-center gap-x-4 px-5 pt-3 sm:px-8 md:flex md:gap-7 md:py-0 lg:px-9">
        <Link
          href="#top"
          className="font-display text-[17px] font-bold tracking-[-0.03em] md:shrink-0"
        >
          <span className="text-ink-3">dev</span>ByKyle
        </Link>

        {/* Scrolls rather than hides on phones — nav that disappears is nav that doesn't exist */}
        <div className="order-3 col-span-2 -mx-5 flex gap-5 overflow-x-auto px-5 pb-2.5 [scrollbar-width:none] md:order-none md:mx-0 md:min-w-0 md:flex-1 md:gap-6 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="shrink-0 border-b-2 border-transparent py-3 text-sm font-medium whitespace-nowrap text-ink-2 transition-colors hover:border-accent hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        {site.openToWork && (
          <span className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.085em] text-ink-2 lg:flex">
            <span className="size-1.5 rounded-full bg-live" aria-hidden="true" />
            Open to work
          </span>
        )}

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a
            href={`mailto:${site.email}`}
            className="rounded-sm border border-ink bg-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-paper transition-colors hover:bg-transparent hover:text-ink"
          >
            Get in touch
          </a>
        </div>
      </div>
    </nav>
  );
}
