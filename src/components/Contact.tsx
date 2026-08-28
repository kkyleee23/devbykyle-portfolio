import { site } from "@/data/site";

export function Contact() {
  return (
    <section id="contact" className="border-b border-rule py-20 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-9">
        <div className="grid gap-y-5 md:grid-cols-[7rem_1fr] md:gap-x-14 lg:gap-x-20">
          <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-1.5">
            <span className="font-mono text-[11px] font-medium tracking-[0.11em] text-rule-2">
              06
            </span>
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.11em] text-ink-3">
              Contact
            </h2>
          </div>

          <div>
            <p className="max-w-[15ch] font-display text-[clamp(2.1rem,5.4vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.038em] text-balance">
              Got something that needs building?
            </p>
            <p className="mt-5 max-w-[48ch] text-ink-2">
              Open to internships, junior roles and freelance work — remote, or hybrid
              around Pampanga and Metro Manila. I&rsquo;m in school on weekdays but free
              from 2 PM, and all day Sunday. I reply within a day.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-8 inline-block border-b-2 border-accent pb-1 font-mono text-[clamp(0.85rem,2vw,1.15rem)] tracking-[-0.02em] transition-colors hover:text-accent"
            >
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
