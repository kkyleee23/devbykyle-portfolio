import Image from "next/image";
import { site } from "@/data/site";

export function Hero() {
  return (
    <header id="top" className="border-b border-rule">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 md:py-24 lg:px-9">
        <div className="grid items-start gap-10 md:grid-cols-[1.5fr_0.82fr] md:gap-16">
          <div>
            <p className="rise font-mono text-[11px] font-medium uppercase tracking-[0.11em] text-ink-3 [animation-delay:40ms]">
              {site.name} <span className="text-accent">—</span> {site.role}
            </p>

            {/* wdth 84 + wght 800 is where Bricolage stops looking like every other grotesque */}
            <h1
              className="rise mt-5 max-w-[13ch] font-display text-[clamp(2.5rem,6.4vw,5.1rem)] font-extrabold leading-[0.94] tracking-[-0.045em] text-balance [animation-delay:100ms]"
              style={{ fontVariationSettings: "'opsz' 96, 'wdth' 84" }}
            >
              {site.headline}
            </h1>

            <p className="rise mt-6 max-w-[54ch] text-[1.15rem] leading-[1.45] [animation-delay:160ms]">
              {site.lede}
            </p>

            <div className="rise mt-7 flex flex-wrap gap-x-7 gap-y-2 text-[13.5px] text-ink-2 [animation-delay:160ms]">
              <span>
                {site.location} · {site.timezone}
              </span>
              <span>{site.school}</span>
              <span>{site.availability}</span>
            </div>

            <div className="rise mt-8 flex flex-wrap items-center gap-2.5 [animation-delay:220ms]">
              <a
                href={`mailto:${site.email}`}
                className="rounded-sm border border-ink bg-ink px-[17px] py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                Email me
              </a>
              <a
                href={site.github}
                className="rounded-sm border border-rule-2 px-[17px] py-2.5 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                GitHub
              </a>
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  className="border-b border-rule-2 py-1 text-sm font-medium text-ink-2 transition-colors hover:border-accent hover:text-ink"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          <div className="rise [animation-delay:220ms]">
            <div className="relative aspect-[3/2] overflow-hidden rounded-sm border border-rule bg-sunk md:aspect-[4/5]">
              <Image
                src="/img/kyle.jpg"
                alt={`${site.name}, ${site.role}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
