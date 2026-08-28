import Image from "next/image";
import { projects, type Project } from "@/data/projects";
import { Band, BandSub, BandTitle } from "./Band";
import { Arrow, Badge, Spec, Tags } from "./ui";

function Phones({ shots }: { shots: Project["shots"] }) {
  return (
    <div className="flex justify-center gap-4 sm:gap-5">
      {shots.slice(0, 3).map((s, i) => (
        <div
          key={s.src}
          className={`w-[31%] max-w-[200px] overflow-hidden rounded-xl border border-rule-2 bg-sunk shadow-[0_12px_34px_-20px_rgb(0_0_0/0.55)] ${
            i === 2 ? "hidden sm:block" : ""
          }`}
        >
          <Image
            src={s.src}
            alt={s.alt}
            width={s.width}
            height={s.height}
            sizes="(max-width: 640px) 45vw, 200px"
            className="h-auto w-full"
          />
        </div>
      ))}
    </div>
  );
}

function Browser({ shot }: { shot: Project["shots"][number] }) {
  return (
    <div className="overflow-hidden rounded-md border border-rule bg-surface">
      <div className="flex gap-1.5 border-b border-rule bg-sunk px-3.5 py-2.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 rounded-full bg-rule-2" aria-hidden="true" />
        ))}
      </div>
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes="(max-width: 900px) 100vw, 50vw"
        className="h-auto w-full"
      />
    </div>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <div className="grid aspect-[16/10] place-items-center rounded-sm border border-dashed border-rule-2 bg-sunk">
      <span className="px-4 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
        {name} — screenshot to come
      </span>
    </div>
  );
}

function Visual({ p }: { p: Project }) {
  if (p.kind === "phone" && p.shots.length) return <Phones shots={p.shots} />;
  if (p.kind === "web" && p.shots.length) return <Browser shot={p.shots[0]} />;
  return <Placeholder name={p.name} />;
}

function Row({ p, i }: { p: Project; i: number }) {
  const idx = String(i + 1).padStart(2, "0");

  // The lead project gets the full width. Hierarchy by importance beats a zigzag.
  if (p.feature) {
    return (
      <article className="border-t border-rule pt-10 pb-14 md:pt-12 md:pb-16">
        <Head p={p} idx={idx} />
        <div className="mt-8">
          <Visual p={p} />
        </div>
      </article>
    );
  }

  return (
    <article className="grid items-center gap-7 border-t border-rule py-12 md:grid-cols-2 md:gap-12 md:py-14">
      <div className="order-2 md:order-1">
        <Head p={p} idx={idx} />
      </div>
      <div className="order-1 md:order-2">
        <Visual p={p} />
      </div>
    </article>
  );
}

function Head({ p, idx }: { p: Project; idx: string }) {
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span
          className="font-display text-[clamp(3.6rem,7.2vw,6.7rem)] font-extralight leading-[0.78] tracking-[-0.05em] text-rule-2 tabular-nums"
          style={{ fontVariationSettings: "'opsz' 96, 'wdth' 100" }}
          aria-hidden="true"
        >
          {idx}
        </span>
        <Badge status={p.status}>{p.statusLabel}</Badge>
      </div>

      <h3 className="mt-1 font-display text-[clamp(1.6rem,3vw,2.15rem)] font-semibold tracking-[-0.03em]">
        {p.name}
      </h3>

      <p className="mt-3 max-w-[52ch] text-ink-2">{p.summary}</p>

      {p.spec.length > 0 && <Spec items={p.spec} />}
      <Tags items={p.tags} />

      <div className="mt-6 flex flex-wrap gap-6">
        {p.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`group inline-flex items-center gap-2 border-b pb-0.5 pt-1.5 text-sm font-semibold ${
              l.primary
                ? "border-accent"
                : "border-rule-2 text-ink-2 hover:text-ink"
            }`}
          >
            {l.label}
            {l.primary && <Arrow />}
          </a>
        ))}
      </div>
    </>
  );
}

export function Work() {
  return (
    <Band id="work" num="02" label="Selected work" size="loud">
      <BandTitle>Three shipped tools, one problem.</BandTitle>
      <BandSub>
        Everything here started as something that annoyed me at school. Each one links to
        the source, and to the live build where there is one.
      </BandSub>
      <div className="mt-10">
        {projects.map((p, i) => (
          <Row key={p.slug} p={p} i={i} />
        ))}
      </div>
    </Band>
  );
}
