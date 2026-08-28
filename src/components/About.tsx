import { about, timeline } from "@/data/site";
import { Band, BandTitle } from "./Band";

export function About() {
  return (
    <Band id="about" num="05" label="Background">
      <BandTitle>How I got here</BandTitle>

      <div className="mt-6 flex max-w-[62ch] flex-col gap-4">
        {about.map((p, i) => (
          <p key={i} className={i === 0 ? "text-[1.15rem] leading-[1.45]" : "text-ink-2"}>
            {p}
          </p>
        ))}
      </div>

      <div className="mt-10">
        {timeline.map((t) => (
          <div
            key={t.when + t.title}
            className="grid gap-2 border-t border-rule py-5 md:grid-cols-[9rem_1fr] md:gap-8"
          >
            <p className="pt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
              {t.when}
            </p>
            <div>
              <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{t.title}</h3>
              <p className="mt-1.5 max-w-[58ch] text-[15.5px] text-ink-2">{t.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Band>
  );
}
