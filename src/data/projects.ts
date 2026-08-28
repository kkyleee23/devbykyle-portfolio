export type Status = "live" | "building" | "redeploying";

export type Shot = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Project = {
  slug: string;
  name: string;
  status: Status;
  statusLabel: string;
  summary: string;
  /** Hard constraints. These are the differentiator — real numbers only. */
  spec: string[];
  tags: string[];
  links: { label: string; href: string; primary?: boolean }[];
  kind: "phone" | "web" | "none";
  shots: Shot[];
  /** The lead project gets a full-bleed row. */
  feature?: boolean;
};

export const projects: Project[] = [
  {
    slug: "planora",
    name: "Planora",
    status: "live",
    statusLabel: "Live",
    summary:
      "A free task manager for Android and web with a built-in AI assistant called Nora. Tasks, notes, and goals in one place — no accounts, no ads, works offline.",
    spec: ["Under 5 MB", "Works offline", "No account", "Android + Web"],
    tags: ["HTML", "CSS", "JavaScript", "Vercel"],
    links: [
      { label: "Visit the site", href: "https://planora-official.vercel.app", primary: true },
      { label: "Source", href: "https://github.com/kkyleee23/Planora-Official" },
    ],
    kind: "phone",
    feature: true,
    shots: [
      { src: "/img/planora-dashboard.png", alt: "Planora dashboard showing tasks and progress", width: 1080, height: 2400 },
      { src: "/img/planora-dark.png", alt: "Planora in dark mode", width: 1080, height: 2400 },
      { src: "/img/planora-tasks.png", alt: "Planora task list", width: 1080, height: 2400 },
    ],
  },
  {
    slug: "printscreen",
    name: "PrintScreen",
    status: "redeploying",
    statusLabel: "Redeploying",
    summary:
      "Upload a PDF, PPTX, DOCX, XLSX or image and get back a structured reviewer — a summary, key terms, flashcards and a practice quiz. Parsing runs server-side before anything reaches a model.",
    spec: ["5 file types", "Express API", "Groq + Gemini"],
    tags: ["Node.js", "Express", "Groq", "Gemini", "Render"],
    links: [
      { label: "Source", href: "https://github.com/kkyleee23/PrintScreen", primary: true },
      { label: "Preview on Render", href: "https://printscreen.onrender.com" },
    ],
    kind: "web",
    shots: [
      { src: "/img/printscreen-1.png", alt: "PrintScreen turning an uploaded document into a reviewer", width: 2442, height: 1166 },
    ],
  },
  {
    slug: "studs",
    name: "Studs",
    status: "building",
    statusLabel: "Building",
    summary:
      "Student–teacher management that runs outside the LMS your school already has. Teachers get attendance, activities and scores in one place without waiting on IT to provision anything.",
    spec: ["8 screens", "Repo-per-entity data layer", "No framework"],
    tags: ["Vite", "JavaScript", "Supabase", "PostgreSQL"],
    links: [{ label: "Source", href: "https://github.com/kkyleee23/Studs", primary: true }],
    kind: "none",
    shots: [],
  },
];

export type NowCard = {
  title: string;
  badge: string;
  status: Status;
  body: string;
  tags: string[];
  foot: string;
};

export const nowCards: NowCard[] = [
  {
    title: "Agos",
    badge: "Building",
    status: "building",
    body: "Crowdsourced hazard reporting for the Philippines. Drop a pin, tag it flood, traffic or landslide, add a photo or a note, and everyone else on the map sees it.",
    tags: ["Flutter", "Dart", "Geolocation"],
    foot: "v1.0.1 built — repo not public yet",
  },
  {
    title: "Nora",
    badge: "Fixing",
    status: "building",
    body: "Planora's built-in assistant. Right now it answers without enough of your board in front of it, so I'm rebuilding the context it gets before it replies.",
    tags: ["JavaScript", "Prompt design", "LLM"],
    foot: "Part of Planora",
  },
  {
    title: "Learning",
    badge: "Ongoing",
    status: "live",
    body: "Working through certifications worth putting on this page, and finishing senior high before a degree. Past that I learn by building — a project teaches me more than a course does.",
    tags: ["Certifications", "Grade 12", "Side projects"],
    foot: "Weekday afternoons & Sundays",
  },
];
