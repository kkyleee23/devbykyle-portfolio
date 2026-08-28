import { stack, type Tool } from "@/data/stack";
import { Band, BandSub, BandTitle } from "./Band";

function Chip({ t }: { t: Tool }) {
  return (
    <li
      className={`flex items-center gap-2.5 rounded-[3px] border px-3 py-2 text-sm font-medium transition-colors ${
        t.shipped
          ? "border-rule-2 bg-sunk"
          : "border-rule bg-surface hover:border-rule-2"
      }`}
      style={
        t.color
          ? ({ "--bc": t.color, "--bc-d": t.darkColor ?? t.color } as React.CSSProperties)
          : undefined
      }
    >
      <svg
        viewBox={t.color ? "0 0 24 24" : "0 0 128 128"}
        width="16"
        height="16"
        aria-hidden="true"
        className={t.color ? "brand-ic shrink-0" : "shrink-0"}
        dangerouslySetInnerHTML={{ __html: t.svg }}
      />
      {t.name}
      {t.shipped && (
        <span
          className="size-[5px] shrink-0 rounded-full bg-accent"
          title="Used in a public repo"
          aria-label="used in shipped code"
        />
      )}
    </li>
  );
}

export function Stack() {
  return (
    <Band id="stack" num="03" label="Stack" size="quiet">
      <BandTitle>What I reach for</BandTitle>
      <BandSub>
        Everything I work with. The marked ones you can go and read in a public repo
        today — the rest I am still building fluency in.
      </BandSub>

      <p className="mt-5 flex items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-ink-3">
        <span className="size-[5px] rounded-full bg-accent" aria-hidden="true" />
        Used in shipped, public code
      </p>

      <div className="mt-6">
        {stack.map((g) => (
          <div
            key={g.label}
            className="grid gap-4 border-t border-rule py-6 md:grid-cols-[9rem_1fr] md:gap-10"
          >
            <div>
              <h3 className="font-mono text-[13px] font-medium tracking-[-0.005em]">
                {g.label}
              </h3>
              <p className="mt-1 font-mono text-[11px] tracking-[0.06em] text-ink-3">
                {g.tools.length}
              </p>
            </div>
            <ul className="flex flex-wrap content-start gap-2">
              {g.tools.map((t) => (
                <Chip key={g.label + t.name} t={t} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Band>
  );
}
