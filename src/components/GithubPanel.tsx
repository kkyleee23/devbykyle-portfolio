import { site } from "@/data/site";
import { Band, BandSub, BandTitle } from "./Band";

type Repo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  fork: boolean;
  homepage: string | null;
};

/**
 * Real data, fetched on the server and cached for an hour. The earlier draft
 * used a decorative contribution graph filled with random values — showing
 * invented activity is worse than showing none.
 */
async function getRepos(): Promise<Repo[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${site.githubHandle}/repos?per_page=100&sort=pushed`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;
    const all: Repo[] = await res.json();
    return all
      .filter((r) => !r.fork && r.name.toLowerCase() !== site.githubHandle.toLowerCase())
      .slice(0, 6);
  } catch {
    return null;
  }
}

function when(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

export async function GithubPanel() {
  const repos = await getRepos();

  return (
    <Band id="github" num="04" label="GitHub">
      <BandTitle>Where the work lives</BandTitle>
      <BandSub>
        Pulled live from the GitHub API, so this page cannot drift out of date with the
        code.
      </BandSub>

      <div className="mt-7 overflow-hidden rounded-sm border border-rule bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule px-6 py-5">
          <a
            href={site.github}
            className="font-mono text-sm font-medium tracking-[-0.02em] transition-colors hover:text-accent"
          >
            github.com/{site.githubHandle}
          </a>
          <span className="font-mono text-[11px] tracking-[0.06em] text-ink-3">
            Shipped Mar &amp; May 2026
          </span>
        </div>

        {repos ? (
          <ul>
            {repos.map((r) => (
              <li key={r.name} className="border-t border-rule px-6 py-5 first:border-t-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <a
                    href={r.html_url}
                    className="border-b border-accent pb-0.5 font-mono text-[15px] font-medium tracking-[-0.01em]"
                  >
                    {r.name}
                  </a>
                  {r.homepage && (
                    <a
                      href={r.homepage}
                      className="font-mono text-[11px] tracking-[0.05em] text-ink-3 transition-colors hover:text-accent"
                    >
                      live ↗
                    </a>
                  )}
                </div>
                {r.description && (
                  <p className="mt-2 max-w-[58ch] text-[15px] text-ink-2">{r.description}</p>
                )}
                <p className="mt-2 font-mono text-[11px] tracking-[0.06em] text-ink-3">
                  {r.language ?? "—"} <span className="text-rule-2">·</span> updated{" "}
                  {when(r.pushed_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-8 font-mono text-[11px] tracking-[0.06em] text-ink-3">
            Could not reach the GitHub API just now —{" "}
            <a href={site.github} className="text-accent underline">
              browse the repos directly
            </a>
            .
          </p>
        )}
      </div>
    </Band>
  );
}
