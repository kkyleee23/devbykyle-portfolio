import type { Status } from "@/data/projects";

export function Badge({ status, children }: { status: Status; children: string }) {
  const tone =
    status === "live"
      ? "bg-live-wash text-live"
      : "bg-sunk text-ink-3";
  return (
    <span
      className={`${tone} rounded-sm px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.07em] whitespace-nowrap`}
    >
      {children}
    </span>
  );
}

export function Tag({ children }: { children: string }) {
  return (
    <li className="rounded-sm border border-rule px-2.5 py-1 font-mono text-[11px] tracking-[0.05em] text-ink-2">
      {children}
    </li>
  );
}

export function Tags({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </ul>
  );
}

/**
 * The constraint strip. This is the differentiator — verifiable numbers a
 * generated portfolio can't invent, presented as a spec sheet rather than
 * marketing copy.
 */
export function Spec({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap border-y border-rule">
      {items.map((s, i) => (
        <li
          key={s}
          className={`py-2.5 pr-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-2 ${
            i < items.length - 1 ? "mr-4 border-r border-rule" : ""
          }`}
        >
          {s}
        </li>
      ))}
    </ul>
  );
}

export function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="inline-block transition-transform duration-200 group-hover:translate-x-1"
    >
      →
    </span>
  );
}
