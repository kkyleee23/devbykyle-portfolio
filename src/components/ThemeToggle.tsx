"use client";

import { useSyncExternalStore } from "react";

type Mode = "light" | "dark" | "system";
const EVENT = "themechange";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

/** Source of truth is the DOM attribute, which the no-flash script sets before paint. */
function getSnapshot(): Mode {
  const v = document.documentElement.getAttribute("data-theme");
  return v === "dark" ? "dark" : v === "light" ? "light" : "system";
}

/** The server has no idea what the viewer prefers, so it always renders "system". */
function getServerSnapshot(): Mode {
  return "system";
}

function apply(next: Mode) {
  const root = document.documentElement;
  if (next === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", next);
  try {
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
  } catch {
    /* private mode: the page still renders correctly, the choice just won't persist */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const order: Mode[] = ["system", "light", "dark"];
  const label =
    mode === "system" ? "System theme" : mode === "light" ? "Light theme" : "Dark theme";

  return (
    <button
      type="button"
      onClick={() => apply(order[(order.indexOf(mode) + 1) % order.length])}
      aria-label={`${label}. Click to change.`}
      title={label}
      className="grid size-11 shrink-0 place-items-center rounded-sm text-ink-2 transition-colors hover:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        width="17"
        height="17"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        {mode === "system" ? (
          <>
            <rect x="2.5" y="4" width="19" height="13" rx="1.6" />
            <path d="M8 20h8" />
          </>
        ) : mode === "light" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  );
}
