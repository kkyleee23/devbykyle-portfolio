import type { ReactNode } from "react";

/**
 * Every section shares one spine: a sticky index rail on the left, content on
 * the right. It gives the page a vertical structure that persists as you
 * scroll, and it respects left-side reading bias. Collapses to a single row
 * under 900px.
 */
export function Band({
  id,
  num,
  label,
  children,
  size = "normal",
  last = false,
}: {
  id?: string;
  num: string;
  label: string;
  children: ReactNode;
  /** Padding encodes importance. Work is the loudest, Stack the quietest. */
  size?: "quiet" | "normal" | "loud";
  last?: boolean;
}) {
  const pad =
    size === "loud"
      ? "py-20 md:py-32"
      : size === "quiet"
        ? "py-14 md:py-16"
        : "py-16 md:py-24";

  return (
    <section
      id={id}
      className={`${pad} ${last ? "" : "border-b border-rule"}`}
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-9">
        <div className="grid gap-y-5 md:grid-cols-[7rem_1fr] md:gap-x-14 lg:gap-x-20">
          <div className="flex items-baseline gap-3 md:sticky md:top-24 md:flex-col md:items-start md:gap-1.5 md:self-start">
            <span className="font-mono text-[11px] font-medium tracking-[0.11em] text-rule-2 tabular-nums">
              {num}
            </span>
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.11em] text-ink-3">
              {label}
            </h2>
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** The headline inside a band. Kept separate so the rail label stays the h2. */
export function BandTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="max-w-[20ch] font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-balance">
      {children}
    </h3>
  );
}

export function BandSub({ children }: { children: ReactNode }) {
  return <p className="mt-3.5 max-w-[58ch] text-ink-2">{children}</p>;
}
