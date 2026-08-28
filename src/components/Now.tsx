import { nowCards } from "@/data/projects";
import { Band, BandTitle } from "./Band";
import { Badge, Tags } from "./ui";

export function Now() {
  return (
    <Band id="now" num="01" label="Right now">
      <BandTitle>What I&rsquo;m building and what I&rsquo;m learning.</BandTitle>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {nowCards.map((c) => (
          <div
            key={c.title}
            className="flex flex-col rounded-sm border border-rule bg-surface p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display text-[1.45rem] font-semibold tracking-[-0.025em]">
                {c.title}
              </h3>
              <Badge status={c.status}>{c.badge}</Badge>
            </div>
            <p className="text-[15.5px] text-ink-2">{c.body}</p>
            <Tags items={c.tags} />
            <p className="mt-auto pt-5 font-mono text-[11px] uppercase tracking-[0.07em] text-ink-3">
              {c.foot}
            </p>
          </div>
        ))}
      </div>
    </Band>
  );
}
